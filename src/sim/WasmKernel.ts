// Rust/WASM physics kernel wrapper (spec §4.4, §5, Decisions D1/D2, FR-10).
//
// Wraps the `wasm-pack --target web` output of the `wasm/` crate as a
// {@link PhysicsKernel}. The Rust side owns all simulation state in linear
// memory; this wrapper exposes the interleaved particle/body buffers as
// zero-copy `Float32Array` views and reconstructs the per-step
// {@link SimulationEvent}s from the packed `Float64Array` events buffer.
//
// Per Decision D2, {@link createKernel} feature-detects WebAssembly and loads
// the compiled module lazily; if the environment lacks WASM or the module fails
// to load, it transparently falls back to the pure-TypeScript
// {@link TsFallbackKernel}. The module import is intentionally dynamic (computed
// specifier) so the TypeScript build and the test runner never hard-depend on
// the generated `wasm/pkg/` artifact, which is produced by `npm run wasm:build`.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import { createEvent, SimEventType, type SimulationEvent } from './events';
import { BodyType, type KernelInit, type PhysicsKernel, type StepResult } from './PhysicsKernel';
import { TsFallbackKernel } from './TsFallbackKernel';

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
  default: (initInput?: unknown) => Promise<unknown>;
}

/**
 * {@link PhysicsKernel} backed by the Rust/WASM module. Construct with an
 * already-initialized {@link WasmModule} (see {@link loadWasmModule}), then use
 * exactly like the fallback kernel.
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
    return { events, stage: handle.stage() as LifecycleStage };
  }

  getParticleBuffer(): Float32Array {
    const handle = this.requireHandle();
    return new Float32Array(this.buffer(), handle.particle_ptr(), handle.particle_len());
  }

  getBodyBuffer(): Float32Array {
    const handle = this.requireHandle();
    return new Float32Array(this.buffer(), handle.body_ptr(), handle.body_len());
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
      return { bodyId: dataA, bodyType: dataB as BodyType };
    default:
      return undefined;
  }
}

/**
 * Dynamically import and initialize the generated `wasm-pack` module. The
 * specifier is computed (not a string literal) so neither `tsc` nor the bundler
 * statically resolves the generated artifact. In the browser call with no
 * argument (the module fetches its sibling `.wasm`); in tests/Node pass the
 * `.wasm` bytes directly.
 */
export async function loadWasmModule(initInput?: unknown): Promise<WasmModule> {
  const specifier = new URL('../../wasm/pkg/star_kernel.js', import.meta.url).href;
  const mod = (await import(/* @vite-ignore */ specifier)) as unknown as WasmModule;
  await mod.default(initInput);
  return mod;
}

/**
 * Create the best available {@link PhysicsKernel} (Decision D2): the Rust/WASM
 * kernel when WebAssembly is present and the module loads, otherwise the
 * pure-TypeScript {@link TsFallbackKernel}. Never throws.
 */
export async function createKernel(): Promise<PhysicsKernel> {
  if (!isWasmSupported()) {
    return new TsFallbackKernel();
  }
  try {
    const mod = await loadWasmModule();
    return new WasmKernel(mod);
  } catch {
    return new TsFallbackKernel();
  }
}

/** Feature-detect a usable WebAssembly runtime. */
export function isWasmSupported(): boolean {
  return (
    typeof WebAssembly === 'object' &&
    typeof WebAssembly.instantiate === 'function' &&
    typeof WebAssembly.Memory === 'function'
  );
}
