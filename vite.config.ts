/// <reference types="vitest/config" />
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** Files `wasm-pack build wasm --target web` emits that the browser needs at runtime. */
const WASM_RUNTIME_FILES = ['star_kernel.js', 'star_kernel_bg.wasm'];

/**
 * Copy the `wasm-pack` output into the build output as `dist/wasm/pkg/`.
 *
 * `WasmKernel.loadWasmModule` imports the generated glue through a *computed*
 * specifier (so neither `tsc` nor Rollup hard-depends on the generated
 * artifact), which means the bundler never sees it and would otherwise not emit
 * it — the deployed site would silently fall back to the TypeScript kernel.
 * The layout mirrors the source tree so the same `wasm/pkg/...` URL resolves in
 * dev (served from the project root) and in production (served from `dist/`).
 */
function copyWasmPackage(): Plugin {
  return {
    name: 'copy-wasm-package',
    apply: 'build',
    closeBundle() {
      const from = resolve(projectRoot, 'wasm/pkg');
      const to = resolve(projectRoot, 'dist/wasm/pkg');
      mkdirSync(to, { recursive: true });
      for (const file of WASM_RUNTIME_FILES) {
        copyFileSync(resolve(from, file), resolve(to, file));
      }
    },
  };
}

// Vite config for the static, 100% client-side bundle. The WASM plugins allow
// importing the Rust-compiled kernel produced by `wasm-pack build wasm --target web`.
export default defineConfig({
  // Relative asset URLs so the built bundle can be hosted from any directory —
  // e.g. a GitHub Pages project site at `https://<user>.github.io/<repo>/`.
  base: './',
  plugins: [wasm(), topLevelAwait(), copyWasmPackage()],
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
  test: {
    environment: 'node',
    include: ['test/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],
  },
});
