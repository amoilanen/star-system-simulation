import { describe, it, expect } from 'vitest';
import { PRESETS, DEFAULT_PRESET_ID, configFromPreset } from '../../src/config/presets';
import { isValidComposition } from '../../src/config/SimulationConfig';
import { determineFate, RemnantType } from '../../src/config/fateModel';

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
    const sunLike = configFromPreset('sun-like');
    const lowMass = configFromPreset('low-mass');
    const highMass = configFromPreset('high-mass');

    expect(determineFate(sunLike.mass, sunLike.composition).remnant).toBe(RemnantType.WhiteDwarf);
    expect(determineFate(lowMass.mass, lowMass.composition).remnant).toBe(RemnantType.WhiteDwarf);

    const highFate = determineFate(highMass.mass, highMass.composition);
    expect(highFate.supernova).toBe(true);
    expect(highFate.remnant).toBe(RemnantType.Pulsar);
  });
});
