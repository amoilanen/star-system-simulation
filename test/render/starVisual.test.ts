import { describe, it, expect } from 'vitest';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import { DEATH_PHASES } from '../../src/sim/stages';
import { SOLAR_RADIUS_AU } from '../../src/sim/astro';
import {
  blackbodyColor,
  deathAppearance,
  mainSequenceRadius,
  mainSequenceTemperature,
  remnantAppearance,
  starAppearance,
  WHITE_DWARF_RADIUS,
  type StarAppearance,
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

describe('True-scale star radii (spec §3.1)', () => {
  it('uses the physical solar radius for a 1 M☉ main-sequence star', () => {
    // mainSequenceRadius now returns SOLAR_RADIUS_AU · M^0.8 (true scale).
    // For the Sun this is ≈ 0.00465 AU — visibility is maintained by the
    // StarRenderer pixel-floor, not by inflating the physical radius.
    const r = mainSequenceRadius(1);
    expect(r).toBeCloseTo(SOLAR_RADIUS_AU, 4);
    expect(r).toBeGreaterThan(0.001); // above lower clamp
    expect(r).toBeLessThan(0.05); // below upper clamp
    // Ordered by mass (M^0.8 monotone) and bounded at the upper clamp.
    expect(mainSequenceRadius(20)).toBeGreaterThan(mainSequenceRadius(1));
    expect(mainSequenceRadius(0.1)).toBeLessThan(mainSequenceRadius(1));
    expect(mainSequenceRadius(1000)).toBeLessThanOrEqual(0.05);
  });

  it('swells the red giant to roughly the radius at which it engulfs planets', () => {
    // The kernel destroys planets inside REDGIANT_ENGULF_AU (2.2 AU for 1 M☉),
    // so the visible photosphere must grow to a comparable size.
    // With RED_GIANT_SWELL = 250: 0.00465 · 250 ≈ 1.16 AU < 2.2 AU ✓.
    const late = starAppearance(LifecycleStage.RedGiant, 1, 1);
    expect(late.radius).toBeGreaterThan(0.8);
    expect(late.radius).toBeLessThan(2.2);
    // …and it is a huge multiple of the true-scale main-sequence radius.
    expect(late.radius).toBeGreaterThan(mainSequenceRadius(1) * 100);
  });

  it('draws compact remnants at true physical scale, smaller than the star', () => {
    // White dwarf ≈ Earth-radius = 4.3e-5 AU; neutron star is smaller still.
    const dwarf = starAppearance(LifecycleStage.Remnant, 1, 1, RemnantType.WhiteDwarf);
    const neutron = starAppearance(LifecycleStage.Remnant, 20, 1, RemnantType.NeutronStar);
    // Both smaller than the main-sequence star they came from.
    expect(dwarf.radius).toBeLessThan(mainSequenceRadius(1));
    // NS kept at illustrative pixel-floor level, but still physically smaller
    // than a white dwarf (real ratio: ~10 km vs ~6 400 km).
    expect(neutron.radius).toBeLessThan(dwarf.radius);
  });

  it('places the brown dwarf at roughly one Jupiter radius (5e-4 AU)', () => {
    const bd = starAppearance(LifecycleStage.Remnant, 0.05, 1, RemnantType.BrownDwarf);
    expect(bd.radius).toBeCloseTo(5e-4, 6);
    // Larger than a white dwarf but smaller than a true star.
    expect(bd.radius).toBeGreaterThan(WHITE_DWARF_RADIUS);
    expect(bd.radius).toBeLessThan(mainSequenceRadius(0.1));
  });
});

describe('bug 5 — the spectrum must be visibly a spectrum', () => {
  it('renders a hot star unmistakably blue, not white', () => {
    const hot = blackbodyColor(mainSequenceTemperature(20));
    expect(hot.b).toBe(1);
    // The blue must clearly dominate; a near-white (0.79, 0.86, 1.0) does not.
    expect(hot.b - hot.r).toBeGreaterThan(0.35);
    expect(hot.b - hot.g).toBeGreaterThan(0.2);
  });

  it('renders a cool star unmistakably orange-red', () => {
    const cool = blackbodyColor(mainSequenceTemperature(0.35));
    expect(cool.r).toBe(1);
    expect(cool.r - cool.b).toBeGreaterThan(0.6);
  });

  it('keeps a sun-like star neutral in between', () => {
    const sun = blackbodyColor(mainSequenceTemperature(1));
    expect(Math.abs(sun.r - sun.g)).toBeLessThan(0.2);
    expect(Math.abs(sun.g - sun.b)).toBeLessThan(0.2);
  });

  it('separates every mass step by a visible colour change', () => {
    const masses = [0.3, 1, 3, 10, 30];
    const blues = masses.map((m) => blackbodyColor(mainSequenceTemperature(m)).b);
    const reds = masses.map((m) => blackbodyColor(mainSequenceTemperature(m)).r);
    for (let i = 1; i < masses.length; i += 1) {
      expect(blues[i]!).toBeGreaterThanOrEqual(blues[i - 1]!);
      expect(reds[i]!).toBeLessThanOrEqual(reds[i - 1]!);
    }
    // The extremes are genuinely different colours, not two shades of white.
    expect(blues.at(-1)! - blues[0]!).toBeGreaterThan(0.5);
    expect(reds[0]! - reds.at(-1)!).toBeGreaterThan(0.5);
  });

  it('scales the mass→temperature relation steeply enough to reach O-star heat', () => {
    expect(mainSequenceTemperature(20)).toBeGreaterThan(30000);
    expect(mainSequenceTemperature(0.3)).toBeLessThan(3500);
  });
});

describe('bug 4 — compact remnants get their own presentation', () => {
  it('draws a neutron star as a smooth crust with a magnetosphere', () => {
    const ns = remnantAppearance(RemnantType.NeutronStar);
    expect(ns.visible).toBe(true);
    // No convective granulation on a degenerate crust.
    expect(ns.surfaceDetail).toBe(0);
    expect(ns.magnetosphere).toBe(true);
    expect(ns.blackHole).toBe(false);
    // Searing hot ⇒ blue.
    expect(ns.color.b).toBeGreaterThan(ns.color.r);
  });

  it('adds the sweeping beam only for a pulsar', () => {
    expect(remnantAppearance(RemnantType.Pulsar).pulsarBeam).toBe(true);
    expect(remnantAppearance(RemnantType.NeutronStar).pulsarBeam).toBe(false);
    expect(remnantAppearance(RemnantType.Pulsar).magnetosphere).toBe(true);
  });

  it('draws a black hole with no emitting surface at all', () => {
    const bh = remnantAppearance(RemnantType.BlackHole);
    expect(bh.visible).toBe(true);
    expect(bh.blackHole).toBe(true);
    // The horizon radiates nothing; the disc and photon ring carry the light.
    expect(bh.surfaceLum).toBe(0);
    expect(bh.glow).toBeGreaterThan(1);
    expect(bh.radius).toBeGreaterThan(0);
  });

  it('keeps convective granulation on true stars', () => {
    expect(starAppearance(LifecycleStage.MainSequence, 1, 0.5).surfaceDetail).toBe(1);
    expect(starAppearance(LifecycleStage.RedGiant, 1, 0.5).surfaceDetail).toBe(1);
    expect(starAppearance(LifecycleStage.MainSequence, 1, 0.5).blackHole).toBe(false);
  });
});

describe('the death sequence is staged, not a fade', () => {
  const SN_MASS = 14;

  /** Sample the supernova death appearance across the whole stage. */
  function sample(mass: number, supernova: boolean, steps = 200): StarAppearance[] {
    return Array.from({ length: steps + 1 }, (_, i) => deathAppearance(mass, i / steps, supernova));
  }

  it('implodes before it explodes: the star shrinks and dims first', () => {
    const start = deathAppearance(SN_MASS, 0, true);
    const justBefore = deathAppearance(SN_MASS, DEATH_PHASES.shockBreakout * 0.98, true);
    // The core collapse pulls the photosphere inward and the star fades.
    expect(justBefore.radius).toBeLessThan(start.radius * 0.3);
    expect(justBefore.glow).toBeLessThan(start.glow);
    // Nothing has been expelled yet.
    expect(start.shockwave).toBe(0);
    expect(justBefore.shockwave).toBe(0);
  });

  it('flashes at shock breakout — the brightest moment of the star’s life', () => {
    const collapsing = deathAppearance(SN_MASS, DEATH_PHASES.shockBreakout * 0.98, true);
    const breakout = deathAppearance(SN_MASS, DEATH_PHASES.shockBreakout + 0.001, true);
    const mainSequence = starAppearance(LifecycleStage.MainSequence, SN_MASS, 0.5);

    expect(breakout.glow).toBeGreaterThan(collapsing.glow * 8);
    expect(breakout.glow).toBeGreaterThan(mainSequence.glow * 8);
    // A ~10^5 K ultraviolet flash reads blue-white.
    expect(breakout.temperatureK).toBeGreaterThan(30000);
    expect(breakout.color.b).toBeGreaterThan(breakout.color.r);
    // …and the shell is born at the same instant the kernel throws its ejecta.
    expect(breakout.shockwave).toBeGreaterThan(0);
  });

  it('expands a fireball that then cools and recedes to the remnant', () => {
    const samples = sample(SN_MASS, true);
    const radii = samples.map((a) => a.radius);
    const peakRadius = Math.max(...radii);
    const collapsed = deathAppearance(SN_MASS, DEATH_PHASES.shockBreakout * 0.98, true).radius;

    // With true-scale msRadius the fireball (FIREBALL_SWELL × msRadius) is a
    // few AU for a massive progenitor — it significantly exceeds the collapsed
    // core and is bounded so it does not swallow the camera (opaque sphere).
    expect(peakRadius).toBeGreaterThan(collapsed * 4);
    expect(peakRadius).toBeLessThan(20);
    // It must also outgrow the RED GIANT it came from, or the explosion would
    // read as smaller than the star that produced it. With true scale the
    // margin is thinner than before (FIREBALL_SWELL 350 vs RED_GIANT_SWELL 250
    // ⇒ ≈1.4×), so this bound is what stops the fireball regressing below the
    // progenitor — the visible sweep is carried by the blast shell below.
    const redGiant = starAppearance(LifecycleStage.RedGiant, SN_MASS, 1).radius;
    expect(peakRadius).toBeGreaterThan(redGiant);
    // The blast SHELL, which is transparent, sweeps far beyond the fireball.
    const peakShell = Math.max(...samples.map((a) => a.shockwaveRadius));
    expect(peakShell).toBeGreaterThan(peakRadius * 8);
    // …and the photosphere has receded again by the end, handing over to the
    // compact remnant without a discontinuous jump.
    expect(radii.at(-1)!).toBeLessThan(peakRadius * 0.02);

    // Monotonic cooling after the flash.
    const afterFlash = samples.filter((_, i) => i / 200 > DEATH_PHASES.shockBreakout);
    for (let i = 1; i < afterFlash.length; i += 1) {
      expect(afterFlash[i]!.temperatureK).toBeLessThanOrEqual(afterFlash[i - 1]!.temperatureK + 1);
    }
    expect(afterFlash.at(-1)!.temperatureK).toBeLessThan(6000);
  });

  it('expands the blast shell throughout and hands over cleanly at the end', () => {
    const samples = sample(SN_MASS, true);
    const shells = samples.filter((a) => a.shockwave > 0);
    expect(shells.length).toBeGreaterThan(100);
    for (let i = 1; i < shells.length; i += 1) {
      expect(shells[i]!.shockwaveRadius).toBeGreaterThan(shells[i - 1]!.shockwaveRadius);
    }
    // Fades to nothing as the stage ends: from there the ejecta PARTICLES are the
    // visible shell, so there is no pop when the remnant appears.
    expect(samples.at(-1)!.shockwave).toBeCloseTo(0, 5);
  });

  it('gives a low-mass star a gentle planetary nebula instead of a blast', () => {
    const nebula = sample(1, false);
    const supernova = sample(SN_MASS, true);

    // No violent flash: the peak glow is a fraction of a supernova's.
    const nebulaPeak = Math.max(...nebula.map((a) => a.glow));
    const snPeak = Math.max(...supernova.map((a) => a.glow));
    expect(nebulaPeak).toBeLessThan(snPeak * 0.3);

    // The envelope drifts off cool and red, and the EXPOSED CORE is then revealed
    // as one of the hottest objects in the universe.
    expect(nebula[0]!.temperatureK).toBeLessThan(4000);
    expect(nebula[0]!.color.r).toBeGreaterThan(nebula[0]!.color.b);
    const final = nebula.at(-1)!;
    expect(final.temperatureK).toBeGreaterThan(30000);
    expect(final.color.b).toBeGreaterThan(final.color.r);
    // …and it has shrunk to exactly white-dwarf size, ready for the remnant.
    expect(final.radius).toBeCloseTo(WHITE_DWARF_RADIUS, 6);
  });

  it('is reachable through starAppearance with the fate flag', () => {
    const staged = starAppearance(LifecycleStage.Death, SN_MASS, 0.2, null, null, true);
    const quiet = starAppearance(LifecycleStage.Death, SN_MASS, 0.2, null, null, false);
    expect(staged.glow).toBeGreaterThan(quiet.glow * 3);
    expect(staged).toEqual(deathAppearance(SN_MASS, 0.2, true));
  });
});
