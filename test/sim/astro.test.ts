import { describe, it, expect } from 'vitest';
import {
  auToScene,
  coreTemperatureK,
  equilibriumTemperatureK,
  orbitalVelocityKms,
  sceneToAu,
  solarToEarthMasses,
  solarToJupiterMasses,
  stellarRadiusSolar,
  SOLAR_CORE_TEMPERATURE_K,
  SOLAR_EFFECTIVE_TEMPERATURE_K,
} from '../../src/sim/astro';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';

describe('scene ⇄ AU conversion', () => {
  it('round-trips', () => {
    expect(sceneToAu(auToScene(4.2))).toBeCloseTo(4.2, 9);
  });

  it('clamps negatives to zero', () => {
    expect(sceneToAu(-5)).toBe(0);
    expect(auToScene(-5)).toBe(0);
  });
});

describe('mass conversions', () => {
  it('converts solar to Earth masses', () => {
    expect(solarToEarthMasses(1)).toBeCloseTo(332946, 0);
    // Jupiter is ~9.55e-4 M☉ ⇒ ~318 M⊕.
    expect(solarToEarthMasses(9.55e-4)).toBeGreaterThan(310);
    expect(solarToEarthMasses(9.55e-4)).toBeLessThan(325);
  });

  it('converts solar to Jupiter masses', () => {
    expect(solarToJupiterMasses(1)).toBeCloseTo(1047.35, 2);
    expect(solarToJupiterMasses(9.55e-4)).toBeCloseTo(1, 1);
  });
});

describe('orbitalVelocityKms (Kepler)', () => {
  it('gives Earth ~29.78 km/s at 1 AU around 1 M☉', () => {
    expect(orbitalVelocityKms(1, 1)).toBeCloseTo(29.78, 2);
  });

  it('gives Jupiter ~13 km/s at 5.2 AU', () => {
    expect(orbitalVelocityKms(1, 5.2)).toBeGreaterThan(12.5);
    expect(orbitalVelocityKms(1, 5.2)).toBeLessThan(13.5);
  });

  it('falls off as 1/√a and rises as √M', () => {
    expect(orbitalVelocityKms(1, 4)).toBeCloseTo(orbitalVelocityKms(1, 1) / 2, 6);
    expect(orbitalVelocityKms(4, 1)).toBeCloseTo(orbitalVelocityKms(1, 1) * 2, 6);
  });

  it('returns 0 for degenerate inputs', () => {
    expect(orbitalVelocityKms(1, 0)).toBe(0);
    expect(orbitalVelocityKms(0, 1)).toBe(0);
  });
});

describe('stellarRadiusSolar', () => {
  it('is 1 solar radius for 1 M☉ and ordered by mass', () => {
    expect(stellarRadiusSolar(1)).toBeCloseTo(1, 6);
    expect(stellarRadiusSolar(5)).toBeGreaterThan(stellarRadiusSolar(1));
    expect(stellarRadiusSolar(0.3)).toBeLessThan(stellarRadiusSolar(1));
  });
});

describe('equilibriumTemperatureK', () => {
  it('gives ~278 K for Earth (perfect absorber) at 1 AU', () => {
    const t = equilibriumTemperatureK(SOLAR_EFFECTIVE_TEMPERATURE_K, 1, 1);
    expect(t).toBeGreaterThan(270);
    expect(t).toBeLessThan(285);
  });

  it('gives ~255 K for Earth with a 0.3 Bond albedo', () => {
    const t = equilibriumTemperatureK(SOLAR_EFFECTIVE_TEMPERATURE_K, 1, 1, 0.3);
    expect(t).toBeGreaterThan(248);
    expect(t).toBeLessThan(262);
  });

  it('falls as 1/√distance', () => {
    const near = equilibriumTemperatureK(SOLAR_EFFECTIVE_TEMPERATURE_K, 1, 1);
    const far = equilibriumTemperatureK(SOLAR_EFFECTIVE_TEMPERATURE_K, 1, 4);
    expect(far).toBeCloseTo(near / 2, 4);
  });

  it('returns 0 for degenerate inputs', () => {
    expect(equilibriumTemperatureK(5772, 1, 0)).toBe(0);
    expect(equilibriumTemperatureK(0, 1, 1)).toBe(0);
  });
});

describe('coreTemperatureK', () => {
  it('is ~1.5e7 K for a solar main-sequence star', () => {
    const t = coreTemperatureK(LifecycleStage.MainSequence, 1);
    expect(t).toBeCloseTo(SOLAR_CORE_TEMPERATURE_K, -5);
  });

  it('is cold for the dust cloud and sub-fusion for a protostar', () => {
    expect(coreTemperatureK(LifecycleStage.DustCloud, 1)).toBeLessThan(1000);
    expect(coreTemperatureK(LifecycleStage.ProtostarCoalescence, 1)).toBeLessThan(1e7);
  });

  it('rises monotonically through ignition → main sequence → red giant → death', () => {
    const ignition = coreTemperatureK(LifecycleStage.FusionIgnition, 1);
    const main = coreTemperatureK(LifecycleStage.MainSequence, 1);
    const giant = coreTemperatureK(LifecycleStage.RedGiant, 1);
    const death = coreTemperatureK(LifecycleStage.Death, 1);
    expect(main).toBeGreaterThan(ignition);
    expect(giant).toBeGreaterThan(main);
    expect(death).toBeGreaterThan(giant);
  });

  it('increases with stellar mass on the main sequence', () => {
    expect(coreTemperatureK(LifecycleStage.MainSequence, 10)).toBeGreaterThan(
      coreTemperatureK(LifecycleStage.MainSequence, 1),
    );
  });

  it('distinguishes remnant kinds', () => {
    const ns = coreTemperatureK(LifecycleStage.Remnant, 20, RemnantType.NeutronStar);
    const wd = coreTemperatureK(LifecycleStage.Remnant, 1, RemnantType.WhiteDwarf);
    expect(ns).toBeGreaterThan(wd);
  });
});
