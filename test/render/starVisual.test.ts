import { describe, it, expect } from 'vitest';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import {
  blackbodyColor,
  mainSequenceRadius,
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

  it('renders the white dwarf as a near-white ball (ends the colour arc on white)', () => {
    const wd = starAppearance(LifecycleStage.Remnant, 1, 1, RemnantType.WhiteDwarf);
    // White = all channels high and roughly balanced (no strong blue or red cast).
    expect(wd.color.r).toBeGreaterThan(0.85);
    expect(wd.color.g).toBeGreaterThan(0.85);
    expect(wd.color.b).toBeGreaterThan(0.85);
    expect(Math.abs(wd.color.r - wd.color.b)).toBeLessThan(0.2);
  });

  it('evolves the main-sequence colour from bluer (young) to yellower (old)', () => {
    const young = starAppearance(LifecycleStage.MainSequence, 1, 0);
    const old = starAppearance(LifecycleStage.MainSequence, 1, 1);
    // Young star is hotter (bluer); ageing cools and yellows it.
    expect(young.temperatureK).toBeGreaterThan(old.temperatureK);
    // Relative blue content drops as it ages.
    expect(young.color.b / young.color.r).toBeGreaterThan(old.color.b / old.color.r);
  });

  it('tints a metal-rich star cooler than a metal-poor one of the same mass', () => {
    const metalPoor = starAppearance(LifecycleStage.MainSequence, 1, 0.5, null, {
      hydrogen: 0.78,
      helium: 0.219,
      metals: 0.001,
    });
    const metalRich = starAppearance(LifecycleStage.MainSequence, 1, 0.5, null, {
      hydrogen: 0.6,
      helium: 0.3,
      metals: 0.1,
    });
    expect(metalRich.temperatureK).toBeLessThan(metalPoor.temperatureK);
  });
});

describe('Solar-System scale (bug: arcade-sized star)', () => {
  it('keeps a main-sequence star far smaller than the inner planetary orbits', () => {
    // The Sun's radius is 0.00465 AU against Mercury at 0.39 AU. The star is
    // exaggerated ~10× for visibility, but must stay tiny next to the innermost
    // orbit (~1 AU) — it used to be drawn at 0.5 AU, i.e. half the way there.
    const r = mainSequenceRadius(1);
    expect(r).toBeGreaterThan(0.02);
    expect(r).toBeLessThan(0.06);
    // Ordered by mass, and bounded for the extremes.
    expect(mainSequenceRadius(20)).toBeGreaterThan(mainSequenceRadius(1));
    expect(mainSequenceRadius(0.1)).toBeLessThan(mainSequenceRadius(1));
    expect(mainSequenceRadius(1000)).toBeLessThanOrEqual(0.4);
  });

  it('swells the red giant to roughly the radius at which it engulfs planets', () => {
    // The kernel destroys planets inside REDGIANT_ENGULF_AU (2.2 AU for 1 M☉),
    // so the visible photosphere must grow to a comparable size — otherwise
    // planets would vanish while the star still looked small.
    const late = starAppearance(LifecycleStage.RedGiant, 1, 1);
    expect(late.radius).toBeGreaterThan(0.8);
    expect(late.radius).toBeLessThan(2.2);
    // …and it is a huge multiple of the main-sequence size, as in reality.
    expect(late.radius).toBeGreaterThan(mainSequenceRadius(1) * 20);
  });

  it('draws the compact remnant far smaller than the star it came from', () => {
    const dwarf = starAppearance(LifecycleStage.Remnant, 1, 1, RemnantType.WhiteDwarf);
    const neutron = starAppearance(LifecycleStage.Remnant, 20, 1, RemnantType.NeutronStar);
    expect(dwarf.radius).toBeLessThan(mainSequenceRadius(1));
    expect(neutron.radius).toBeLessThan(dwarf.radius);
  });
});
