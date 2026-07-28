import { describe, it, expect } from 'vitest';
import { PRESETS, DEFAULT_PRESET_ID, configFromPreset } from '../../src/config/presets';
import { isValidComposition } from '../../src/config/SimulationConfig';
import { determineFate, RemnantType } from '../../src/config/fateModel';
import { stellarMassFromCloud } from '../../src/config/starFormation';

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
