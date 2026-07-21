# Star System Simulation

An interactive, browser-based simulation of the **birth and death of a star system** —
from a collapsing cloud of star dust, through protostar coalescence and the ignition of
nuclear fusion, across the main sequence and red-giant phases, to a final remnant
(white dwarf, neutron star, or pulsar — or a supernova along the way).

The simulation runs **entirely in the browser**. The heavy numeric work (N-body gravity,
stage progression, orbital integration) is done by a **Rust physics kernel compiled to
WebAssembly**, with a pure-TypeScript fallback kernel when WASM is unavailable. Rendering
is done with **Three.js** (custom GLSL shaders, additive particle fields, bloom
post-processing).

## Features

- **Configurable initial conditions** — cloud composition (H / He / metals), mass, cloud
  extent, and simulation pace, plus presets (`sun-like`, `low-mass`, `high-mass`).
- **Adjustable time scale** — from near-real time up to a full birth→death cycle in about a
  minute; pause/resume live.
- **Full lifecycle** — dust cloud → protostar → fusion ignition → main sequence → red giant
  → death → remnant, with the death path chosen from a centralized, mass/composition-based
  fate model.
- **Orbiting bodies** — proto-planets and planets spin and orbit; comets and deep-space
  asteroids visit the system and are either captured or ejected.
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

   > If you skip the WASM build, the app still runs using the pure-TypeScript fallback
   > kernel (`./src/sim/TsFallbackKernel.ts`) — expect lower performance.

## npm scripts

- **`npm run dev`**: Start the Vite dev server with hot-module reload.
- **`npm run build`**: Production build — runs `wasm:build`, then `vite build`, emitting to
  `./dist/`.
- **`npm run wasm:build`**: Compile the Rust kernel to WebAssembly into `./wasm/pkg/`.
- **`npm run typecheck`**: Type-check the project with `tsc --noEmit`.
- **`npm run lint`**: Run ESLint (fails on any warning).
- **`npm run format:check`** / **`npm run format`**: Check / apply Prettier formatting.
- **`npm test`**: Run the Vitest unit-test suite once.

## Production build & preview

```bash
npm run build          # builds WASM + the static bundle into ./dist/
npx vite preview       # serve the ./dist/ bundle locally to smoke-test it
```

The contents of `./dist/` are fully static and can be served from any static host.

## Project structure

```text
src/
  main.ts              # Entry point; boots the app shell
  app/                 # Application shell, screen routing, per-frame loop
  config/              # SimulationConfig contract, presets, fate model
  i18n/                # i18n catalog (en.json, fi.json) + formatter
  sim/                 # Clock, event bus, stage FSM, PhysicsKernel interface,
                       #   TS fallback + WASM kernel wrappers
  render/              # Three.js scene, star/remnant shaders, particles,
                       #   bodies, camera, post-processing
  ui/                  # Setup form, HUD, event annotations, info panels
wasm/
  Cargo.toml           # Rust crate manifest
  src/                 # Rust physics kernel: nbody, stages, bodies, lib
  pkg/                 # wasm-pack output (generated, git-ignored)
test/                  # Vitest unit tests, mirroring src/
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for development, debugging, and verification
details.
