import { describe, it, expect } from 'vitest';
import {
  TsFallbackKernel,
  circularSpeed,
  classifyVisitor,
  integrateOrbit,
  isBound,
  magnitude,
  mulberry32,
  seedFromConfig,
  specificOrbitalEnergy,
  totalSpecificEnergySoftened,
  MAX_PARTICLES,
} from '../../src/sim/TsFallbackKernel';
import {
  BODY_OFFSET,
  BODY_STRIDE,
  BodyType,
  PARTICLE_STRIDE,
  type Vec3,
} from '../../src/sim/PhysicsKernel';
import { SimEventType } from '../../src/sim/events';
import { LifecycleStage } from '../../src/config/fateModel';
import { CATALOGS } from '../../src/i18n/i18n';
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

describe('mulberry32', () => {
  it('is deterministic for a given seed and yields floats in [0,1)', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    for (let i = 0; i < 100; i += 1) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('diverges for different seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe('seedFromConfig', () => {
  it('is stable for equal configs and varies with parameters', () => {
    expect(seedFromConfig(makeConfig())).toBe(seedFromConfig(makeConfig()));
    expect(seedFromConfig(makeConfig({ mass: 1 }))).not.toBe(
      seedFromConfig(makeConfig({ mass: 2 })),
    );
  });
});

describe('specificOrbitalEnergy / isBound', () => {
  it('is negative (bound) for slow bodies and positive (unbound) for fast ones', () => {
    const mu = 1;
    const r = 10;
    expect(specificOrbitalEnergy(mu, r, 0.1)).toBeLessThan(0);
    expect(isBound(mu, r, 0.1)).toBe(true);
    expect(specificOrbitalEnergy(mu, r, 2)).toBeGreaterThan(0);
    expect(isBound(mu, r, 2)).toBe(false);
  });

  it('matches the escape-speed boundary', () => {
    const mu = 1;
    const r = 10;
    const escape = Math.sqrt((2 * mu) / r);
    expect(isBound(mu, r, escape * 0.99)).toBe(true);
    expect(isBound(mu, r, escape * 1.01)).toBe(false);
  });
});

describe('classifyVisitor (FR-7)', () => {
  const mu = 1;
  const ejectRadius = 15;

  it('captures a bound approach', () => {
    const pos: Vec3 = [10, 0, 0];
    const vel: Vec3 = [0, 0.1, 0]; // slow tangential ⇒ bound
    expect(classifyVisitor(mu, pos, vel, ejectRadius)).toBe('captured');
  });

  it('ejects an unbound body receding past the boundary', () => {
    const pos: Vec3 = [20, 0, 0]; // beyond ejectRadius
    const vel: Vec3 = [2, 0, 0]; // fast, moving outward
    expect(classifyVisitor(mu, pos, vel, ejectRadius)).toBe('ejected');
  });

  it('reports an unbound body still inside the boundary as transit', () => {
    const pos: Vec3 = [5, 0, 0]; // inside ejectRadius
    const vel: Vec3 = [3, 0, 0];
    expect(classifyVisitor(mu, pos, vel, ejectRadius)).toBe('transit');
  });

  it('does not eject an unbound body that is still inbound past the boundary', () => {
    const pos: Vec3 = [20, 0, 0];
    const vel: Vec3 = [-2, 0, 0]; // moving inward
    expect(classifyVisitor(mu, pos, vel, ejectRadius)).toBe('transit');
  });
});

describe('integrateOrbit (softened two-body sanity)', () => {
  it('keeps a circular orbit bounded and roughly conserves energy', () => {
    const mu = 1;
    const softening = 0.1;
    const r0 = 10;
    const vc = circularSpeed(mu, softening, r0);
    let pos: Vec3 = [r0, 0, 0];
    let vel: Vec3 = [0, vc, 0];
    const e0 = totalSpecificEnergySoftened(mu, softening, pos, vel);

    const h = 0.01;
    let minR = r0;
    let maxR = r0;
    let maxEnergyDrift = 0;
    for (let i = 0; i < 20000; i += 1) {
      const next = integrateOrbit(pos, vel, mu, softening, h);
      pos = next.pos;
      vel = next.vel;
      const r = magnitude(pos);
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      const e = totalSpecificEnergySoftened(mu, softening, pos, vel);
      maxEnergyDrift = Math.max(maxEnergyDrift, Math.abs((e - e0) / e0));
    }

    // Orbit stays in a tight radial band (bounded, does not spiral in/out).
    expect(minR).toBeGreaterThan(r0 * 0.8);
    expect(maxR).toBeLessThan(r0 * 1.2);
    // Symplectic integrator keeps the softened energy nearly constant.
    expect(maxEnergyDrift).toBeLessThan(0.05);
  });
});

describe('TsFallbackKernel buffers', () => {
  it('allocates a particle buffer of count × stride', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 100 });
    expect(kernel.getParticleBuffer().length).toBe(100 * PARTICLE_STRIDE);
    kernel.dispose();
  });

  it('caps the particle count at MAX_PARTICLES (FR-10)', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 10_000_000 });
    expect(kernel.getParticleBuffer().length).toBe(MAX_PARTICLES * PARTICLE_STRIDE);
    kernel.dispose();
  });

  it('seeds planets as a body buffer of body-count × stride', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 10 });
    const bodies = kernel.getBodyBuffer();
    expect(bodies.length % BODY_STRIDE).toBe(0);
    expect(bodies.length).toBeGreaterThan(0);
    // First seeded body is a bound protoplanet.
    expect(bodies[BODY_OFFSET.type]).toBe(BodyType.Protoplanet);
    expect(bodies[BODY_OFFSET.captured]).toBe(1);
    kernel.dispose();
  });

  it('promotes protoplanets to planets once the star ignites', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 20 });
    expect(kernel.getBodyBuffer()[BODY_OFFSET.type]).toBe(BodyType.Protoplanet);

    // Step well past fusion ignition.
    const result = kernel.step(1e17);
    expect(result.stage).toBeGreaterThanOrEqual(LifecycleStage.FusionIgnition);

    const bodies = kernel.getBodyBuffer();
    for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
      expect(bodies[i * BODY_STRIDE + BODY_OFFSET.type]).not.toBe(BodyType.Protoplanet);
    }
    kernel.dispose();
  });
});

describe('TsFallbackKernel stage integration', () => {
  it('drives the lifecycle FSM to the remnant and emits all stage events', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig({ mass: 1 }), particleCount: 50 });
    const result = kernel.step(1e30); // one huge dt crosses every boundary
    expect(result.stage).toBe(LifecycleStage.Remnant);

    const types = new Set(result.events.map((e) => e.type));
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
    // Every emitted event carries a translatable message id.
    for (const event of result.events) {
      expect(CATALOGS.en[event.messageId], `en missing ${event.messageId}`).toBeTruthy();
    }
    kernel.dispose();
  });

  it('does not advance sim state on a non-positive dt (paused, A6)', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 20 });
    const before = Array.from(kernel.getParticleBuffer());
    const result = kernel.step(0);
    expect(result.events).toHaveLength(0);
    expect(result.stage).toBe(LifecycleStage.DustCloud);
    expect(Array.from(kernel.getParticleBuffer())).toEqual(before);
    kernel.dispose();
  });
});

describe('TsFallbackKernel body events', () => {
  it('only emits well-formed capture/ejection events for visiting bodies', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig({ mass: 2 }), particleCount: 30 });
    const bodyEvents: SimEventType[] = [];
    // Many moderate steps let visitors spawn, approach, and be resolved.
    for (let i = 0; i < 60; i += 1) {
      const result = kernel.step(2e15);
      for (const e of result.events) {
        if (e.type === SimEventType.BodyCaptured || e.type === SimEventType.BodyEjected) {
          bodyEvents.push(e.type);
          expect(e.data).toBeDefined();
          expect((e.data as { bodyId: number }).bodyId).toBeGreaterThanOrEqual(0);
        }
      }
    }
    // Body events are optional per run, but any emitted must be the two valid kinds.
    for (const t of bodyEvents) {
      expect([SimEventType.BodyCaptured, SimEventType.BodyEjected]).toContain(t);
    }
    kernel.dispose();
  });
});

describe('TsFallbackKernel determinism (WASM-parity precondition)', () => {
  it('produces identical buffers and event streams for identical inputs', () => {
    const dts = [1e15, 3e15, 2e15, 5e15, 1e16];

    function run(): { particles: number[]; bodies: number[]; events: SimEventType[] } {
      const kernel = new TsFallbackKernel();
      kernel.init({ config: makeConfig({ mass: 3 }), particleCount: 40 });
      const events: SimEventType[] = [];
      for (const dt of dts) {
        const result = kernel.step(dt);
        for (const e of result.events) {
          events.push(e.type);
        }
      }
      const out = {
        particles: Array.from(kernel.getParticleBuffer()),
        bodies: Array.from(kernel.getBodyBuffer()),
        events,
      };
      kernel.dispose();
      return out;
    }

    const first = run();
    const second = run();
    expect(second.particles).toEqual(first.particles);
    expect(second.bodies).toEqual(first.bodies);
    expect(second.events).toEqual(first.events);
    // The scenario actually produced state to compare.
    expect(first.particles.length).toBe(40 * PARTICLE_STRIDE);
  });
});
