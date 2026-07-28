import { describe, it, expect } from 'vitest';
import {
  determineFate,
  effectiveFinalMass,
  remnantMass,
  isSubstellar,
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

describe('bug 8 — a remnant is never heavier than the star it came from', () => {
  it('keeps a low-mass star’s white dwarf below the progenitor mass', () => {
    // The semi-empirical initial–final mass relation M_f = 0.4 + 0.11 M_i is
    // calibrated on ≳0.8 M☉ progenitors. Applied literally to a red dwarf its
    // CONSTANT term dominates, so a 0.07 M☉ star was "leaving behind" a 0.41
    // M☉ white dwarf — six times its own mass, created from nothing.
    for (const m of [0.05, 0.07, 0.1, 0.2, 0.4, 0.5, 0.8, 1, 3, 7]) {
      expect(remnantMass(m, RemnantType.WhiteDwarf)).toBeLessThan(m);
    }
  });

  it('never returns a remnant heavier than the progenitor for any remnant kind', () => {
    for (const m of [0.05, 0.5, 1, 5, 9, 15, 25, 50, 100]) {
      for (const remnant of [
        RemnantType.WhiteDwarf,
        RemnantType.NeutronStar,
        RemnantType.Pulsar,
        RemnantType.BlackHole,
      ]) {
        // Neutron stars/black holes only ever form from massive progenitors, so
        // only check the kinds the fate model can actually produce at this mass.
        if (remnant !== RemnantType.WhiteDwarf && m < FATE_THRESHOLDS.supernovaMinMass) {
          continue;
        }
        expect(remnantMass(m, remnant)).toBeLessThan(m);
      }
    }
  });
});

describe('substellar objects — a brown dwarf is not a dead star but a failed one', () => {
  it('classifies anything below the hydrogen-burning limit as a brown dwarf', () => {
    for (const m of [0.01, 0.03, 0.05, 0.079]) {
      const fate = determineFate(m, SOLAR);
      expect(fate.remnant).toBe(RemnantType.BrownDwarf);
      // Nothing about it explodes: it never builds a core that can collapse.
      expect(fate.supernova).toBe(false);
      expect(isSubstellar(m)).toBe(true);
    }
  });

  it('classifies anything at or above the limit as a real star', () => {
    for (const m of [0.08, 0.1, 0.5, 1]) {
      expect(isSubstellar(m)).toBe(false);
      expect(determineFate(m, SOLAR).remnant).toBe(RemnantType.WhiteDwarf);
    }
  });

  it('decides on the RAW mass, not the wind-stripped one', () => {
    // The metallicity correction models line-driven winds, which are a property
    // of hot, luminous massive stars. A 0.05 M☉ object has no such wind, so
    // stripping mass from it before asking whether it can fuse would be
    // backwards — and it must not flip a real star into a brown dwarf either.
    const metalRich = { hydrogen: 0.68, helium: 0.22, metals: 0.1 };
    expect(effectiveFinalMass(0.085, metalRich)).toBeLessThan(
      FATE_THRESHOLDS.hydrogenBurningMinMass,
    );
    // ...yet it is still a star, because 0.085 M☉ CAN fuse hydrogen.
    expect(determineFate(0.085, metalRich).remnant).toBe(RemnantType.WhiteDwarf);
  });

  it('keeps all of its mass — it never dies, so it never sheds anything', () => {
    for (const m of [0.02, 0.05, 0.079]) {
      expect(remnantMass(m, RemnantType.BrownDwarf)).toBe(m);
    }
  });
});
