import { describe, it, expect } from 'vitest';
import {
  PRESETS,
  DEFAULT_PRESET_ID,
  configFromPreset,
  type SimulationPreset,
} from '../../src/config/presets';
import { isValidComposition, normalizeComposition } from '../../src/config/SimulationConfig';
import { determineFate, isSubstellar, RemnantType } from '../../src/config/fateModel';
import { stellarMassFromCloud } from '../../src/config/starFormation';
import { MASS_MIN, MASS_MAX } from '../../src/ui/SetupForm';
import { CATALOGS } from '../../src/i18n/i18n';

describe('presets', () => {
  it('exposes sun-like as the default preset', () => {
    expect(DEFAULT_PRESET_ID).toBe('sun-like');
    expect(PRESETS[DEFAULT_PRESET_ID]).toBeDefined();
  });

  it('each preset yields a valid SimulationConfig', () => {
    for (const id of Object.keys(PRESETS)) {
      const config = configFromPreset(id);
      expect(config.presetId).toBe(id);
      expect(isValidComposition(config.composition)).toBe(true);
      expect(config.mass).toBeGreaterThan(0);
      expect(config.cloudExtent).toBeGreaterThan(0);
      expect(config.pace).toBeGreaterThanOrEqual(0);
      expect(config.pace).toBeLessThanOrEqual(1);
    }
  });

  it('applies per-session locale and annotation options', () => {
    const config = configFromPreset('sun-like', { locale: 'fi', showEventAnnotations: true });
    expect(config.locale).toBe('fi');
    expect(config.showEventAnnotations).toBe(true);
  });

  it('defaults locale to en and annotations off', () => {
    const config = configFromPreset('sun-like');
    expect(config.locale).toBe('en');
    expect(config.showEventAnnotations).toBe(false);
  });

  it('throws on an unknown preset id', () => {
    expect(() => configFromPreset('nope')).toThrow(RangeError);
  });

  it('presets span the intended death paths for educational contrast', () => {
    // Fates follow the STAR's mass, and a cloud only turns ~a third of itself
    // into a star (see `starFormation.ts`) — so the preset must be resolved
    // through that conversion, exactly as the runner does.
    const fateOf = (id: string): ReturnType<typeof determineFate> => {
      const config = configFromPreset(id);
      const star = stellarMassFromCloud(config.mass, config.composition.metals);
      return determineFate(star, config.composition);
    };

    expect(fateOf('sun-like').remnant).toBe(RemnantType.WhiteDwarf);
    expect(fateOf('low-mass').remnant).toBe(RemnantType.WhiteDwarf);

    const highFate = fateOf('high-mass');
    expect(highFate.supernova).toBe(true);
    expect(highFate.remnant).toBe(RemnantType.Pulsar);

    // A black hole must be REACHABLE from the setup screen (reported bug 1).
    expect(fateOf('black-hole').remnant).toBe(RemnantType.BlackHole);
  });

  it('states cloud masses that really do assemble the intended stars', () => {
    const starOf = (id: string): number => {
      const config = configFromPreset(id);
      return stellarMassFromCloud(config.mass, config.composition.metals);
    };
    expect(starOf('sun-like')).toBeCloseTo(1, 1);
    expect(starOf('low-mass')).toBeCloseTo(0.5, 1);
    // The cloud is always several times heavier than the star it makes.
    for (const id of Object.keys(PRESETS)) {
      expect(PRESETS[id]!.mass).toBeGreaterThan(starOf(id) * 2);
    }
  });
});

describe('presets cover every outcome the fate model can produce', () => {
  /** The star each preset actually assembles, and the fate that follows. */
  function outcomeOf(preset: SimulationPreset): {
    starMass: number;
    remnant: RemnantType;
    supernova: boolean;
  } {
    const composition = normalizeComposition(preset.composition);
    const starMass = stellarMassFromCloud(preset.mass, composition.metals);
    const fate = determineFate(starMass, composition);
    return { starMass, remnant: fate.remnant, supernova: fate.supernova };
  }

  it('reaches every remnant type, so each is one click away', () => {
    const reached = new Set(Object.values(PRESETS).map((p) => outcomeOf(p).remnant));
    for (const remnant of [
      RemnantType.BrownDwarf,
      RemnantType.WhiteDwarf,
      RemnantType.NeutronStar,
      RemnantType.Pulsar,
      RemnantType.BlackHole,
    ]) {
      expect(reached.has(remnant), `no preset produces a ${RemnantType[remnant]}`).toBe(true);
    }
  });

  it('covers both black-hole channels: with a supernova and by direct collapse', () => {
    const holes = Object.values(PRESETS)
      .map(outcomeOf)
      .filter((o) => o.remnant === RemnantType.BlackHole);
    expect(holes.some((o) => o.supernova)).toBe(true);
    // Above ~40 M☉ the envelope is swallowed rather than expelled: the star
    // simply winks out. A visibly different death, so it earns its own preset.
    expect(holes.some((o) => !o.supernova)).toBe(true);
  });

  it('names each outcome-specific preset after the outcome it actually produces', () => {
    expect(outcomeOf(PRESETS['brown-dwarf']!).remnant).toBe(RemnantType.BrownDwarf);
    expect(outcomeOf(PRESETS['neutron-star']!).remnant).toBe(RemnantType.NeutronStar);
    expect(outcomeOf(PRESETS['pulsar']!).remnant).toBe(RemnantType.Pulsar);
    expect(outcomeOf(PRESETS['black-hole']!).remnant).toBe(RemnantType.BlackHole);
    expect(outcomeOf(PRESETS['direct-collapse']!).remnant).toBe(RemnantType.BlackHole);
    expect(outcomeOf(PRESETS['direct-collapse']!).supernova).toBe(false);
  });

  it('only the brown-dwarf preset is substellar', () => {
    for (const [id, preset] of Object.entries(PRESETS)) {
      expect(isSubstellar(outcomeOf(preset).starMass), `${id}`).toBe(id === 'brown-dwarf');
    }
  });

  it('keeps every preset inside the setup form’s own slider range', () => {
    for (const [id, preset] of Object.entries(PRESETS)) {
      expect(preset.mass, `${id} below MASS_MIN`).toBeGreaterThanOrEqual(MASS_MIN);
      expect(preset.mass, `${id} above MASS_MAX`).toBeLessThanOrEqual(MASS_MAX);
    }
  });

  it('lists presets in ascending cloud mass, so the dropdown reads as a spectrum', () => {
    const masses = Object.values(PRESETS).map((p) => p.mass);
    for (let i = 1; i < masses.length; i += 1) {
      expect(masses[i]!).toBeGreaterThan(masses[i - 1]!);
    }
  });

  it('has a localized name for every preset in every catalog', () => {
    for (const preset of Object.values(PRESETS)) {
      for (const [locale, catalog] of Object.entries(CATALOGS)) {
        expect(
          catalog[preset.nameMessageId],
          `${locale} is missing ${preset.nameMessageId}`,
        ).toBeTruthy();
      }
    }
  });
});
