// Rust/WASM physics kernel wrapper (spec §4.4, §5, Decisions D1/D2, FR-10).
//
// Wraps the `wasm-pack --target web` output of the `wasm/` crate as a
// {@link PhysicsKernel}. The Rust side owns all simulation state in linear
// memory; this wrapper exposes the interleaved particle/body buffers as
// zero-copy `Float32Array` views and reconstructs the per-step
// {@link SimulationEvent}s from the packed `Float64Array` events buffer.
//
// {@link createKernel} loads the compiled module lazily. There is no longer a
// TypeScript fallback: WebAssembly has been baseline in every target browser
// since 2017, and the mirrored TS kernel that used to cover its absence cost
// more (two implementations of every constant and formula, kept in sync by
// hand) than the vanishing case it insured against. A failure to load now
// surfaces as an error instead of silently degrading to a second physics model.
// The module import is intentionally dynamic (computed specifier) so the
// TypeScript build and the test runner never hard-depend on the generated
// `wasm/pkg/` artifact, which is produced by `npm run wasm:build`.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import { createEvent, SimEventType, type SimulationEvent } from './events';
import { BodyType, type KernelInit, type PhysicsKernel, type StepResult } from './PhysicsKernel';

/** The subset of the generated `Kernel` class this wrapper drives. */
export interface WasmKernelHandle {
  step(dtSimSeconds: number): number;
  particle_ptr(): number;
  particle_len(): number;
  body_ptr(): number;
  body_len(): number;
  events_ptr(): number;
  event_stride(): number;
  stage(): number;
  stage_progress(): number;
  elapsed_sim_seconds(): number;
  star_mass_solar(): number;
  orbital_mu(): number;
  free(): void;
}

/** The subset of the generated `wasm-pack` module this wrapper uses. */
export interface WasmModule {
  Kernel: new (
    mass: number,
    cloudExtent: number,
    pace: number,
    hydrogen: number,
    helium: number,
    metals: number,
    particleCount: number,
  ) => WasmKernelHandle;
  wasm_memory(): WebAssembly.Memory;
  /** Gravitational softening length the kernel integrates with (scene units). */
  softening(): number;
  /** The disc's snow line in AU, as the kernel defines it. */
  snow_line_au(): number;
  default: (initInput?: unknown) => Promise<unknown>;
}

/**
 * {@link PhysicsKernel} backed by the Rust/WASM module. Construct with an
 * already-initialized {@link WasmModule} (see {@link loadWasmModule}).
 */
export class WasmKernel implements PhysicsKernel {
  private handle: WasmKernelHandle | null = null;

  constructor(private readonly mod: WasmModule) {}

  init(init: KernelInit): void {
    const { config, particleCount } = init;
    this.handle?.free();
    this.handle = new this.mod.Kernel(
      config.mass,
      config.cloudExtent,
      config.pace,
      config.composition.hydrogen,
      config.composition.helium,
      config.composition.metals,
      Math.max(0, Math.floor(particleCount)),
    );
  }

  step(dtSimSeconds: number): StepResult {
    const handle = this.requireHandle();
    const count = handle.step(dtSimSeconds);
    const events = this.drainEvents(handle, count);
    return {
      events,
      stage: handle.stage() as LifecycleStage,
      stageProgress: handle.stage_progress(),
      elapsedSimSeconds: handle.elapsed_sim_seconds(),
      starMassSolar: handle.star_mass_solar(),
    };
  }

  getParticleBuffer(): Float32Array {
    const handle = this.requireHandle();
    return new Float32Array(this.buffer(), handle.particle_ptr(), handle.particle_len());
  }

  getBodyBuffer(): Float32Array {
    const handle = this.requireHandle();
    return new Float32Array(this.buffer(), handle.body_ptr(), handle.body_len());
  }

  orbitalMu(): number {
    return this.requireHandle().orbital_mu();
  }

  dispose(): void {
    this.handle?.free();
    this.handle = null;
  }

  private requireHandle(): WasmKernelHandle {
    if (this.handle === null) {
      throw new Error('WasmKernel used before init');
    }
    return this.handle;
  }

  /** Current linear-memory ArrayBuffer (re-read each access; may grow/detach). */
  private buffer(): ArrayBuffer {
    return this.mod.wasm_memory().buffer;
  }

  /** Decode the packed events buffer into localized {@link SimulationEvent}s. */
  private drainEvents(handle: WasmKernelHandle, count: number): SimulationEvent[] {
    if (count <= 0) {
      return [];
    }
    const stride = handle.event_stride();
    const view = new Float64Array(this.buffer(), handle.events_ptr(), count * stride);
    const events: SimulationEvent[] = [];
    for (let i = 0; i < count; i += 1) {
      const base = i * stride;
      const type = view[base] as SimEventType;
      const simTime = view[base + 1] ?? 0;
      const dataA = view[base + 2] ?? 0;
      const dataB = view[base + 3] ?? 0;
      const data = decodeEventData(type, dataA, dataB);
      events.push(
        data === undefined ? createEvent(type, simTime) : createEvent(type, simTime, data),
      );
    }
    return events;
  }
}

/**
 * Reconstruct an event's structured payload from its two packed data lanes,
 * mirroring the TS fallback's event `data` shapes so downstream consumers are
 * kernel-agnostic.
 */
function decodeEventData(
  type: SimEventType,
  dataA: number,
  dataB: number,
): Record<string, unknown> | undefined {
  switch (type) {
    case SimEventType.DeathEvent:
      return { supernova: dataA === 1 };
    case SimEventType.RemnantFormed:
      return { remnant: dataA as RemnantType, supernova: dataB === 1 };
    case SimEventType.BodyCaptured:
    case SimEventType.BodyEjected:
    case SimEventType.BodyConsumed:
      return { bodyId: dataA, bodyType: dataB as BodyType };
    default:
      return undefined;
  }
}

/**
 * Resolve the URL of the generated `wasm-pack` glue module.
 *
 * In a browser the module is a *deployed asset*, not a bundled one, so it is
 * resolved against the document base URL: `wasm/pkg/star_kernel.js` sits next to
 * the page both in dev (Vite serves the project root) and in a production build
 * (the `copy-wasm-package` plugin emits `dist/wasm/pkg/`). Using `document.baseURI`
 * rather than `import.meta.url` keeps this correct when the site is hosted under
 * a sub-path such as `https://<user>.github.io/<repo>/`, where resolving relative
 * to the hashed asset chunk would escape the site root.
 *
 * Outside a browser (Node, Vitest) there is no document, so the path is resolved
 * relative to this source file instead.
 *
 * @param baseUrl - Document base URL override; defaults to the real `document.baseURI`.
 */
export function resolveWasmModuleUrl(baseUrl?: string): string {
  const base = baseUrl ?? (typeof document !== 'undefined' ? document.baseURI : undefined);
  return base !== undefined
    ? new URL('wasm/pkg/star_kernel.js', base).href
    : new URL('../../wasm/pkg/star_kernel.js', import.meta.url).href;
}

/**
 * Dynamically import and initialize the generated `wasm-pack` module. The
 * specifier is computed (not a string literal) so neither `tsc` nor the bundler
 * statically resolves the generated artifact. In the browser call with no
 * argument (the module fetches its sibling `.wasm`); in tests/Node pass the
 * `.wasm` bytes directly.
 */
export async function loadWasmModule(initInput?: unknown): Promise<WasmModule> {
  const specifier = resolveWasmModuleUrl();
  const mod = (await import(/* @vite-ignore */ specifier)) as unknown as WasmModule;
  await mod.default(initInput);
  return mod;
}

/**
 * Create the {@link PhysicsKernel} — the Rust/WASM module, which is the only
 * physics implementation.
 *
 * Unlike the previous version this THROWS rather than silently substituting a
 * second implementation. Both failure modes it can hit are deployment faults,
 * not user environments: a runtime without WebAssembly (none of the supported
 * browsers since 2017) or a `wasm/pkg` artifact that failed to load (in which
 * case the JS bundle referencing it is broken too). Failing loudly makes those
 * faults visible instead of quietly changing which physics the user is watching.
 */
export async function createKernel(): Promise<PhysicsKernel> {
  if (!isWasmSupported()) {
    throw new Error(
      'WebAssembly is not available in this runtime; the simulation kernel cannot start.',
    );
  }
  const mod = await loadWasmModule();
  return new WasmKernel(mod);
}

/** Feature-detect a usable WebAssembly runtime. */
export function isWasmSupported(): boolean {
  return (
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.instantiate === 'function' &&
    typeof WebAssembly.Memory === 'function'
  );
}
