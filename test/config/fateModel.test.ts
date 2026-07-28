import { describe, it, expect } from 'vitest';
import {
  determineFate,
  effectiveFinalMass,
  remnantMass,
  fateModel,
  FATE_THRESHOLDS,
  RemnantType,
} from '../../src/config/fateModel';
import type { CloudComposition } from '../../src/config/SimulationConfig';

// Solar composition sits exactly at the reference metallicity, so it applies no
// mass-loss modifier — effectiveFinalMass === mass. Boundary tests use it to
// isolate the pure mass thresholds.
const SOLAR: CloudComposition = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };

describe('effectiveFinalMass', () => {
  it('leaves mass unchanged at solar metallicity', () => {
    expect(effectiveFinalMass(10, SOLAR)).toBeCloseTo(10, 10);
  });

  it('reduces mass for higher-than-solar metallicity', () => {
    const metalRich: CloudComposition = { hydrogen: 0.6, helium: 0.2, metals: 0.2 };
    expect(effectiveFinalMass(10, metalRich)).toBeLessThan(10);
  });

  it('increases mass for lower-than-solar metallicity', () => {
    const metalPoor: CloudComposition = { hydrogen: 0.75, helium: 0.25, metals: 0 };
    expect(effectiveFinalMass(10, metalPoor)).toBeGreaterThan(10);
  });

  it('never returns a negative mass', () => {
    const extreme: CloudComposition = { hydrogen: 0, helium: 0, metals: 1 };
    expect(effectiveFinalMass(10, extreme)).toBeGreaterThanOrEqual(0);
  });
});

describe('determineFate — mass boundaries at solar composition', () => {
  it('forms a quiet white dwarf just below the supernova threshold', () => {
    const fate = determineFate(FATE_THRESHOLDS.supernovaMinMass - 0.1, SOLAR);
    expect(fate).toEqual({ supernova: false, remnant: RemnantType.WhiteDwarf });
  });

  it('forms a neutron star at the supernova threshold', () => {
    const fate = determineFate(FATE_THRESHOLDS.supernovaMinMass, SOLAR);
    expect(fate).toEqual({ supernova: true, remnant: RemnantType.NeutronStar });
  });

  it('stays a neutron star just below the pulsar threshold', () => {
    const fate = determineFate(FATE_THRESHOLDS.pulsarMinMass - 0.1, SOLAR);
    expect(fate).toEqual({ supernova: true, remnant: RemnantType.NeutronStar });
  });

  it('forms a pulsar at/above the pulsar threshold', () => {
    expect(determineFate(FATE_THRESHOLDS.pulsarMinMass, SOLAR)).toEqual({
      supernova: true,
      remnant: RemnantType.Pulsar,
    });
    expect(determineFate(20, SOLAR).remnant).toBe(RemnantType.Pulsar);
  });
});

describe('determineFate — black-hole channel', () => {
  it('collapses to a black hole above the TOV-limit progenitor mass', () => {
    const fate = determineFate(FATE_THRESHOLDS.blackHoleMinMass, SOLAR);
    expect(fate).toEqual({ supernova: true, remnant: RemnantType.BlackHole });
  });

  it('still forms a pulsar just below the black-hole threshold', () => {
    expect(determineFate(FATE_THRESHOLDS.blackHoleMinMass - 0.1, SOLAR).remnant).toBe(
      RemnantType.Pulsar,
    );
  });

  it('collapses directly (no supernova) for the heaviest progenitors', () => {
    const fate = determineFate(FATE_THRESHOLDS.directCollapseMinMass + 5, SOLAR);
    expect(fate).toEqual({ supernova: false, remnant: RemnantType.BlackHole });
  });
});

describe('remnantMass — the star never keeps all of itself', () => {
  it('leaves a sub-Chandrasekhar white dwarf', () => {
    expect(remnantMass(1, RemnantType.WhiteDwarf)).toBeLessThan(1);
    expect(remnantMass(7, RemnantType.WhiteDwarf)).toBeLessThanOrEqual(
      FATE_THRESHOLDS.chandrasekharMass,
    );
  });

  it('keeps a neutron star between the Chandrasekhar and TOV limits', () => {
    for (const m of [9, 15, 21]) {
      const remnant = remnantMass(m, RemnantType.NeutronStar);
      expect(remnant).toBeGreaterThanOrEqual(FATE_THRESHOLDS.chandrasekharMass);
      expect(remnant).toBeLessThanOrEqual(FATE_THRESHOLDS.tovMass);
    }
  });

  it('leaves a black hole far lighter than its progenitor', () => {
    expect(remnantMass(30, RemnantType.BlackHole)).toBeLessThan(30);
    expect(remnantMass(30, RemnantType.BlackHole)).toBeGreaterThan(FATE_THRESHOLDS.tovMass);
  });
});

describe('determineFate — composition modifiers shift the outcome', () => {
  it('high metallicity pushes a borderline supernova down to a white dwarf', () => {
    const mass = FATE_THRESHOLDS.supernovaMinMass + 0.2; // 8.2, above the raw threshold
    const metalRich: CloudComposition = { hydrogen: 0.6, helium: 0.2, metals: 0.2 };
    expect(effectiveFinalMass(mass, metalRich)).toBeLessThan(FATE_THRESHOLDS.supernovaMinMass);
    expect(determineFate(mass, metalRich).remnant).toBe(RemnantType.WhiteDwarf);
  });

  it('low metallicity lifts a borderline neutron star up to a pulsar', () => {
    const mass = FATE_THRESHOLDS.pulsarMinMass - 0.3; // 11.7, below the raw pulsar threshold
    const metalPoor: CloudComposition = { hydrogen: 0.76, helium: 0.24, metals: 0 };
    expect(effectiveFinalMass(mass, metalPoor)).toBeGreaterThanOrEqual(
      FATE_THRESHOLDS.pulsarMinMass,
    );
    expect(determineFate(mass, metalPoor).remnant).toBe(RemnantType.Pulsar);
  });
});

describe('fateModel', () => {
  it('delegates to determineFate', () => {
    expect(fateModel.determineFate(1, SOLAR)).toEqual(determineFate(1, SOLAR));
  });
});
