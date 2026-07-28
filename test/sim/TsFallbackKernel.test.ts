import { describe, it, expect } from 'vitest';
import {
  TsFallbackKernel,
  accretionRadius,
  BODY_SWALLOW_FRACTION,
  bodyRadiusFromMass,
  circularSpeed,
  classifyVisitor,
  integrateOrbit,
  isBound,
  magnitude,
  mergedVelocity,
  mulberry32,
  orbitalStep,
  orbitalMu,
  seedFromConfig,
  specificOrbitalEnergy,
  totalSpecificEnergySoftened,
  accretionEfficiency,
  SNOW_LINE_AU,
  MAX_PARTICLES,
  MAX_BODY_RADIUS,
  MIN_BODY_RADIUS,
  ORBITAL_MAX,
  ParticleKind,
  perpendicularTo,
  mergeRadius,
  periapsisDistance,
  softenedAccel,
  stableSubstep,
  SOFTENING,
  ORBIT_RESOLUTION,
  INTERNAL_DT,
} from '../../src/sim/TsFallbackKernel';
import { mainSequenceRadius } from '../../src/render/starVisual';
import { orbitalElements, orbitPathPoints } from '../../src/render/orbitPath';
import { solarToEarthMasses } from '../../src/sim/astro';
import {
  BODY_OFFSET,
  BODY_STRIDE,
  BodyType,
  PARTICLE_STRIDE,
  type Vec3,
} from '../../src/sim/PhysicsKernel';
import { SimEventType } from '../../src/sim/events';
import { DEATH_PHASES } from '../../src/sim/stages';
import {
  LifecycleStage,
  RemnantType,
  determineFate,
  FATE_THRESHOLDS,
} from '../../src/config/fateModel';
import { cloudMassForStar, stellarMassFromCloud } from '../../src/config/starFormation';
import { GAS_GIANT_MIN_EARTH_MASSES, ICE_GIANT_MIN_EARTH_MASSES } from '../../src/ui/bodyInfo';
import { Clock } from '../../src/sim/Clock';
import { CATALOGS } from '../../src/i18n/i18n';
import type { CloudComposition, SimulationConfig } from '../../src/config/SimulationConfig';

/**
 * Steps needed to carry the kernel from dust cloud to remnant. Formation is
 * rate-limited by the star's finite accretion rate (`CORE_ACCRETION_RATE`), so
 * ignition legitimately takes several hundred bounded orbital steps — the slow,
 * watchable build-up is the behaviour under test, not an inefficiency.
 */
const LIFECYCLE_STEPS = 900;

const SOLAR_COMPOSITION: CloudComposition = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };

/**
 * Cloud mass (M☉) that assembles a SOLAR-mass star. Only ~a third of a cloud
 * ever reaches the star (see `config/starFormation.ts`), so a test that wants
 * the Sun's lifecycle has to start from a ~3 M☉ cloud — configuring `mass: 1`
 * would leave a 0.34 M☉ red dwarf that outlives the universe.
 */
const SOLAR_CLOUD_MASS = cloudMassForStar(1, SOLAR_COMPOSITION.metals);

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    locale: 'en',
    composition: SOLAR_COMPOSITION,
    mass: SOLAR_CLOUD_MASS,
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
    kernel.init({ config: makeConfig(), particleCount: 200 });
    expect(kernel.getBodyBuffer()[BODY_OFFSET.type]).toBe(BodyType.Protoplanet);

    // Formation is accretion-driven — drive enough steps to grow the core past
    // fusion ignition.
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage < LifecycleStage.FusionIgnition; i += 1) {
      stage = kernel.step(1e17).stage;
    }
    expect(stage).toBeGreaterThanOrEqual(LifecycleStage.FusionIgnition);

    const bodies = kernel.getBodyBuffer();
    for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
      const type = bodies[i * BODY_STRIDE + BODY_OFFSET.type];
      // Visiting bodies (comets/asteroids) are not protoplanets; planets aren't either.
      if (type === BodyType.Comet || type === BodyType.Asteroid) {
        continue;
      }
      expect(type).not.toBe(BodyType.Protoplanet);
    }
    kernel.dispose();
  });
});

describe('TsFallbackKernel stage integration', () => {
  it('drives the lifecycle to the remnant and emits all stage events', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig({ mass: 1 }), particleCount: 200 });

    // Formation is accretion-driven, so it takes several large steps to grow the
    // core to ignition; the stellar clock then carries it to the remnant.
    const types = new Set<SimEventType>();
    const messageIds: string[] = [];
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage !== LifecycleStage.Remnant; i += 1) {
      const result = kernel.step(1e17);
      for (const e of result.events) {
        types.add(e.type);
        messageIds.push(e.messageId);
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
    // Every emitted event carries a translatable message id.
    for (const messageId of messageIds) {
      expect(CATALOGS.en[messageId], `en missing ${messageId}`).toBeTruthy();
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
    // The scenario produced state to compare; dust depletes as it accretes, so
    // the surviving count is bounded by the seeded count (no longer exactly it).
    expect(first.particles.length).toBeGreaterThan(0);
    expect(first.particles.length).toBeLessThanOrEqual(40 * PARTICLE_STRIDE);
  });
});

describe('orbitalStep (bounded, watchable orbital time)', () => {
  it('is zero when paused and for non-positive/non-finite dt', () => {
    expect(orbitalStep(0)).toBe(0);
    expect(orbitalStep(-5)).toBe(0);
    expect(orbitalStep(Number.NaN)).toBe(0);
  });

  it('increases with sim-time but saturates at the cap', () => {
    const small = orbitalStep(1e4);
    const large = orbitalStep(1e7);
    expect(large).toBeGreaterThan(small);
    expect(large).toBeLessThanOrEqual(ORBITAL_MAX);
    // Even an astronomically large dt is clamped for integrator stability.
    expect(orbitalStep(1e30)).toBeLessThanOrEqual(ORBITAL_MAX);
    expect(orbitalStep(1e30)).toBeCloseTo(ORBITAL_MAX, 6);
  });
});

describe('accretionRadius / bodyRadiusFromMass (emergent growth)', () => {
  it('accretion feeding-zone grows with body mass', () => {
    const small = accretionRadius(0.001, 1);
    const big = accretionRadius(0.05, 1);
    expect(big).toBeGreaterThan(small);
  });

  it('visual radius grows with mass and stays in a sane range', () => {
    // Masses chosen within the (now smaller) renderable range so growth is
    // visible before the max-radius clamp; a Jupiter-class mass clamps to MAX.
    const small = bodyRadiusFromMass(1e-4, 1);
    const big = bodyRadiusFromMass(8e-4, 1);
    expect(big).toBeGreaterThan(small);
    expect(small).toBeGreaterThanOrEqual(MIN_BODY_RADIUS);
    expect(big).toBeLessThanOrEqual(MAX_BODY_RADIUS);
  });

  it('keeps every body far smaller than the star (realistic proportions)', () => {
    // The star's main-sequence radius is ~0.5 scene unit; even the heaviest
    // possible body must read as a small fraction of it, never larger.
    const heaviest = bodyRadiusFromMass(1e6, 1);
    expect(heaviest).toBeLessThanOrEqual(MAX_BODY_RADIUS);
    expect(MAX_BODY_RADIUS).toBeLessThan(0.35 * mainSequenceRadius(1));
  });
});

describe('mergedVelocity (momentum-conserving inelastic merge)', () => {
  it('carries the total momentum of the two masses', () => {
    const v = mergedVelocity(2, [1, 0, 0], 1, [-1, 0, 0]);
    // p = 2*1 + 1*(-1) = 1 over total mass 3.
    expect(v[0]).toBeCloseTo(1 / 3, 12);
    expect(v[1]).toBeCloseTo(0, 12);
  });

  it('equals the shared velocity when both move alike', () => {
    const v = mergedVelocity(3, [0.5, -0.2, 0.1], 5, [0.5, -0.2, 0.1]);
    expect(v[0]).toBeCloseTo(0.5, 12);
    expect(v[1]).toBeCloseTo(-0.2, 12);
    expect(v[2]).toBeCloseTo(0.1, 12);
  });
});

describe('accretionEfficiency (snow line)', () => {
  it('is low and flat inside the snow line (rock only)', () => {
    const a = accretionEfficiency(0.7);
    const b = accretionEfficiency(2.0);
    expect(a).toBe(b);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(0.001);
  });

  it('jumps sharply just beyond the snow line (ices + gas)', () => {
    const inside = accretionEfficiency(SNOW_LINE_AU - 0.1);
    const outside = accretionEfficiency(SNOW_LINE_AU + 0.1);
    // The giant-forming zone is orders of magnitude more productive.
    expect(outside).toBeGreaterThan(inside * 50);
  });

  it('keeps rising for a while beyond the snow line, then thins out', () => {
    // Bug 2 ("gas giants form close to the star"): the curve must NOT peak at
    // the snow line. Dust is swept at ~r^-1.5, so a retention curve that only
    // fell off handed the biggest planet to the innermost seed.
    expect(accretionEfficiency(10)).toBeGreaterThan(accretionEfficiency(3));
    expect(accretionEfficiency(30)).toBeLessThan(accretionEfficiency(10));
  });

  it('peaks well beyond the snow line, not at it', () => {
    let best = 0;
    let bestAu = 0;
    for (let au = 0.5; au <= 60; au += 0.1) {
      const e = accretionEfficiency(au);
      if (e > best) {
        best = e;
        bestAu = au;
      }
    }
    // The giant-forming zone sits several AU OUTSIDE the snow line, which is
    // what compensates the outward thinning of the disc.
    expect(bestAu).toBeGreaterThan(SNOW_LINE_AU * 2);
    expect(bestAu).toBeLessThan(20);
  });

  it('never retains more than the swept mass', () => {
    for (let au = 0.1; au <= 200; au += 0.5) {
      expect(accretionEfficiency(au)).toBeLessThanOrEqual(1);
    }
  });

  it('returns 0 for degenerate distances', () => {
    expect(accretionEfficiency(0)).toBe(0);
    expect(accretionEfficiency(-1)).toBe(0);
  });
});

/** Semi-major-ish radius (scene units = AU) of the innermost planet, or Infinity. */
function innermostPlanetAu(kernel: TsFallbackKernel): number {
  const bodies = kernel.getBodyBuffer();
  let min = Infinity;
  for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
    const base = i * BODY_STRIDE;
    const type = bodies[base + BODY_OFFSET.type];
    if (type === BodyType.Comet || type === BodyType.Asteroid) {
      continue;
    }
    const r = Math.hypot(bodies[base + BODY_OFFSET.x] ?? 0, bodies[base + BODY_OFFSET.z] ?? 0);
    min = Math.min(min, r);
  }
  return min;
}

describe('TsFallbackKernel emergent physics invariants', () => {
  it('forms a realistic planetary system (count, mass classes, eccentricity)', () => {
    // Regression for "only 2 planets and no gas giants": accreting dust used to
    // drag planets' velocities sub-Keplerian, spiralling them into the star, and
    // a single flat efficiency meant nothing ever reached giant mass.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 4000 });
    for (let i = 0; i < LIFECYCLE_STEPS; i += 1) {
      const r = kernel.step(1e17);
      if (r.stage >= LifecycleStage.MainSequence && i > 200) {
        break;
      }
    }

    const bodies = kernel.getBodyBuffer();
    const planets: { au: number; earthMasses: number }[] = [];
    for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
      const base = i * BODY_STRIDE;
      const type = bodies[base + BODY_OFFSET.type];
      if (type === BodyType.Comet || type === BodyType.Asteroid) {
        continue;
      }
      planets.push({
        au: Math.hypot(bodies[base + BODY_OFFSET.x] ?? 0, bodies[base + BODY_OFFSET.z] ?? 0),
        earthMasses: solarToEarthMasses(bodies[base + BODY_OFFSET.mass] ?? 0),
      });
    }

    // A Sun-like cloud should keep a whole system, not a couple of survivors.
    expect(planets.length).toBeGreaterThanOrEqual(6);

    // At least one giant must form beyond the snow line...
    const giants = planets.filter((p) => p.earthMasses >= 50 && p.au > SNOW_LINE_AU);
    expect(giants.length).toBeGreaterThanOrEqual(1);
    // ...and everything inside the snow line must stay small and rocky.
    for (const p of planets.filter((q) => q.au < SNOW_LINE_AU)) {
      expect(p.earthMasses).toBeLessThan(50);
    }
    // No planet should be absurdly heavy (a brown dwarf, not a planet).
    for (const p of planets) {
      expect(p.earthMasses).toBeLessThan(4000);
    }
    kernel.dispose();
  });

  it('clears the inner planets and widens survivors by the remnant stage', () => {
    // Regression for "many planets right next to the remnant": the red giant
    // must engulf its inner planets, and mass loss must widen the survivors —
    // so no planet should remain crowded against the remnant.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 4000 });

    let mainSequenceInnermost = Infinity;
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage !== LifecycleStage.Remnant; i += 1) {
      const r = kernel.step(1e17);
      stage = r.stage;
      if (stage === LifecycleStage.MainSequence && mainSequenceInnermost === Infinity) {
        mainSequenceInnermost = innermostPlanetAu(kernel);
      }
    }
    expect(stage).toBe(LifecycleStage.Remnant);

    // A Sun-like cloud forms planets well inside the red giant's ~2.2 AU reach.
    expect(mainSequenceInnermost).toBeLessThan(2.2);

    // At the remnant, the red giant has engulfed everything inside its reach and
    // the survivors have drifted outward — the innermost is now comfortably clear
    // of the (now tiny) remnant, and further out than it was on the main sequence.
    const remnantInnermost = innermostPlanetAu(kernel);
    expect(remnantInnermost).toBeGreaterThan(3);
    expect(remnantInnermost).toBeGreaterThan(mainSequenceInnermost);
    kernel.dispose();
  });

  it('forms the star gradually, not almost immediately (#2)', () => {
    // Regression for "the star is born almost immediately": every grain that
    // crossed the capture radius used to be swallowed instantly, so the core ran
    // from its 4% seed to the 50% ignition threshold in ~1 second of playback.
    // Accretion is now limited to a finite Ṁ (CORE_ACCRETION_RATE), so formation
    // takes a genuinely watchable span of wall-clock time.
    //
    // This is asserted in REAL SECONDS at 60 fps — the units the user actually
    // perceives — because a step-count assertion would not have caught the bug
    // (`orbitalStep` saturates, so steps/second is fixed regardless of pace).
    const FPS = 60;
    const dt = 1 / FPS;
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 2000 });
    const clock = new Clock({ pace: 1 }); // fastest pace = the worst case

    let ignitedAt = Infinity;
    let realSeconds = 0;
    for (let f = 0; f < 60 * FPS; f += 1) {
      const stage = kernel.step(clock.advance(dt)).stage;
      realSeconds += dt;
      if (stage >= LifecycleStage.MainSequence) {
        ignitedAt = realSeconds;
        break;
      }
    }

    // The star must still form (the rate limit must not stall formation)...
    expect(ignitedAt).toBeLessThan(40);
    // ...but never in the ~1 second that made it look instantaneous.
    expect(ignitedAt).toBeGreaterThan(5);
    kernel.dispose();
  });

  it('leaves no primordial dust orbiting the remnant (#4)', () => {
    // Regression: leftover birth-cloud dust used to orbit forever right next to
    // the white dwarf. The disc must fully dissipate by the remnant stage.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 4000 });
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage !== LifecycleStage.Remnant; i += 1) {
      stage = kernel.step(1e17).stage;
    }
    expect(stage).toBe(LifecycleStage.Remnant);

    // Every remaining particle must be mass-less ejecta/debris — no mass-bearing
    // primordial grains left behind (which would show as dust hugging the remnant).
    const particles = (kernel as unknown as { particles: { mass: number }[] }).particles;
    for (const p of particles) {
      expect(p.mass).toBeLessThanOrEqual(0);
    }
    kernel.dispose();
  });

  it('gives planets varied, non-circular orbits', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 800 });
    for (let i = 0; i < 60; i += 1) {
      kernel.step(1e16);
    }
    const bodies = kernel.getBodyBuffer();
    const mu = orbitalMu(SOLAR_CLOUD_MASS);
    const eccentricities: number[] = [];
    for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
      const base = i * BODY_STRIDE;
      const type = bodies[base + BODY_OFFSET.type];
      if (type === BodyType.Comet || type === BodyType.Asteroid) {
        continue;
      }
      const el = orbitalElements(
        [
          bodies[base + BODY_OFFSET.x] ?? 0,
          bodies[base + BODY_OFFSET.y] ?? 0,
          bodies[base + BODY_OFFSET.z] ?? 0,
        ],
        [
          bodies[base + BODY_OFFSET.vx] ?? 0,
          bodies[base + BODY_OFFSET.vy] ?? 0,
          bodies[base + BODY_OFFSET.vz] ?? 0,
        ],
        mu,
      );
      if (el !== null) {
        eccentricities.push(el.eccentricity);
      }
    }
    expect(eccentricities.length).toBeGreaterThan(3);
    // Orbits are ellipses, not perfect circles...
    const maxEcc = Math.max(...eccentricities);
    expect(maxEcc).toBeGreaterThan(0.02);
    // ...but still bound and disc-like, not wildly scattered.
    expect(maxEcc).toBeLessThan(0.6);
    // And they genuinely VARY between planets.
    const spread = maxEcc - Math.min(...eccentricities);
    expect(spread).toBeGreaterThan(0.01);
    kernel.dispose();
  });

  function meanAbsY(buf: Float32Array): number {
    const n = buf.length / PARTICLE_STRIDE;
    if (n === 0) {
      return 0;
    }
    let sum = 0;
    for (let i = 0; i < n; i += 1) {
      sum += Math.abs(buf[i * PARTICLE_STRIDE + 1] ?? 0);
    }
    return sum / n;
  }

  function totalBodyMass(buf: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buf.length / BODY_STRIDE; i += 1) {
      sum += buf[i * BODY_STRIDE + BODY_OFFSET.mass] ?? 0;
    }
    return sum;
  }

  it('flattens the cloud into a disc (vertical spread dissipates)', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 800 });
    const y0 = meanAbsY(kernel.getParticleBuffer());
    for (let i = 0; i < 40; i += 1) {
      kernel.step(2e14);
    }
    const y1 = meanAbsY(kernel.getParticleBuffer());
    expect(y1).toBeLessThan(y0 * 0.85);
    kernel.dispose();
  });

  it('depletes dust and grows the planetesimals as they accrete', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 1500 });
    const dust0 = kernel.getParticleBuffer().length / PARTICLE_STRIDE;
    const mass0 = totalBodyMass(kernel.getBodyBuffer());
    for (let i = 0; i < 60; i += 1) {
      kernel.step(3e14);
    }
    const dust1 = kernel.getParticleBuffer().length / PARTICLE_STRIDE;
    const mass1 = totalBodyMass(kernel.getBodyBuffer());
    expect(dust1).toBeLessThan(dust0); // dust is physically consumed
    expect(mass1).toBeGreaterThan(mass0); // planetesimals grew by accretion
    kernel.dispose();
  });

  it('never leaves a body sitting on top of the star (swallowed instead)', () => {
    // Regression: a momentum-conserving merge between bodies at opposing orbital
    // phases can cancel the orbital velocity, so the body free-falls to r≈0. It
    // must be absorbed by the star, not parked at the star's position.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 1200 });

    // The star's body-swallow zone; nothing should ever be found orbiting
    // inside it. Derived from the same expression the kernel uses.
    // Mirror of the kernel's `coreAccretionRadius` for a 50 AU cloud.
    const coreRadius = Math.min(1.2, Math.max(0.4, 50 * 0.014));
    const swallowRadius = coreRadius * BODY_SWALLOW_FRACTION;

    for (let step = 0; step < 200; step += 1) {
      kernel.step(1e17);
      const bodies = kernel.getBodyBuffer();
      for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
        const base = i * BODY_STRIDE;
        const r = Math.hypot(
          bodies[base + BODY_OFFSET.x] ?? 0,
          bodies[base + BODY_OFFSET.y] ?? 0,
          bodies[base + BODY_OFFSET.z] ?? 0,
        );
        expect(r, `body ${i} sits inside the star at r=${r}`).toBeGreaterThan(swallowRadius);
      }
    }
    kernel.dispose();
  });

  it('reports a physically realistic elapsed time (star forms over ~Myr)', () => {
    // Regression: the star used to "ignite" after ~86 displayed years because the
    // accretion-driven formation was decoupled from the sim clock. Real star
    // formation takes ~1-10 Myr, so the elapsed readout must reflect that.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 600 });

    const YEAR = 365.25 * 24 * 3600;
    // Track the elapsed time reported while the system is still FORMING — this
    // is the readout that used to (absurdly) show a few dozen years.
    let formationYears = 0;
    for (let i = 0; i < LIFECYCLE_STEPS; i += 1) {
      const r = kernel.step(1e17);
      if (r.stage >= LifecycleStage.MainSequence) {
        break;
      }
      expect(r.elapsedSimSeconds).toBeGreaterThanOrEqual(0);
      formationYears = Math.max(formationYears, r.elapsedSimSeconds / YEAR);
    }

    // A solar cloud's formation budget is ~1.6 Myr: the readout must reach the
    // right order of magnitude, not the ~86 years of the original bug.
    expect(formationYears).toBeGreaterThan(1e5);
    expect(formationYears).toBeLessThan(1e7);
    kernel.dispose();
  });

  it('advances elapsed time monotonically across the whole lifecycle', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 300 });
    let previous = -1;
    for (let i = 0; i < LIFECYCLE_STEPS; i += 1) {
      const r = kernel.step(1e17);
      expect(r.elapsedSimSeconds).toBeGreaterThanOrEqual(previous);
      previous = r.elapsedSimSeconds;
      if (r.stage === LifecycleStage.Remnant) {
        break;
      }
    }
    // A full solar lifecycle is ~10 Gyr.
    const years = previous / (365.25 * 24 * 3600);
    expect(years).toBeGreaterThan(1e9);
    kernel.dispose();
  });

  it('seeds every planetesimal outside the star feeding zone', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 100 });
    const bodies = kernel.getBodyBuffer();
    // Mirror of the kernel's `coreAccretionRadius` for a 50 AU cloud.
    const coreRadius = Math.min(1.2, Math.max(0.4, 50 * 0.014));
    for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
      const base = i * BODY_STRIDE;
      const r = Math.hypot(bodies[base + BODY_OFFSET.x] ?? 0, bodies[base + BODY_OFFSET.z] ?? 0);
      expect(r).toBeGreaterThan(coreRadius);
    }
    kernel.dispose();
  });

  it('keeps a planetesimal on a bounded orbit (does not fling it away)', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 200 });
    const buf0 = kernel.getBodyBuffer();
    const r0 = Math.hypot(buf0[BODY_OFFSET.x] ?? 0, buf0[BODY_OFFSET.z] ?? 0);
    for (let i = 0; i < 50; i += 1) {
      kernel.step(2e14);
    }
    const buf1 = kernel.getBodyBuffer();
    // The first body (if still present) stays within a sane radial band.
    if (buf1.length >= BODY_STRIDE) {
      const r1 = Math.hypot(buf1[BODY_OFFSET.x] ?? 0, buf1[BODY_OFFSET.z] ?? 0);
      expect(r1).toBeGreaterThan(0.5);
      expect(r1).toBeLessThan(r0 * 3 + 5);
    }
    kernel.dispose();
  });
});

// --- Reported-bug regressions ----------------------------------------------

/** Internal particle shape, for invariants the flat buffer cannot express. */
interface InternalParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  kind: ParticleKind;
}

/** Read the kernel's internal particle list (kind/ttl are not in the buffer). */
function internalParticles(kernel: TsFallbackKernel): InternalParticle[] {
  return (kernel as unknown as { particles: InternalParticle[] }).particles;
}

/** Drive the kernel until it reaches the remnant stage (or the step budget runs out). */
function driveToRemnant(kernel: TsFallbackKernel): LifecycleStage {
  let stage = LifecycleStage.DustCloud;
  for (let i = 0; i < LIFECYCLE_STEPS && stage !== LifecycleStage.Remnant; i += 1) {
    stage = kernel.step(1e17).stage;
  }
  return stage;
}

describe('bug 1 — nothing is left orbiting the remnant', () => {
  it('leaves no BOUND particle circling the star once it is a remnant', () => {
    // Regression: the red giant engulfs its inner planets and tears each into a
    // glowing tidal-debris stream. That debris carries mass 0, and the death-time
    // sweep only removed MASS-BEARING grains — so the fragments stayed on the
    // orbit they inherited and were visibly circling the white dwarf forever.
    //
    // Physically, everything around a dying star is either accreted or blown
    // away: the only particles that may remain are the UNBOUND death ejecta.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 3000 });
    expect(driveToRemnant(kernel)).toBe(LifecycleStage.Remnant);
    // Let the shell fly for a while — anything bound would still be here.
    for (let i = 0; i < 20; i += 1) {
      kernel.step(1e17);
    }

    const mu = orbitalMu(1);
    const bound = internalParticles(kernel).filter((p) => {
      const r = Math.hypot(p.x, p.y, p.z);
      const speed = Math.hypot(p.vx, p.vy, p.vz);
      return isBound(mu, r, speed);
    });
    expect(bound).toHaveLength(0);
    kernel.dispose();
  });

  it('lets a consumed planet’s tidal debris fall in instead of orbiting forever', () => {
    // The debris stream is falling INTO the star, so it must be gone within a
    // few orbits rather than settling into a permanent ring.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 1500 });
    // Small enough steps that the brief red-giant phase is actually resolved
    // (a single huge dt would cross straight through it to the remnant).
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage < LifecycleStage.MainSequence; i += 1) {
      stage = kernel.step(1e15).stage;
    }
    expect(stage).toBe(LifecycleStage.MainSequence);

    let seenDebris = false;
    for (let i = 0; i < 400 && stage < LifecycleStage.Death; i += 1) {
      stage = kernel.step(1e16).stage;
      if (internalParticles(kernel).some((p) => p.kind === ParticleKind.Debris)) {
        seenDebris = true;
      }
    }
    // A solar-mass run always eats at least one inner planet at red-giant onset.
    expect(seenDebris).toBe(true);

    // The stream drains into the star within a few orbits — well before death.
    const kernel2 = new TsFallbackKernel();
    kernel2.init({ config: makeConfig(), particleCount: 1500 });
    let stage2 = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage2 < LifecycleStage.MainSequence; i += 1) {
      stage2 = kernel2.step(1e15).stage;
    }
    let debrisSeenAt = -1;
    for (let i = 0; i < 400 && stage2 < LifecycleStage.Death; i += 1) {
      stage2 = kernel2.step(1e16).stage;
      if (internalParticles(kernel2).some((p) => p.kind === ParticleKind.Debris)) {
        debrisSeenAt = i;
        break;
      }
    }
    expect(debrisSeenAt).toBeGreaterThanOrEqual(0);
    // Drain on a much finer sim-dt so the star stays a red giant throughout: the
    // debris must vanish through its OWN infall, not because the supernova blast
    // later sweeps the system clean.
    for (let i = 0; i < 60; i += 1) {
      stage2 = kernel2.step(1e14).stage;
    }
    expect(stage2).toBe(LifecycleStage.RedGiant);
    expect(internalParticles(kernel2).some((p) => p.kind === ParticleKind.Debris)).toBe(false);
    kernel2.dispose();
    kernel.dispose();
  });

  it('throws death ejecta out unbound so it disperses rather than settling', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 1200 });
    expect(driveToRemnant(kernel)).toBe(LifecycleStage.Remnant);
    const particles = internalParticles(kernel);
    expect(particles.length).toBeGreaterThan(0);
    for (const p of particles) {
      expect(p.kind).toBe(ParticleKind.Ejecta);
    }
    kernel.dispose();
  });
});

describe('bug 2 — visitors arrive on real orbits, not radial lines through the star', () => {
  it('gives every visiting body a non-zero impact parameter', () => {
    // Regression: visitors were injected with their velocity aimed exactly at
    // the star, i.e. ZERO angular momentum. Such a body has no orbital plane: it
    // fell straight through the softened core, oscillated back and forth on a
    // fixed line forever, and its "orbit" drew as a straight streak through the
    // star. Real visitors always miss the star by some impact parameter.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 200 });
    const mu = orbitalMu(1);
    let checked = 0;
    for (let step = 0; step < 60; step += 1) {
      kernel.step(1e16);
      const bodies = kernel.getBodyBuffer();
      for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
        const base = i * BODY_STRIDE;
        const type = Math.round(bodies[base + BODY_OFFSET.type] ?? 0) as BodyType;
        if (type !== BodyType.Comet && type !== BodyType.Asteroid) {
          continue;
        }
        const pos: Vec3 = [
          bodies[base + BODY_OFFSET.x] ?? 0,
          bodies[base + BODY_OFFSET.y] ?? 0,
          bodies[base + BODY_OFFSET.z] ?? 0,
        ];
        const vel: Vec3 = [
          bodies[base + BODY_OFFSET.vx] ?? 0,
          bodies[base + BODY_OFFSET.vy] ?? 0,
          bodies[base + BODY_OFFSET.vz] ?? 0,
        ];
        // Specific angular momentum must be a real fraction of |r||v| — that is
        // exactly the statement "position and velocity are not collinear".
        const h = Math.hypot(
          pos[1] * vel[2] - pos[2] * vel[1],
          pos[2] * vel[0] - pos[0] * vel[2],
          pos[0] * vel[1] - pos[1] * vel[0],
        );
        const scale = magnitude(pos) * magnitude(vel);
        expect(h / scale).toBeGreaterThan(0.02);

        // …and therefore it has a drawable orbit that misses the star.
        const elements = orbitalElements(pos, vel, mu);
        expect(elements).not.toBeNull();
        const periapsis = elements!.semiLatusRectum / (1 + elements!.eccentricity);
        expect(periapsis).toBeGreaterThan(0.5);
        expect(orbitPathPoints(pos, vel, mu, { segments: 32 }).length).toBeGreaterThan(0);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(0);
    kernel.dispose();
  });

  it('perpendicularTo returns a unit vector orthogonal to the axis', () => {
    const axis: Vec3 = [0.3, -0.5, 0.81];
    for (const angle of [0, 1, 2.5, 4, 6]) {
      const t = perpendicularTo(axis, angle);
      expect(magnitude(t)).toBeCloseTo(1, 10);
      expect(t[0] * axis[0] + t[1] * axis[1] + t[2] * axis[2]).toBeCloseTo(0, 10);
    }
    // Different angles give genuinely different directions in that plane.
    expect(perpendicularTo(axis, 0)[0]).not.toBeCloseTo(perpendicularTo(axis, 1.5)[0], 6);
    // Degenerate axis falls back to a stable unit vector.
    expect(magnitude(perpendicularTo([0, 0, 0], 1))).toBeCloseTo(1, 10);
  });
});

describe('bug 3 — Solar-System proportions between bodies and their orbits', () => {
  it('draws every body as a minute fraction of its own orbital distance', () => {
    // Jupiter's radius is 1/11000 of its orbit; the Sun's is 1/1100 of Earth's.
    // The simulation exaggerates bodies for visibility, but must stay in a range
    // that still reads as "tiny worlds separated by vast distances" rather than
    // marbles orbiting a beach ball.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 3000 });
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage < LifecycleStage.MainSequence; i += 1) {
      stage = kernel.step(1e15).stage;
    }
    expect(stage).toBe(LifecycleStage.MainSequence);

    const bodies = kernel.getBodyBuffer();
    let innermost = Infinity;
    let planets = 0;
    for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
      const base = i * BODY_STRIDE;
      const type = Math.round(bodies[base + BODY_OFFSET.type] ?? 0) as BodyType;
      if (type !== BodyType.Planet && type !== BodyType.Protoplanet) {
        continue;
      }
      const distance = Math.hypot(
        bodies[base + BODY_OFFSET.x] ?? 0,
        bodies[base + BODY_OFFSET.y] ?? 0,
        bodies[base + BODY_OFFSET.z] ?? 0,
      );
      const radius = bodies[base + BODY_OFFSET.radius] ?? 0;
      expect(radius).toBeLessThanOrEqual(MAX_BODY_RADIUS);
      expect(radius).toBeLessThan(distance * 0.02);
      innermost = Math.min(innermost, distance);
      planets += 1;
    }
    expect(planets).toBeGreaterThan(0);

    // The star, too, is small against the innermost orbit (the Sun spans 1/200
    // of the distance to Mercury).
    expect(mainSequenceRadius(1)).toBeLessThan(innermost * 0.1);
    // …and every planet is a fraction of the star, never larger than it.
    expect(MAX_BODY_RADIUS).toBeLessThan(mainSequenceRadius(1) * 0.4);
    kernel.dispose();
  });

  it('merges oligarchs on the dynamical radius, not the drawn one', () => {
    // The visual radii are deliberately tiny; if merging used them, the emergent
    // planet count would silently depend on a purely cosmetic choice.
    expect(mergeRadius(1e-5, 1)).toBeGreaterThan(bodyRadiusFromMass(1e-5, 1) * 3);
    expect(mergeRadius(1e-3, 1)).toBeGreaterThan(bodyRadiusFromMass(1e-3, 1) * 3);
    // Still monotonic in mass, like the visual radius.
    expect(mergeRadius(1e-3, 1)).toBeGreaterThan(mergeRadius(1e-6, 1));
    expect(MIN_BODY_RADIUS).toBeLessThan(MAX_BODY_RADIUS);
  });
});

describe('bug 2 — gas giants belong in the OUTER disc', () => {
  /** Planets present once the star has ignited, sorted star-outward. */
  function planetsAtIgnition(config: SimulationConfig): { au: number; earthMasses: number }[] {
    const kernel = new TsFallbackKernel();
    kernel.init({ config, particleCount: 4000 });
    let result = kernel.step(1e17);
    for (let i = 0; i < LIFECYCLE_STEPS && result.stage < LifecycleStage.MainSequence; i += 1) {
      result = kernel.step(1e17);
    }
    expect(result.stage).toBe(LifecycleStage.MainSequence);
    const bodies = kernel.getBodyBuffer();
    const planets: { au: number; earthMasses: number }[] = [];
    for (let i = 0; i < bodies.length / BODY_STRIDE; i += 1) {
      const base = i * BODY_STRIDE;
      const type = Math.round(bodies[base + BODY_OFFSET.type] ?? 0) as BodyType;
      if (type !== BodyType.Planet && type !== BodyType.Protoplanet) {
        continue;
      }
      planets.push({
        au: Math.hypot(
          bodies[base + BODY_OFFSET.x] ?? 0,
          bodies[base + BODY_OFFSET.y] ?? 0,
          bodies[base + BODY_OFFSET.z] ?? 0,
        ),
        earthMasses: solarToEarthMasses(bodies[base + BODY_OFFSET.mass] ?? 0),
      });
    }
    kernel.dispose();
    return planets.sort((a, b) => a.au - b.au);
  }

  it('grows the most massive planet beyond the snow line, not next to the star', () => {
    const planets = planetsAtIgnition(makeConfig());
    expect(planets.length).toBeGreaterThan(4);

    const heaviest = planets.reduce((a, b) => (b.earthMasses > a.earthMasses ? b : a));
    // The reported bug: the biggest world used to be the innermost one.
    expect(heaviest.au).toBeGreaterThan(SNOW_LINE_AU);
    expect(heaviest.au).toBeLessThan(20);
    // …and it is a genuine giant, not a slightly bigger rock.
    expect(heaviest.earthMasses).toBeGreaterThan(GAS_GIANT_MIN_EARTH_MASSES);
  });

  it('leaves only small rocky worlds inside the snow line', () => {
    const planets = planetsAtIgnition(makeConfig());
    const inner = planets.filter((p) => p.au < SNOW_LINE_AU);
    const outer = planets.filter((p) => p.au >= SNOW_LINE_AU);
    expect(inner.length).toBeGreaterThan(0);
    expect(outer.length).toBeGreaterThan(0);
    for (const p of inner) {
      expect(p.earthMasses).toBeLessThan(ICE_GIANT_MIN_EARTH_MASSES);
    }
    // Every inner world is dwarfed by the giants further out.
    const heaviestInner = Math.max(...inner.map((p) => p.earthMasses));
    const heaviestOuter = Math.max(...outer.map((p) => p.earthMasses));
    expect(heaviestOuter).toBeGreaterThan(heaviestInner * 20);
  });
});

describe('bug 6 — the cloud does not collapse into the star wholesale', () => {
  it('caps the star at a fraction of its birth cloud', () => {
    const cloud = 40;
    const config = makeConfig({ mass: cloud });
    const kernel = new TsFallbackKernel();
    kernel.init({ config, particleCount: 2000 });

    // Formation is accretion-driven, so a tiny sim-dt still advances the orbital
    // clock at full rate — and keeps this massive (short-lived) star from racing
    // through its whole life before we can look at it.
    const FORMATION_DT = 1e9;
    let result = kernel.step(FORMATION_DT);
    let peak = result.starMassSolar;
    for (let i = 0; i < LIFECYCLE_STEPS && result.stage < LifecycleStage.MainSequence; i += 1) {
      result = kernel.step(FORMATION_DT);
      peak = Math.max(peak, result.starMassSolar);
    }
    expect(result.stage).toBe(LifecycleStage.MainSequence);

    const expected = stellarMassFromCloud(cloud, SOLAR_COMPOSITION.metals);
    // The whole point: a 40 M☉ cloud must NOT make a 40 M☉ star.
    expect(expected).toBeLessThan(cloud * 0.45);
    expect(peak).toBeCloseTo(expected, 5);

    // Keep stepping: the star can never grow past its budget however much dust
    // is still around — the rest is driven off by its own radiation.
    for (let i = 0; i < 60; i += 1) {
      result = kernel.step(FORMATION_DT);
      expect(result.starMassSolar).toBeLessThanOrEqual(expected + 1e-9);
    }
    kernel.dispose();
  });

  it('reports the star growing from a seed rather than appearing fully formed', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 1500 });
    const first = kernel.step(1e17).starMassSolar;
    const final = stellarMassFromCloud(SOLAR_CLOUD_MASS, SOLAR_COMPOSITION.metals);
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(final * 0.5);
    kernel.dispose();
  });

  it('leaves only a compact remnant of the star behind', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig(), particleCount: 800 });
    let result = kernel.step(1e17);
    for (let i = 0; i < LIFECYCLE_STEPS && result.stage < LifecycleStage.Remnant; i += 1) {
      result = kernel.step(1e17);
    }
    expect(result.stage).toBe(LifecycleStage.Remnant);
    // A solar star leaves a ~0.5 M☉ white dwarf, not a 1 M☉ one.
    expect(result.starMassSolar).toBeLessThan(0.8);
    expect(result.starMassSolar).toBeGreaterThan(0.2);
    kernel.dispose();
  });
});

describe('the death is a watchable, physically staged sequence', () => {
  /** Drive to the given stage with a deliberately enormous per-step sim dt. */
  function driveTo(kernel: TsFallbackKernel, stage: LifecycleStage): number {
    let steps = 0;
    for (let i = 0; i < LIFECYCLE_STEPS; i += 1) {
      const result = kernel.step(1e18);
      steps += 1;
      if (result.stage >= stage) {
        return steps;
      }
    }
    return -1;
  }

  it('never crosses the death in a single step, however fast the clock runs', () => {
    // Reported: "the transition to the neutron star happens all of a sudden, the
    // star just shrinks". The stellar clock is compressed by up to ~14 orders of
    // magnitude, so one frame spanned far more than the ~10^4 yr the death lasts
    // and the star jumped from red giant straight to remnant.
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig({ mass: cloudMassForStar(14, 0.02) }), particleCount: 1500 });

    let deathSteps = 0;
    let sawDeath = false;
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage !== LifecycleStage.Remnant; i += 1) {
      stage = kernel.step(1e18).stage;
      if (stage === LifecycleStage.Death) {
        sawDeath = true;
        deathSteps += 1;
      }
    }
    expect(sawDeath).toBe(true);
    expect(stage).toBe(LifecycleStage.Remnant);
    expect(deathSteps).toBeGreaterThan(DEATH_PHASES.minSteps * 0.9);
    kernel.dispose();
  });

  it('reports a smoothly rising progress through the death rather than a jump', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig({ mass: cloudMassForStar(14, 0.02) }), particleCount: 800 });
    expect(driveTo(kernel, LifecycleStage.Death)).toBeGreaterThan(0);

    const samples: number[] = [];
    for (let i = 0; i < DEATH_PHASES.minSteps; i += 1) {
      const result = kernel.step(1e18);
      if (result.stage !== LifecycleStage.Death) {
        break;
      }
      samples.push(result.stageProgress);
    }
    expect(samples.length).toBeGreaterThan(DEATH_PHASES.minSteps * 0.8);
    // Monotonic, and no single step swallows a large slice of the stage.
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]!).toBeGreaterThanOrEqual(samples[i - 1]!);
      expect(samples[i]! - samples[i - 1]!).toBeLessThan(0.02);
    }
    kernel.dispose();
  });

  it('holds the blast until shock breakout, then throws an unbound shell', () => {
    const cloud = cloudMassForStar(14, 0.02);
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig({ mass: cloud }), particleCount: 1500 });
    expect(driveTo(kernel, LifecycleStage.Death)).toBeGreaterThan(0);

    // The core is still imploding: nothing has been expelled yet.
    expect(internalParticles(kernel).some((p) => p.kind === ParticleKind.Ejecta)).toBe(false);

    let broke = false;
    for (let i = 0; i < LIFECYCLE_STEPS && !broke; i += 1) {
      const result = kernel.step(1e18);
      broke =
        result.stage !== LifecycleStage.Death || result.stageProgress >= DEATH_PHASES.shockBreakout;
    }
    const ejecta = internalParticles(kernel).filter((p) => p.kind === ParticleKind.Ejecta);
    expect(ejecta.length).toBeGreaterThan(100);

    // Every fragment is unbound, so the shell disperses and the remnant is left
    // bare instead of ringed by fallback material.
    const mu = orbitalMu(cloud);
    for (const p of ejecta) {
      const r = Math.hypot(p.x, p.y, p.z);
      const speed = Math.hypot(p.vx, p.vy, p.vz);
      expect(isBound(mu, r, speed)).toBe(false);
    }
    kernel.dispose();
  });

  it('keeps the expanding shell in frame long enough to be watched', () => {
    // The shell has to sweep out THROUGH the planetary system, not leave it in a
    // handful of frames: it is the whole death scene.
    const cloud = cloudMassForStar(14, 0.02);
    const kernel = new TsFallbackKernel();
    kernel.init({ config: makeConfig({ mass: cloud }), particleCount: 1500 });
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS && stage !== LifecycleStage.Remnant; i += 1) {
      stage = kernel.step(1e18).stage;
    }
    expect(stage).toBe(LifecycleStage.Remnant);
    const radii = internalParticles(kernel).map((p) => Math.hypot(p.x, p.y, p.z));
    expect(radii.length).toBeGreaterThan(500);
    // Still a coherent SHELL — a narrow band of radii, not a filled ball.
    const min = Math.min(...radii);
    const max = Math.max(...radii);
    expect(min).toBeGreaterThan(0);
    expect(max / min).toBeLessThan(3);
    kernel.dispose();
  });
});

describe('bug 7 — the integrator never manufactures the energy that ejects a planet', () => {
  // A HEAVY, COMPACT cloud is the hard case: mu scales with the cloud mass while
  // the innermost orbit shrinks with the cloud extent, so the innermost orbital
  // rate omega = sqrt(mu / (r^2 + eps^2)^1.5) is at its largest. With a fixed
  // timestep the substep no longer resolved that orbit (h*omega ~ 1 at apoapsis
  // and past the h*omega = 2 stability limit at periapsis), and semi-implicit
  // Euler ADDED energy: the inner planet flipped from bound to unbound in a
  // single step and left the system at ~550 AU, with nothing pulling on it.

  /** Softened specific orbital energy of every planet/protoplanet in the buffer. */
  function planetEnergies(kernel: TsFallbackKernel, mu: number): number[] {
    const buf = kernel.getBodyBuffer();
    const out: number[] = [];
    for (let i = 0; i < buf.length / BODY_STRIDE; i += 1) {
      const b = i * BODY_STRIDE;
      const type = buf[b + BODY_OFFSET.type] as BodyType;
      if (type !== BodyType.Planet && type !== BodyType.Protoplanet) {
        continue;
      }
      const r = Math.hypot(
        buf[b + BODY_OFFSET.x]!,
        buf[b + BODY_OFFSET.y]!,
        buf[b + BODY_OFFSET.z]!,
      );
      const v2 =
        buf[b + BODY_OFFSET.vx]! ** 2 +
        buf[b + BODY_OFFSET.vy]! ** 2 +
        buf[b + BODY_OFFSET.vz]! ** 2;
      out.push(0.5 * v2 - mu / Math.sqrt(r * r + SOFTENING * SOFTENING));
    }
    return out;
  }

  it('keeps every planet bound in a heavy, compact cloud', () => {
    const mass = cloudMassForStar(18, 0.05);
    const config = makeConfig({
      mass,
      cloudExtent: 25,
      pace: 1,
      composition: { hydrogen: 0.7175, helium: 0.2325, metals: 0.05 },
    });
    const mu = orbitalMu(mass);
    const kernel = new TsFallbackKernel();
    kernel.init({ config, particleCount: 600 });
    for (let i = 0; i < 400; i += 1) {
      kernel.step(1e14);
      for (const energy of planetEnergies(kernel, mu)) {
        // Negative == gravitationally bound. Nothing in the model can unbind a
        // planet while the star lives, so a positive energy is the integrator's.
        expect(energy).toBeLessThan(0);
      }
    }
    kernel.dispose();
  });

  it('resolves an eccentric orbit at PERIAPSIS, not merely where the body is now', () => {
    // Closest approach is where a body moves fastest, so that is what must set
    // the substep: a planet sitting quietly at 3.2 AU can be diving to 1.0 AU
    // inside the very next step. Sizing the step for its CURRENT distance left
    // the periapsis passage under-resolved and a jumped 2.3 AU -> unbound.
    const pos: Vec3 = [3.2, 0, 0];
    // Slow, highly eccentric orbit: same distance, far smaller periapsis.
    const vel: Vec3 = [0, 0, circularSpeed(400, SOFTENING, 3.2) * 0.45];
    const q = periapsisDistance(400, pos, vel);
    expect(q).toBeLessThan(1.2);
    expect(q).toBeGreaterThan(0);
    // ...and the substep chosen for that periapsis is far finer than the one the
    // body's present distance would have suggested.
    expect(stableSubstep(400, SOFTENING, q)).toBeLessThan(
      stableSubstep(400, SOFTENING, magnitude(pos)),
    );
  });

  it('never advances a substep past the orbit-resolution (CFL) condition', () => {
    // h * omega <= ORBIT_RESOLUTION for the fastest orbit, and never above the
    // fixed ceiling for slow ones.
    for (const mu of [50, 200, 1000, 5000]) {
      for (const r of [0.3, 1, 5, 40]) {
        const h = stableSubstep(mu, SOFTENING, r);
        const omega = Math.sqrt(mu / Math.pow(r * r + SOFTENING * SOFTENING, 1.5));
        expect(h * omega).toBeLessThanOrEqual(ORBIT_RESOLUTION + 1e-9);
        expect(h).toBeLessThanOrEqual(INTERNAL_DT + 1e-12);
        expect(h).toBeGreaterThan(0);
      }
    }
  });
});

describe('bug 9 — the reported orbital state is the PHYSICAL state', () => {
  it('never reports a bound eccentric planet as unbound at periapsis', () => {
    // Reproduces the real failure: a weakly-bound, very eccentric planet
    // (E0 = -46, periapsis ~0.9 AU) in one of the heaviest clouds. Semi-implicit
    // Euler returns v a HALF-STEP ahead of x, so the pair it hands back is not a
    // point on the trajectory; the instantaneous energy derived from it swings
    // by O(h*omega), worst exactly at periapsis where the body is fastest. The
    // planet was therefore reported UNBOUND on every perihelion pass even though
    // its orbit never changed — and that number is not cosmetic: `classifyVisitor`
    // decides a comet's capture-or-escape from precisely this quantity.
    const mu = 1232;
    const a = 13.4;
    const ecc = 0.93;
    const apoapsis = a * (1 + ecc);
    // Angular momentum of the conic, so the orbit really has this shape.
    const angularMomentum = Math.sqrt(mu * a * (1 - ecc * ecc));
    const start: Vec3 = [apoapsis, 0, 0];
    const startVel: Vec3 = [0, 0, angularMomentum / apoapsis];

    const energyOf = (p: Vec3, v: Vec3): number => totalSpecificEnergySoftened(mu, SOFTENING, p, v);
    const initial = energyOf(start, startVel);
    expect(initial).toBeLessThan(0);

    const h = stableSubstep(mu, SOFTENING, periapsisDistance(mu, start, startVel));

    /** The previous integrator, kept here purely to pin the regression. */
    const semiImplicitEuler = (p: Vec3, v: Vec3): { pos: Vec3; vel: Vec3 } => {
      const acc = softenedAccel(mu, SOFTENING, p);
      const nv: Vec3 = [v[0] + acc[0] * h, v[1] + acc[1] * h, v[2] + acc[2] * h];
      return { pos: [p[0] + nv[0] * h, p[1] + nv[1] * h, p[2] + nv[2] * h], vel: nv };
    };

    const countSpuriousEscapes = (
      advance: (p: Vec3, v: Vec3) => { pos: Vec3; vel: Vec3 },
    ): { escapes: number; sawPeriapsis: boolean } => {
      let pos = start;
      let vel = startVel;
      let escapes = 0;
      let minRadius = Infinity;
      for (let i = 0; i < 40000; i += 1) {
        const next = advance(pos, vel);
        pos = next.pos;
        vel = next.vel;
        minRadius = Math.min(minRadius, magnitude(pos));
        if (energyOf(pos, vel) >= 0) {
          escapes += 1;
        }
      }
      // Several perihelion passages really were sampled.
      return { escapes, sawPeriapsis: minRadius < 1.5 };
    };

    const euler = countSpuriousEscapes(semiImplicitEuler);
    const verlet = countSpuriousEscapes((p, v) => integrateOrbit(p, v, mu, SOFTENING, h));

    expect(euler.sawPeriapsis).toBe(true);
    expect(verlet.sawPeriapsis).toBe(true);
    // The bug, pinned: the old scheme declared this bound planet unbound.
    expect(euler.escapes).toBeGreaterThan(0);
    // The fix: velocity-Verlet keeps x and v synchronized, so it never does.
    expect(verlet.escapes).toBe(0);
  });

  it('conserves energy far better than the scheme it replaced', () => {
    const mu = 1232;
    let pos: Vec3 = [4.5, 0, 0];
    let vel: Vec3 = [0, 0, circularSpeed(mu, SOFTENING, 4.5) * 0.62];
    const initial = totalSpecificEnergySoftened(mu, SOFTENING, pos, vel);
    const h = stableSubstep(mu, SOFTENING, periapsisDistance(mu, pos, vel));
    let worst = 0;
    for (let i = 0; i < 20000; i += 1) {
      const next = integrateOrbit(pos, vel, mu, SOFTENING, h);
      pos = next.pos;
      vel = next.vel;
      worst = Math.max(
        worst,
        Math.abs(totalSpecificEnergySoftened(mu, SOFTENING, pos, vel) - initial) /
          Math.abs(initial),
      );
    }
    // Symplectic: the error OSCILLATES within a bound rather than drifting, and
    // that bound is ~6x tighter than semi-implicit Euler's at the same timestep.
    expect(worst).toBeLessThan(0.05);
  });
});

describe('brown dwarfs — a cloud too light to make a star never makes one', () => {
  /** A cloud whose star-formation budget lands well below 0.08 M☉. */
  function substellarConfig(): SimulationConfig {
    return makeConfig({ mass: 0.1, cloudExtent: 20, pace: 1 });
  }

  function runToTerminal(kernel: TsFallbackKernel): {
    stage: LifecycleStage;
    events: SimEventType[];
    starMass: number;
  } {
    const events: SimEventType[] = [];
    let stage = LifecycleStage.DustCloud;
    let starMass = 0;
    for (let i = 0; i < LIFECYCLE_STEPS * 4 && stage !== LifecycleStage.Remnant; i += 1) {
      const res = kernel.step(1e17);
      events.push(...res.events.map((e) => e.type));
      stage = res.stage;
      starMass = res.starMassSolar;
    }
    return { stage, events, starMass };
  }

  it('never ignites: no fusion event, no main sequence, no red giant, no death', () => {
    const config = substellarConfig();
    const stellar = stellarMassFromCloud(config.mass, config.composition.metals);
    // Precondition: this really is a substellar cloud.
    expect(stellar).toBeLessThan(FATE_THRESHOLDS.hydrogenBurningMinMass);

    const kernel = new TsFallbackKernel();
    kernel.init({ config, particleCount: 400 });
    const { stage, events } = runToTerminal(kernel);

    expect(stage).toBe(LifecycleStage.Remnant);
    // Only the LIFECYCLE events; comets and asteroids come and go throughout.
    const lifecycle = events.filter((t) =>
      [
        SimEventType.CollapseOnset,
        SimEventType.ProtostarFormed,
        SimEventType.FusionIgnition,
        SimEventType.RedGiantOnset,
        SimEventType.DeathEvent,
        SimEventType.RemnantFormed,
      ].includes(t),
    );
    // It collapses and forms a protostar — then stops. Degeneracy halts the
    // contraction before the core reaches ~10^7 K, so hydrogen never lights.
    expect(lifecycle).toEqual([
      SimEventType.CollapseOnset,
      SimEventType.ProtostarFormed,
      SimEventType.RemnantFormed,
    ]);
    expect(lifecycle).not.toContain(SimEventType.FusionIgnition);
    expect(lifecycle).not.toContain(SimEventType.RedGiantOnset);
    expect(lifecycle).not.toContain(SimEventType.DeathEvent);
    kernel.dispose();
  });

  it('reports itself as a brown dwarf that kept all of its mass', () => {
    const config = substellarConfig();
    const stellar = stellarMassFromCloud(config.mass, config.composition.metals);
    const kernel = new TsFallbackKernel();
    kernel.init({ config, particleCount: 400 });
    const { starMass } = runToTerminal(kernel);

    expect(determineFate(stellar, config.composition).remnant).toBe(RemnantType.BrownDwarf);
    // Every other outcome sheds mass on the way out; this one has nothing to
    // shed, because it never dies.
    expect(starMass).toBeCloseTo(stellar, 6);
    kernel.dispose();
  });

  it('throws no ejecta and keeps its disc — there is no explosion to have', () => {
    const kernel = new TsFallbackKernel();
    kernel.init({ config: substellarConfig(), particleCount: 800 });
    runToTerminal(kernel);
    const particles = internalParticles(kernel);
    // A supernova/planetary-nebula shell would be Ejecta; a brown dwarf makes
    // neither, so nothing here may be ejecta.
    expect(particles.some((p) => p.kind === ParticleKind.Ejecta)).toBe(false);
    // ...and its planets are not swept away by a blast that never happened.
    const bodies = kernel.getBodyBuffer().length / BODY_STRIDE;
    expect(bodies).toBeGreaterThan(0);
    kernel.dispose();
  });

  it('stops its clock at the formation timescale, not a stellar lifetime', () => {
    const config = substellarConfig();
    const kernel = new TsFallbackKernel();
    kernel.init({ config, particleCount: 400 });
    let elapsed = 0;
    let stage = LifecycleStage.DustCloud;
    for (let i = 0; i < LIFECYCLE_STEPS * 4 && stage !== LifecycleStage.Remnant; i += 1) {
      const res = kernel.step(1e17);
      stage = res.stage;
      elapsed = res.elapsedSimSeconds;
    }
    // It formed over a few Myr and is now simply cooling: the multi-Gyr main
    // sequence, red giant and death durations must NOT be on its clock.
    const myr = 1e6 * 365.25 * 24 * 3600;
    expect(elapsed / myr).toBeGreaterThan(0.5);
    expect(elapsed / myr).toBeLessThan(50);
    kernel.dispose();
  });
});
