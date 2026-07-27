#!/usr/bin/env python3
"""Build the Star System Simulation and deploy it to free public hosting.

The simulation is a fully static, client-side bundle (HTML + JS + CSS + the
Rust/WASM kernel), so it can be served by any static host. This script targets
**GitHub Pages**, which is free, needs no extra account, and is reachable
through the `gh` CLI you already use for the repository.

What it does, in order:

1. Preflight — check the tools it needs and the state of the repository.
2. Build    — `npm run build` (compiles the Rust kernel to WASM, then bundles).
3. Publish  — commit `dist/` to the `gh-pages` branch via a temporary git
              worktree and push it. The source branch is never touched.
4. Enable   — turn on GitHub Pages for that branch through the GitHub API
              (idempotent; also repoints an existing site if needed).
5. Verify   — poll the public URL until it answers, then print it.

Usage
-----
    python3 scripts/deploy.py                # build + deploy + verify
    python3 scripts/deploy.py --dry-run      # show the plan, change nothing
    python3 scripts/deploy.py --skip-build   # publish the existing ./dist/
    python3 scripts/deploy.py --open         # open the live site when done

See `docs/DEPLOYMENT.md` for the full walk-through and troubleshooting.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

# Repository root: this file lives in <root>/scripts/.
ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

# Files the built bundle must contain for the deployment to be worth pushing.
# The WASM kernel is emitted by the `copy-wasm-package` plugin in vite.config.ts;
# if it is missing the site would silently fall back to the slower TS kernel.
REQUIRED_ARTIFACTS = (
    "index.html",
    "wasm/pkg/star_kernel.js",
    "wasm/pkg/star_kernel_bg.wasm",
)

DEFAULT_BRANCH = "gh-pages"
DEFAULT_MESSAGE = "Deploy star system simulation"

# GitHub Pages builds asynchronously after the push; first-ever deployments are
# the slow case (the site has to be created before it resolves at all).
POLL_TIMEOUT_SECONDS = 300
POLL_INTERVAL_SECONDS = 5


class DeployError(RuntimeError):
    """A failure with a message meant to be read by a human, not a traceback."""


# --------------------------------------------------------------------------- #
# Output helpers
# --------------------------------------------------------------------------- #

_COLOR = sys.stdout.isatty() and os.environ.get("NO_COLOR") is None


def _paint(text: str, code: str) -> str:
    return f"\033[{code}m{text}\033[0m" if _COLOR else text


def step(message: str) -> None:
    print(_paint(f"\n==> {message}", "1;36"), flush=True)


def info(message: str) -> None:
    print(f"    {message}", flush=True)


def warn(message: str) -> None:
    print(_paint(f"    ! {message}", "33"), flush=True)


def success(message: str) -> None:
    print(_paint(f"    ✓ {message}", "32"), flush=True)


# --------------------------------------------------------------------------- #
# Process helpers
# --------------------------------------------------------------------------- #


def run(
    cmd: list[str],
    *,
    cwd: Path | None = None,
    capture: bool = False,
    check: bool = True,
    dry_run: bool = False,
) -> str:
    """Run a command, echoing it. `dry_run` skips *mutating* commands only."""
    printable = " ".join(cmd)
    if dry_run:
        print(_paint(f"    [dry-run] {printable}", "90"), flush=True)
        return ""

    info(_paint(f"$ {printable}", "90"))
    result = subprocess.run(
        cmd,
        cwd=str(cwd or ROOT),
        text=True,
        capture_output=capture,
        check=False,
    )
    if check and result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise DeployError(
            f"Command failed ({result.returncode}): {printable}"
            + (f"\n{detail}" if detail else "")
        )
    return (result.stdout or "").strip() if capture else ""


def capture(cmd: list[str], *, cwd: Path | None = None, check: bool = True) -> str:
    """Run a read-only command and return its stdout (always executes)."""
    return run(cmd, cwd=cwd, capture=True, check=check)


def require_tool(name: str, hint: str) -> None:
    if shutil.which(name) is None:
        raise DeployError(f"`{name}` is not installed or not on PATH.\n  {hint}")


# --------------------------------------------------------------------------- #
# 1. Preflight
# --------------------------------------------------------------------------- #


def resolve_repo(explicit: str | None) -> dict[str, str]:
    """Determine which GitHub repository to publish to."""
    args = ["gh", "repo", "view"]
    if explicit:
        args.append(explicit)
    args += ["--json", "nameWithOwner,visibility,defaultBranchRef"]

    raw = capture(args, check=False)
    if not raw:
        raise DeployError(
            "Could not determine the GitHub repository.\n"
            "  Run this from a clone with a GitHub remote, or pass --repo owner/name."
        )
    data = json.loads(raw)
    return {
        "slug": data["nameWithOwner"],
        "visibility": data["visibility"],
        "default_branch": (data.get("defaultBranchRef") or {}).get("name", "main"),
    }


def preflight(args: argparse.Namespace) -> dict[str, str]:
    step("Preflight")

    require_tool("git", "Install git: https://git-scm.com/downloads")
    require_tool(
        "gh",
        "Install the GitHub CLI: https://cli.github.com/ then run `gh auth login`.",
    )
    if not args.skip_build:
        require_tool("npm", "Install Node.js 18+: https://nodejs.org/")
        require_tool(
            "wasm-pack",
            "Install it with `cargo install wasm-pack` "
            "(or deploy an existing build with --skip-build).",
        )

    if subprocess.run(["gh", "auth", "status"], capture_output=True).returncode != 0:
        raise DeployError("GitHub CLI is not authenticated. Run: gh auth login")
    success("GitHub CLI authenticated")

    repo = resolve_repo(args.repo)
    success(f"Repository: {repo['slug']} ({repo['visibility'].lower()})")
    if repo["visibility"] != "PUBLIC":
        warn(
            "The repository is not public — GitHub Pages on private repositories "
            "requires a paid plan, and the site will not be publicly reachable."
        )

    dirty = capture(["git", "status", "--porcelain"], check=False)
    if dirty:
        warn(
            "Working tree has uncommitted changes; they WILL be included in the "
            "build that gets deployed."
        )

    return repo


# --------------------------------------------------------------------------- #
# 2. Build
# --------------------------------------------------------------------------- #


def build(dry_run: bool) -> None:
    step("Build")

    if not (ROOT / "node_modules").is_dir():
        info("node_modules/ missing — installing dependencies first")
        lockfile = "ci" if (ROOT / "package-lock.json").exists() else "install"
        run(["npm", lockfile], dry_run=dry_run)

    run(["npm", "run", "build"], dry_run=dry_run)


def verify_artifacts(dry_run: bool) -> None:
    """Fail early rather than publishing a broken or half-built bundle."""
    if dry_run and not DIST.is_dir():
        info("[dry-run] skipping artifact check (no ./dist/ yet)")
        return

    if not DIST.is_dir():
        raise DeployError(
            "./dist/ does not exist. Run without --skip-build to create it."
        )

    missing = [name for name in REQUIRED_ARTIFACTS if not (DIST / name).exists()]
    if missing:
        raise DeployError(
            "The build output is incomplete — missing:\n  "
            + "\n  ".join(missing)
            + "\nRe-run `npm run build` (the WASM kernel needs Rust + wasm-pack)."
        )

    html = (DIST / "index.html").read_text(encoding="utf-8")
    if 'src="/assets/' in html:
        raise DeployError(
            "dist/index.html references assets with absolute paths, which breaks "
            "hosting under a sub-path. Ensure `base: './'` is set in vite.config.ts."
        )

    total = sum(f.stat().st_size for f in DIST.rglob("*") if f.is_file())
    success(f"Build output OK ({total / 1_048_576:.1f} MB)")


# --------------------------------------------------------------------------- #
# 3. Publish
# --------------------------------------------------------------------------- #


def remote_branch_exists(branch: str) -> bool:
    out = capture(["git", "ls-remote", "--heads", "origin", branch], check=False)
    return bool(out)


def publish(branch: str, message: str, dry_run: bool) -> None:
    """Push ./dist/ to `branch` using a throwaway worktree.

    A worktree keeps the deployment completely separate from the checkout: the
    source branch, the index, and any local changes are left untouched.
    """
    step(f"Publish ./dist/ to origin/{branch}")

    if dry_run:
        run(["git", "worktree", "add", "-B", branch, "<tmp>", f"origin/{branch}"], dry_run=True)
        run(["git", "add", "--all"], dry_run=True)
        run(["git", "commit", "-m", message], dry_run=True)
        run(["git", "push", "origin", branch], dry_run=True)
        return

    worktree = Path(tempfile.mkdtemp(prefix="star-sim-pages-"))
    try:
        if remote_branch_exists(branch):
            run(["git", "fetch", "origin", branch])
            run(["git", "worktree", "add", "-B", branch, str(worktree), f"origin/{branch}"])
        else:
            info(f"origin/{branch} does not exist yet — creating an orphan branch")
            run(["git", "worktree", "add", "--detach", str(worktree)])
            run(["git", "checkout", "--orphan", branch], cwd=worktree)
            run(["git", "rm", "-rf", "--quiet", "."], cwd=worktree, check=False)

        # Replace the published tree wholesale so deleted files disappear too.
        for entry in worktree.iterdir():
            if entry.name == ".git":
                continue
            shutil.rmtree(entry) if entry.is_dir() else entry.unlink()

        shutil.copytree(DIST, worktree, dirs_exist_ok=True)
        # Pages runs Jekyll by default, which ignores files/dirs starting with
        # `_` and would mangle the bundle. `.nojekyll` serves it verbatim.
        (worktree / ".nojekyll").touch()

        run(["git", "add", "--all"], cwd=worktree)
        if not capture(["git", "status", "--porcelain"], cwd=worktree):
            success("Published site is already up to date — nothing to push")
            return

        run(["git", "commit", "--quiet", "-m", message], cwd=worktree)
        run(["git", "push", "--force", "origin", branch], cwd=worktree)
        success(f"Pushed to origin/{branch}")
    finally:
        run(["git", "worktree", "remove", "--force", str(worktree)], check=False)
        shutil.rmtree(worktree, ignore_errors=True)


# --------------------------------------------------------------------------- #
# 4. Enable GitHub Pages
# --------------------------------------------------------------------------- #


def gh_api(method: str, path: str, fields: dict | None = None) -> tuple[int, str]:
    """Call the GitHub REST API through `gh`, returning (status, body)."""
    cmd = ["gh", "api", "--method", method, path, "-i"]
    if fields is not None:
        cmd += ["--input", "-"]
    result = subprocess.run(
        cmd,
        cwd=str(ROOT),
        input=json.dumps(fields) if fields is not None else None,
        text=True,
        capture_output=True,
        check=False,
    )
    output = result.stdout or result.stderr
    status = 0
    for line in output.splitlines():
        if line.startswith("HTTP/"):
            status = int(line.split()[1])
            break
    return status, output


def enable_pages(repo: str, branch: str, dry_run: bool) -> str:
    """Ensure Pages is on and serving `branch` at the site root. Returns the URL."""
    step("Configure GitHub Pages")

    owner, name = repo.split("/", 1)
    fallback_url = f"https://{owner}.github.io/{name}/"
    if dry_run:
        info(f"[dry-run] would enable Pages on {repo} from {branch} (/)")
        return fallback_url

    source = {"source": {"branch": branch, "path": "/"}}
    status, body = gh_api("GET", f"repos/{repo}/pages")

    if status == 404:
        info("Pages is not enabled yet — creating the site")
        created, create_body = gh_api("POST", f"repos/{repo}/pages", source)
        if created not in (201, 204, 409):
            raise DeployError(
                f"Could not enable GitHub Pages (HTTP {created}).\n{create_body}\n"
                "  If the token lacks permission, enable Pages manually under "
                f"https://github.com/{repo}/settings/pages (branch: {branch}, folder: /)."
            )
        status, body = gh_api("GET", f"repos/{repo}/pages")
    elif status == 200:
        current = json.loads(body[body.index("{") :]).get("source", {})
        if current.get("branch") != branch or current.get("path") != "/":
            info(f"Repointing the existing site at {branch} (/)")
            gh_api("PUT", f"repos/{repo}/pages", source)
    else:
        warn(f"Unexpected response while reading the Pages config (HTTP {status})")

    url = fallback_url
    if status == 200 and "{" in body:
        url = json.loads(body[body.index("{") :]).get("html_url") or fallback_url
    success(f"Pages serving {branch} (/) at {url}")
    return url


# --------------------------------------------------------------------------- #
# 5. Verify
# --------------------------------------------------------------------------- #


def wait_for_site(url: str, timeout: int, dry_run: bool) -> bool:
    """Poll until the site answers 200. A first deployment can take minutes."""
    step("Wait for the site to go live")
    if dry_run:
        info(f"[dry-run] would poll {url}")
        return True

    deadline = time.time() + timeout
    attempt = 0
    while time.time() < deadline:
        attempt += 1
        try:
            request = urllib.request.Request(url, headers={"Cache-Control": "no-cache"})
            with urllib.request.urlopen(request, timeout=15) as response:
                if response.status == 200:
                    success(f"Live after {attempt} check(s)")
                    return True
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            reason = getattr(exc, "code", None) or getattr(exc, "reason", exc)
            info(f"not ready yet ({reason}) — retrying in {POLL_INTERVAL_SECONDS}s")
        time.sleep(POLL_INTERVAL_SECONDS)

    warn(
        f"The site did not respond within {timeout}s. GitHub Pages builds can lag "
        "behind the push, especially on a first deployment — check "
        f"{url} again in a few minutes."
    )
    return False


# --------------------------------------------------------------------------- #
# Entry point
# --------------------------------------------------------------------------- #


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="deploy.py",
        description="Build the star system simulation and deploy it to GitHub Pages.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "examples:\n"
            "  python3 scripts/deploy.py\n"
            "  python3 scripts/deploy.py --dry-run\n"
            "  python3 scripts/deploy.py --skip-build --open\n"
            "  python3 scripts/deploy.py --repo someone/star-sim --branch pages\n"
        ),
    )
    parser.add_argument(
        "--repo",
        help="Target GitHub repository as owner/name (default: this clone's remote).",
    )
    parser.add_argument(
        "--branch",
        default=DEFAULT_BRANCH,
        help=f"Branch to publish the built site to (default: {DEFAULT_BRANCH}).",
    )
    parser.add_argument(
        "--message",
        default=DEFAULT_MESSAGE,
        help="Commit message for the published site.",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Publish the existing ./dist/ instead of rebuilding.",
    )
    parser.add_argument(
        "--no-wait",
        action="store_true",
        help="Do not poll the public URL after deploying.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=POLL_TIMEOUT_SECONDS,
        help=f"Seconds to wait for the site to go live (default: {POLL_TIMEOUT_SECONDS}).",
    )
    parser.add_argument(
        "--open",
        action="store_true",
        help="Open the deployed site in a browser when finished.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would happen without building, pushing, or changing settings.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    started = time.time()

    try:
        repo = preflight(args)

        if args.skip_build:
            step("Build")
            info("--skip-build: reusing the existing ./dist/")
        else:
            build(args.dry_run)
        verify_artifacts(args.dry_run)

        publish(args.branch, args.message, args.dry_run)
        url = enable_pages(repo["slug"], args.branch, args.dry_run)

        if not args.no_wait:
            wait_for_site(url, args.timeout, args.dry_run)

        elapsed = time.time() - started
        print(_paint(f"\n🚀 Deployed in {elapsed:.0f}s", "1;32"))
        print(_paint(f"   {url}\n", "1;97"))

        if args.open and not args.dry_run:
            webbrowser.open(url)
        return 0

    except DeployError as exc:
        print(_paint(f"\n✗ {exc}\n", "1;31"), file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print(_paint("\n✗ Interrupted\n", "1;31"), file=sys.stderr)
        return 130


if __name__ == "__main__":
    sys.exit(main())
