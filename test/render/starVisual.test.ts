import { describe, it, expect } from 'vitest';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import {
  blackbodyColor,
  mainSequenceTemperature,
  starAppearance,
} from '../../src/render/starVisual';

describe('blackbodyColor ramp', () => {
  it('returns components within [0,1]', () => {
    for (const t of [1000, 3500, 5800, 15000, 30000]) {
      const c = blackbodyColor(t);
      for (const v of [c.r, c.g, c.b]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('maps cool temperatures to red-dominant colors', () => {
    const c = blackbodyColor(1200);
    expect(c.r).toBeGreaterThan(c.g);
    expect(c.g).toBeGreaterThan(c.b);
    expect(c.b).toBeLessThan(0.2);
  });

  it('maps ~6600K to near-white (all channels high)', () => {
    const c = blackbodyColor(6600);
    expect(c.r).toBeGreaterThan(0.9);
    expect(c.g).toBeGreaterThan(0.8);
    expect(c.b).toBeGreaterThan(0.85);
  });

  it('maps hot temperatures to blue-dominant colors', () => {
    const c = blackbodyColor(30000);
    expect(c.b).toBeGreaterThanOrEqual(c.r);
    expect(c.b).toBeGreaterThan(0.9);
  });

  it('is monotonic in blue content from cool to hot', () => {
    expect(blackbodyColor(2000).b).toBeLessThan(blackbodyColor(6600).b);
    expect(blackbodyColor(6600).b).toBeLessThanOrEqual(blackbodyColor(20000).b);
  });

  it('clamps out-of-domain temperatures without producing NaN', () => {
    const cold = blackbodyColor(-5);
    const hot = blackbodyColor(1e9);
    for (const v of [cold.r, cold.g, cold.b, hot.r, hot.g, hot.b]) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});

describe('mainSequenceTemperature', () => {
  it('places a solar-mass star near 5800K', () => {
    expect(mainSequenceTemperature(1)).toBeCloseTo(5800, -2);
  });

  it('makes higher-mass stars hotter', () => {
    expect(mainSequenceTemperature(10)).toBeGreaterThan(mainSequenceTemperature(1));
    expect(mainSequenceTemperature(1)).toBeGreaterThan(mainSequenceTemperature(0.2));
  });
});

describe('starAppearance by stage', () => {
  it('hides the star during the dust cloud stage', () => {
    const a = starAppearance(LifecycleStage.DustCloud, 1, 0.5);
    expect(a.visible).toBe(false);
    expect(a.radius).toBe(0);
  });

  it('swells the radius as the red giant progresses', () => {
    const early = starAppearance(LifecycleStage.RedGiant, 1, 0);
    const late = starAppearance(LifecycleStage.RedGiant, 1, 1);
    expect(late.radius).toBeGreaterThan(early.radius * 3);
  });

  it('renders a sweeping beam only for the pulsar remnant', () => {
    const pulsar = starAppearance(LifecycleStage.Remnant, 15, 1, RemnantType.Pulsar);
    const wd = starAppearance(LifecycleStage.Remnant, 1, 1, RemnantType.WhiteDwarf);
    expect(pulsar.pulsarBeam).toBe(true);
    expect(wd.pulsarBeam).toBe(false);
    expect(wd.visible).toBe(true);
  });

  it('makes the white dwarf hot and blue-white', () => {
    const wd = starAppearance(LifecycleStage.Remnant, 1, 1, RemnantType.WhiteDwarf);
    expect(wd.temperatureK).toBeGreaterThan(10000);
    expect(wd.color.b).toBeGreaterThan(0.8);
  });
});
