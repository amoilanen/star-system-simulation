import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  WasmKernel,
  createKernel,
  isWasmSupported,
  loadWasmModule,
  type WasmKernelHandle,
  type WasmModule,
} from '../../src/sim/WasmKernel';
import { TsFallbackKernel } from '../../src/sim/TsFallbackKernel';
import { BodyType, PARTICLE_STRIDE, BODY_STRIDE } from '../../src/sim/PhysicsKernel';
import { SimEventType } from '../../src/sim/events';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import type { CloudComposition, SimulationConfig } from '../../src/config/SimulationConfig';

const SOLAR_COMPOSITION: CloudComposition = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    locale: 'en',
    composition: SOLAR_COMPOSITION,
    mass: 1,
    cloudExtent: 50,
    pace: 0.5,
    showEventAnnotations: true,
    ...overrides,
  };
}

// --- Wrapper unit tests (no real WASM required) -----------------------------
//
// A fake module writes known state into a real WebAssembly.Memory so the wrapper
// exercises the exact zero-copy view construction and event-decoding it uses
// against the Rust module.

function makeFakeModule(): { mod: WasmModule; particle: number[]; body: number[] } {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const buffer = memory.buffer;

  // f32-exact values so `toEqual` comparisons are stable.
  const particle = [1, 2, 3, 0.5, 0.25, 0.75, 1];
  const body = [0, BodyType.Planet, 0.5, 1.5, 4, 0, 8, -0.5, 0, 0.25, 0.75, 1];
  // Two packed events: [type, simTime, dataA, dataB].
  const events = [
    SimEventType.RemnantFormed,
    123,
    RemnantType.Pulsar,
    1,
    SimEventType.BodyCaptured,
    456,
    7,
    BodyType.Comet,
  ];

  const PARTICLE_PTR = 0;
  const BODY_PTR = 64;
  const EVENT_PTR = 512; // 8-byte aligned for Float64Array

  new Float32Array(buffer, PARTICLE_PTR, particle.length).set(particle);
  new Float32Array(buffer, BODY_PTR, body.length).set(body);
  new Float64Array(buffer, EVENT_PTR, events.length).set(events);

  const handle: WasmKernelHandle = {
    step: () => 2,
    particle_ptr: () => PARTICLE_PTR,
    particle_len: () => particle.length,
    body_ptr: () => BODY_PTR,
    body_len: () => body.length,
    events_ptr: () => EVENT_PTR,
    event_stride: () => 4,
    stage: () => LifecycleStage.MainSequence,
    free: () => {},
  };

  const KernelCtor = function KernelCtor(): WasmKernelHandle {
    return handle;
  } as unknown as WasmModule['Kernel'];

  const mod: WasmModule = {
    Kernel: KernelCtor,
    wasm_memory: () => memory,
    default: async () => undefined,
  };
  return { mod, particle, body };
}

describe('WasmKernel wrapper', () => {
  it('exposes zero-copy buffer views over linear memory', () => {
    const { mod, particle, body } = makeFakeModule();
    const kernel = new WasmKernel(mod);
    kernel.init({ config: makeConfig(), particleCount: 1 });

    expect(Array.from(kernel.getParticleBuffer())).toEqual(particle);
    expect(Array.from(kernel.getBodyBuffer())).toEqual(body);
    kernel.dispose();
  });

  it('decodes packed events into localized SimulationEvents', () => {
    const { mod } = makeFakeModule();
    const kernel = new WasmKernel(mod);
    kernel.init({ config: makeConfig(), particleCount: 1 });

    const result = kernel.step(1e14);
    expect(result.stage).toBe(LifecycleStage.MainSequence);
    expect(result.events).toHaveLength(2);

    const [remnant, capture] = result.events;
    expect(remnant?.type).toBe(SimEventType.RemnantFormed);
    expect(remnant?.simTime).toBe(123);
    expect(remnant?.data).toEqual({ remnant: RemnantType.Pulsar, supernova: true });
    expect(remnant?.messageId).toBe('event.remnantFormed');

    expect(capture?.type).toBe(SimEventType.BodyCaptured);
    expect(capture?.simTime).toBe(456);
    expect(capture?.data).toEqual({ bodyId: 7, bodyType: BodyType.Comet });
    expect(capture?.messageId).toBe('event.bodyCaptured');
    kernel.dispose();
  });

  it('throws when used before init', () => {
    const { mod } = makeFakeModule();
    const kernel = new WasmKernel(mod);
    expect(() => kernel.step(1e14)).toThrow(/before init/);
  });
});

describe('createKernel / feature detection', () => {
  it('detects WebAssembly in this runtime', () => {
    expect(isWasmSupported()).toBe(true);
  });

  it('always returns a usable kernel (falls back when WASM cannot load)', async () => {
    // In Node the browser-style module init cannot fetch its sibling .wasm, so
    // createKernel transparently falls back to the TS kernel (Decision D2).
    const kernel = await createKernel();
    kernel.init({ config: makeConfig(), particleCount: 10 });
    const result = kernel.step(1e14);
    expect(typeof result.stage).toBe('number');
    expect(kernel.getParticleBuffer().length).toBe(10 * PARTICLE_STRIDE);
    kernel.dispose();
  });
});

// --- Kernel parity: WASM ↔ TS fallback --------------------------------------
//
// Runs only when the WASM package has been built (`npm run wasm:build`), which
// the verification sequence does before `npm test`. Both kernels mirror the same
// deterministic model, so their buffers agree within float tolerance and their
// stage/event streams agree exactly on a small scenario.

const wasmBinUrl = new URL('../../wasm/pkg/star_kernel_bg.wasm', import.meta.url);
const wasmJsUrl = new URL('../../wasm/pkg/star_kernel.js', import.meta.url);
const wasmBuilt = existsSync(fileURLToPath(wasmBinUrl)) && existsSync(fileURLToPath(wasmJsUrl));
const describeParity = wasmBuilt ? describe : describe.skip;

function expectClose(actual: Float32Array, expected: Float32Array, tol: number): void {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < expected.length; i += 1) {
    const a = actual[i] ?? NaN;
    const e = expected[i] ?? NaN;
    expect(Math.abs(a - e), `lane ${i}: wasm=${a} ts=${e}`).toBeLessThanOrEqual(
      tol + tol * Math.abs(e),
    );
  }
}

describeParity('WASM ↔ TS fallback parity (deterministic small scenario)', () => {
  it('agrees on seeded buffers and stepped stage/event streams', async () => {
    const bytes = readFileSync(fileURLToPath(wasmBinUrl));
    const mod = await loadWasmModule({ module_or_path: new Uint8Array(bytes) });

    const config = makeConfig({ mass: 1 });
    const particleCount = 24;

    const wasm = new WasmKernel(mod);
    const ts = new TsFallbackKernel();
    wasm.init({ config, particleCount });
    ts.init({ config, particleCount });

    // Post-init parity: identical seeding (RNG + layout) up to float transcendentals.
    expectClose(wasm.getParticleBuffer(), ts.getParticleBuffer(), 1e-3);
    expectClose(wasm.getBodyBuffer(), ts.getBodyBuffer(), 1e-3);
    expect(wasm.getParticleBuffer().length).toBe(particleCount * PARTICLE_STRIDE);
    expect(wasm.getBodyBuffer().length % BODY_STRIDE).toBe(0);

    // Small steps (below the visitor-spawn interval): stage + events agree exactly.
    const dts = [1e14, 2e14, 1e14];
    for (const dt of dts) {
      const rw = wasm.step(dt);
      const rt = ts.step(dt);
      expect(rw.stage).toBe(rt.stage);
      expect(rw.events.map((e) => e.type)).toEqual(rt.events.map((e) => e.type));
      expectClose(wasm.getParticleBuffer(), ts.getParticleBuffer(), 1e-2);
      expectClose(wasm.getBodyBuffer(), ts.getBodyBuffer(), 1e-2);
    }

    // The scenario actually advanced the lifecycle FSM past the dust cloud.
    expect(wasm.step(0).stage).toBeGreaterThan(LifecycleStage.DustCloud);

    wasm.dispose();
    ts.dispose();
  });
});
