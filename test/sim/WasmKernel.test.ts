import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  WasmKernel,
  createKernel,
  isWasmSupported,
  loadWasmModule,
  resolveWasmModuleUrl,
  type WasmKernelHandle,
  type WasmModule,
} from '../../src/sim/WasmKernel';
import {
  ATTRACTOR_OFFSET,
  ATTRACTOR_STRIDE,
  BodyType,
  PARTICLE_STRIDE,
} from '../../src/sim/PhysicsKernel';
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

function makeFakeModule(): {
  mod: WasmModule;
  particle: number[];
  body: number[];
  attractor: number[];
} {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const buffer = memory.buffer;

  // f32-exact values so `toEqual` comparisons are stable.
  const particle = [1, 2, 3, 0.5, 0.25, 0.75, 1];
  const body = [0, BodyType.Planet, 0.5, 1.5, 4, 0, 8, -0.5, 0, 0.25, 0.75, 1];
  // Two gravitating centres: the primary at the origin and a companion.
  const attractor = [0, 0, 0, 42, 12, 0, -3, 8];
  // Three packed events: [type, simTime, dataA, dataB].
  const events = [
    SimEventType.RemnantFormed,
    123,
    RemnantType.Pulsar,
    1,
    SimEventType.BodyCaptured,
    456,
    7,
    BodyType.Comet,
    // A companion ignition carries its MASS in the second lane, not a body type.
    SimEventType.CompanionIgnited,
    789,
    3,
    0.5,
  ];

  const PARTICLE_PTR = 0;
  const BODY_PTR = 64;
  const ATTRACTOR_PTR = 256;
  const EVENT_PTR = 512; // 8-byte aligned for Float64Array

  new Float32Array(buffer, PARTICLE_PTR, particle.length).set(particle);
  new Float32Array(buffer, BODY_PTR, body.length).set(body);
  new Float32Array(buffer, ATTRACTOR_PTR, attractor.length).set(attractor);
  new Float64Array(buffer, EVENT_PTR, events.length).set(events);

  const handle: WasmKernelHandle = {
    step: () => 3,
    particle_ptr: () => PARTICLE_PTR,
    particle_len: () => particle.length,
    body_ptr: () => BODY_PTR,
    body_len: () => body.length,
    attractor_ptr: () => ATTRACTOR_PTR,
    attractor_len: () => attractor.length,
    attractor_count: () => attractor.length / ATTRACTOR_STRIDE,
    events_ptr: () => EVENT_PTR,
    event_stride: () => 4,
    stage: () => LifecycleStage.MainSequence,
    stage_progress: () => 0.5,
    elapsed_sim_seconds: () => 1.6e13,
    star_mass_solar: () => 0.9,
    orbital_mu: () => 42,
    free: () => {},
  };

  const KernelCtor = function KernelCtor(): WasmKernelHandle {
    return handle;
  } as unknown as WasmModule['Kernel'];

  const mod: WasmModule = {
    Kernel: KernelCtor,
    wasm_memory: () => memory,
    softening: () => 0.35,
    snow_line_au: () => 2.7,
    default: async () => undefined,
  };
  return { mod, particle, body, attractor };
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

  it('exposes the gravitating centres on the attractor lanes', () => {
    // The multi-attractor field (Decision D1) reaches the host over its own
    // buffer, laid out exactly like the particle/body ones. A wrong stride or a
    // stale count would silently drop the companion's gravity on this side.
    const { mod, attractor } = makeFakeModule();
    const kernel = new WasmKernel(mod);
    kernel.init({ config: makeConfig(), particleCount: 1 });

    const buf = kernel.getAttractorBuffer();
    expect(Array.from(buf)).toEqual(attractor);
    expect(kernel.attractorCount()).toBe(2);
    expect(buf.length).toBe(kernel.attractorCount() * ATTRACTOR_STRIDE);

    // Lane 0 is the PRIMARY, at the scene origin (Decision D5), and its `mu` is
    // what `orbitalMu()` reports — the orbit overlay's central conic.
    expect(buf[ATTRACTOR_OFFSET.x]).toBe(0);
    expect(buf[ATTRACTOR_OFFSET.y]).toBe(0);
    expect(buf[ATTRACTOR_OFFSET.z]).toBe(0);
    expect(buf[ATTRACTOR_OFFSET.mu]).toBe(kernel.orbitalMu());

    // The companion carries its own position and a `mu` of its own.
    expect(buf[ATTRACTOR_STRIDE + ATTRACTOR_OFFSET.x]).toBe(12);
    expect(buf[ATTRACTOR_STRIDE + ATTRACTOR_OFFSET.z]).toBe(-3);
    expect(buf[ATTRACTOR_STRIDE + ATTRACTOR_OFFSET.mu]).toBe(8);
    kernel.dispose();
  });

  it('refuses to read the attractor buffer before init', () => {
    const { mod } = makeFakeModule();
    const kernel = new WasmKernel(mod);
    expect(() => kernel.getAttractorBuffer()).toThrow(/before init/);
    expect(() => kernel.attractorCount()).toThrow(/before init/);
  });

  it('decodes packed events into localized SimulationEvents', () => {
    const { mod } = makeFakeModule();
    const kernel = new WasmKernel(mod);
    kernel.init({ config: makeConfig(), particleCount: 1 });

    const result = kernel.step(1e14);
    expect(result.stage).toBe(LifecycleStage.MainSequence);
    expect(result.events).toHaveLength(3);

    const [remnant, capture, companion] = result.events;
    expect(remnant?.type).toBe(SimEventType.RemnantFormed);
    expect(remnant?.simTime).toBe(123);
    expect(remnant?.data).toEqual({ remnant: RemnantType.Pulsar, supernova: true });
    expect(remnant?.messageId).toBe('event.remnantFormed');

    expect(capture?.type).toBe(SimEventType.BodyCaptured);
    expect(capture?.simTime).toBe(456);
    expect(capture?.data).toEqual({ bodyId: 7, bodyType: BodyType.Comet });
    expect(capture?.messageId).toBe('event.bodyCaptured');

    // A companion star's ignition (spec §4.2): the payload is the body and how
    // heavy it became, which is what qualified it as a star in the first place.
    expect(companion?.type).toBe(SimEventType.CompanionIgnited);
    expect(companion?.simTime).toBe(789);
    expect(companion?.data).toEqual({ bodyId: 3, massSolar: 0.5 });
    expect(companion?.messageId).toBe('event.companionIgnited');
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

  it('rejects — rather than silently substituting another kernel — when the module cannot load', async () => {
    // There is exactly ONE physics implementation now; the mirrored TypeScript
    // fallback was deleted. So a module that fails to load must SURFACE as an
    // error instead of quietly changing which physics the user is watching.
    // (In Node the browser-style init cannot fetch its sibling .wasm, which is
    // a convenient stand-in for that deployment fault.)
    await expect(createKernel()).rejects.toThrow();
  });
});

describe('resolveWasmModuleUrl', () => {
  it('resolves against the document base so a sub-path deployment works', () => {
    // GitHub Pages project site: the bundle lives under /<repo>/, so the kernel
    // must be fetched from /<repo>/wasm/pkg/, not from the domain root.
    expect(resolveWasmModuleUrl('https://user.github.io/star-system-simulation/')).toBe(
      'https://user.github.io/star-system-simulation/wasm/pkg/star_kernel.js',
    );
  });

  it('resolves against the site root when hosted at the top level', () => {
    expect(resolveWasmModuleUrl('http://localhost:5173/')).toBe(
      'http://localhost:5173/wasm/pkg/star_kernel.js',
    );
  });

  it('falls back to a source-relative path outside a browser', () => {
    // No document (Node/Vitest): resolved relative to src/sim/, i.e. the
    // generated package in the repository.
    expect(resolveWasmModuleUrl()).toBe(wasmJsUrl.href);
  });
});

// --- WASM kernel behavioural invariants -------------------------------------
//
// Runs only when the WASM package has been built (`npm run wasm:build`), which
// the verification sequence does before `npm test`. The emergent accretion model
// is order-dependent and is NOT bit-identical across JS and Rust, so instead of
// cross-language parity we assert the WASM kernel obeys the same PHYSICAL
// invariants as the TS reference (valid buffer layout, the stellar FSM advances,
// and dust is physically depleted as it accretes).

const wasmBinUrl = new URL('../../wasm/pkg/star_kernel_bg.wasm', import.meta.url);
const wasmJsUrl = new URL('../../wasm/pkg/star_kernel.js', import.meta.url);
const wasmBuilt = existsSync(fileURLToPath(wasmBinUrl)) && existsSync(fileURLToPath(wasmJsUrl));
const describeWasm = wasmBuilt ? describe : describe.skip;

describeWasm('WASM kernel behavioural invariants', () => {
  it('seeds a valid buffer layout and advances the stellar lifecycle', async () => {
    const bytes = readFileSync(fileURLToPath(wasmBinUrl));
    const mod = await loadWasmModule({ module_or_path: new Uint8Array(bytes) });

    const config = makeConfig({ mass: 1 });
    const particleCount = 64;

    const wasm = new WasmKernel(mod);
    wasm.init({ config, particleCount });

    // Post-init: correct interleaved buffer layout.
    expect(wasm.getParticleBuffer().length).toBe(particleCount * PARTICLE_STRIDE);
    // §3.8: body buffer is EMPTY immediately after init — planetesimals are
    // deferred to ProtostarCoalescence so they cannot predate the protostar.
    expect(wasm.getBodyBuffer().length).toBe(0);

    // Formation is accretion-driven AND rate-limited by the star's finite
    // accretion rate (CORE_ACCRETION_RATE), so reaching ignition legitimately
    // takes several hundred bounded orbital steps; the stellar clock then
    // carries the run to the remnant.
    const types = new Set<SimEventType>();
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < 900 && stage !== LifecycleStage.Remnant; i += 1) {
      const result = wasm.step(1e17);
      for (const e of result.events) {
        types.add(e.type);
      }
      stage = result.stage;
    }
    expect(stage).toBe(LifecycleStage.Remnant);
    for (const stageEvent of [
      SimEventType.CollapseOnset,
      SimEventType.ProtostarFormed,
      SimEventType.FusionIgnition,
      SimEventType.RedGiantOnset,
      SimEventType.DeathEvent,
      SimEventType.RemnantFormed,
    ]) {
      expect(types.has(stageEvent)).toBe(true);
    }
    wasm.dispose();
  });

  it('reports the real kernel’s gravitating centres, primary first', async () => {
    // Against the REAL module (not the fake): there is always at least the
    // primary, it sits at the origin, and its `mu` is exactly `orbitalMu()` —
    // the invariant the orbit overlay depends on.
    const bytes = readFileSync(fileURLToPath(wasmBinUrl));
    const mod = await loadWasmModule({ module_or_path: new Uint8Array(bytes) });

    const wasm = new WasmKernel(mod);
    wasm.init({ config: makeConfig({ mass: 1 }), particleCount: 64 });

    const count = wasm.attractorCount();
    expect(count).toBeGreaterThanOrEqual(1);
    const buf = wasm.getAttractorBuffer();
    expect(buf.length).toBe(count * ATTRACTOR_STRIDE);
    expect(buf[ATTRACTOR_OFFSET.x]).toBe(0);
    expect(buf[ATTRACTOR_OFFSET.y]).toBe(0);
    expect(buf[ATTRACTOR_OFFSET.z]).toBe(0);
    expect(buf[ATTRACTOR_OFFSET.mu]).toBeCloseTo(wasm.orbitalMu(), 3);
    expect(buf[ATTRACTOR_OFFSET.mu]).toBeGreaterThan(0);
    wasm.dispose();
  });

  it('physically depletes dust as it accretes', async () => {
    const bytes = readFileSync(fileURLToPath(wasmBinUrl));
    const mod = await loadWasmModule({ module_or_path: new Uint8Array(bytes) });

    const wasm = new WasmKernel(mod);
    wasm.init({ config: makeConfig({ mass: 1 }), particleCount: 1500 });
    const dust0 = wasm.getParticleBuffer().length / PARTICLE_STRIDE;
    for (let i = 0; i < 60; i += 1) {
      wasm.step(3e14);
    }
    const dust1 = wasm.getParticleBuffer().length / PARTICLE_STRIDE;
    expect(dust1).toBeLessThan(dust0);
    wasm.dispose();
  });
});
