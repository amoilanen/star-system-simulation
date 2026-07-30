# Star System Simulation

**▶ Try it live: <https://amoilanen.github.io/star-system-simulation/>**

An interactive, browser-based simulation of the **birth and death of a star system** —
from a collapsing cloud of star dust, through protostar coalescence and the ignition of
nuclear fusion, across the main sequence and red-giant phases, to a final remnant
(white dwarf, neutron star, pulsar or black hole — or a supernova along the way).
Clouds too light to ever fuse hydrogen stop short of being stars at all and end
as brown dwarfs.

The simulation runs **entirely in the browser**. The heavy numeric work (N-body gravity,
stage progression, orbital integration) is done by a **Rust physics kernel compiled to
WebAssembly** — the only physics implementation; the front end never duplicates the model.
Rendering is done with **Three.js** (custom GLSL shaders, additive particle fields, bloom
post-processing).

## Features

- **Configurable initial conditions** — cloud composition (H / He / metals), mass, cloud
  extent, and simulation pace, plus a preset for every outcome the model can
  produce (`brown-dwarf`, `low-mass`, `sun-like`, `neutron-star`, `high-mass`,
  `pulsar`, `black-hole`, `direct-collapse`).
- **Adjustable time scale** — from near-real time up to a full birth→death cycle in about a
  minute; pause/resume live.
- **Full lifecycle** — dust cloud → protostar → fusion ignition → main sequence → red giant
  → death → remnant, with the death path chosen from a centralized, mass/composition-based
  fate model.
- **A death you can watch** — the envelope leaves as a wind over the late red giant and the
  whole death, so the star is seen to shed it; its gravity weakens as it does, which is what
  widens the surviving orbits. What is thrown off stays as a **planetary nebula / supernova
  remnant** that expands and fades across the remnant stage instead of vanishing.
- **Orbiting bodies** — proto-planets and planets spin and orbit; comets and deep-space
  asteroids visit the system and are either captured or ejected. Worlds condense out of the
  cloud's **solids**, so metal-poor clouds form few planets and a metal-free one forms none
  at all — it can still fragment into companion stars.
- **Multiple stars** — a cloud holding more than one Jeans mass cannot collapse as a single
  object: it fragments, and the pieces grow into companion stars (or brown dwarfs) with
  gravity of their own, which perturbs the planets and can scatter the outer ones away.
  Every body is classified by its own mass, so anything past the hydrogen-burning limit is a
  star rather than an oversized planet.
- **Camera controls** — zoom in/out and smoothly center/focus/follow any body or the star.
- **Localization** — English and Finnish, selectable on the setup form; new languages are
  data-only additions.
- **Educational annotations** — an optional overlay narrates important events (e.g. the start
  of fusion), toggled on the setup form.

## Requirements

- **[Node.js](https://nodejs.org/)** 18+ (developed on Node 22).
- **[Rust](https://www.rust-lang.org/tools/install)** (stable toolchain) — only needed to
  build the WASM kernel.
- **[wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)** — builds the Rust crate
  to WebAssembly.

```bash
# Install Rust (if you don't have it)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack
```

## Getting started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the WASM kernel** (required once, and after any change to the Rust code under
   `./wasm/src/`):

   ```bash
   npm run wasm:build
   ```

   This runs `wasm-pack build wasm --target web` and emits the compiled module to
   `./wasm/pkg/`.

3. **Start the dev server:**

   ```bash
   npm run dev
   ```

   Vite prints a local URL (default `http://localhost:5173`). Open it in a modern browser.

   > The WASM kernel is required: it is the only physics implementation, so skipping step 2
   > leaves the app with nothing to simulate.

## npm scripts

- **`npm run dev`**: Start the Vite dev server with hot-module reload.
- **`npm run build`**: Production build — runs `wasm:build`, then `vite build`, emitting to
  `./dist/`.
- **`npm run wasm:build`**: Compile the Rust kernel to WebAssembly into `./wasm/pkg/`.
- **`npm run typecheck`**: Type-check the project with `tsc --noEmit`.
- **`npm run lint`**: Run ESLint (fails on any warning).
- **`npm run format:check`** / **`npm run format`**: Check / apply Prettier formatting.
- **`npm test`**: Run the Vitest unit-test suite once.
- **`npm run deploy`**: Build and publish the site to GitHub Pages (`./scripts/deploy.py`).

## Production build & preview

```bash
npm run build          # builds WASM + the static bundle into ./dist/
npx vite preview       # serve the ./dist/ bundle locally to smoke-test it
```

The contents of `./dist/` are fully static and can be served from any static host.

## Deploying

The site is published to **GitHub Pages** at
<https://amoilanen.github.io/star-system-simulation/> with a single command:

```bash
python3 scripts/deploy.py            # build, publish, enable Pages, wait until live
python3 scripts/deploy.py --dry-run  # show the plan without changing anything
```

The script (`./scripts/deploy.py`, standard library only) checks prerequisites, runs the
production build, verifies the bundle is complete (including the WASM kernel), pushes
`./dist/` to the `gh-pages` branch via a temporary git worktree, enables GitHub Pages
through the API and polls the public URL until it answers.

Requires the [GitHub CLI](https://cli.github.com/) authenticated with the `repo` scope
(`gh auth login`). See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for all flags,
deployment to other hosts (Netlify, Vercel, Cloudflare Pages, …), troubleshooting and
rollback.

## Project structure

```text
src/
  main.ts              # Entry point; boots the app shell
  app/                 # Application shell, screen routing, per-frame loop
  config/              # SimulationConfig contract, presets, fate model
  i18n/                # i18n catalog (en.json, fi.json) + formatter
  sim/                 # Clock, event bus, stage FSM, PhysicsKernel interface,
                       #   WASM kernel wrapper
  render/              # Three.js scene, star/remnant shaders, particles,
                       #   bodies, camera, post-processing
  ui/                  # Setup form, HUD, event annotations, info panels
wasm/
  Cargo.toml           # Rust crate manifest
  src/                 # Rust physics kernel: nbody, stages, bodies, lib
  pkg/                 # wasm-pack output (generated, git-ignored)
test/                  # Vitest unit tests, mirroring src/
scripts/
  deploy.py            # one-command build & deploy to GitHub Pages
docs/
  DEPLOYMENT.md        # deployment guide (hosts, flags, troubleshooting)
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development, debugging, and verification
details.
