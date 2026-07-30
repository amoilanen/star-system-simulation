import { describe, it, expect } from 'vitest';
import { FATE_THRESHOLDS, LifecycleStage, RemnantType } from '../../src/config/fateModel';
import { DEATH_PHASES } from '../../src/sim/stages';
import { SOLAR_RADIUS_AU } from '../../src/sim/astro';
import {
  blackbodyColor,
  BROWN_DWARF_RADIUS,
  BROWN_DWARF_TEMPERATURE_K,
  companionAppearance,
  CORONA_BASE_SWELL,
  CORONA_GLOW_SWELL_CAP,
  coronaIntensity,
  coronaRadius,
  DEATH_SWEEP,
  DEFAULT_SYSTEM_SCALE,
  deathAppearance,
  engulfRadius,
  giantPhotosphereRadius,
  ignitionRadius,
  mainSequenceRadius,
  mainSequenceTemperature,
  MAX_COMPANION_GLOW,
  MAX_CORONA_INTENSITY,
  nebulaShell,
  NEBULA_HANDOVER_BRIGHTNESS,
  protostarRadius,
  REDGIANT_ENGULF_AU,
  REMNANT_SWEEP,
  remnantAppearance,
  SHELL_STALL_REACH,
  shellRadius,
  starAppearance,
  trueStellarRadius,
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
    // The blast SHELL, which is transparent, sweeps beyond the opaque fireball —
    // but it is now sized to be STILL FRAMED when the remnant appears rather than
    // to leave the system inside the death stage (spec §4.4).
    const peakShell = Math.max(...samples.map((a) => a.shockwaveRadius));
    expect(peakShell).toBeGreaterThan(peakRadius * 2.5);
    expect(peakShell).toBeLessThan(DEFAULT_SYSTEM_SCALE * 1.2);
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
    // It is still LIT when the stage ends — the remnant stage picks the very same
    // shell up and goes on drawing it as a fading nebula. It used to fade to
    // exactly zero here, which is why the remnant had no nebula around it.
    expect(samples.at(-1)!.shockwave).toBeCloseTo(NEBULA_HANDOVER_BRIGHTNESS, 6);
    expect(samples.at(-1)!.shockwaveRadius).toBeGreaterThan(0);
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

describe('the remnant sits inside a fading nebula, not an empty sky', () => {
  const SCALE = 60;

  it('picks the shell up exactly where the death stage left it', () => {
    // Reported bug 7: "when a planetary nebula is formed there is no nebula, only
    // the small star remnant". The death's shell used to fade to zero while
    // `remnantAppearance` drew none at all, so the nebula ceased to exist at the
    // stage boundary. Both channels must now hand over without a seam.
    for (const [supernova, remnant] of [
      [true, RemnantType.NeutronStar],
      [false, RemnantType.WhiteDwarf],
    ] as const) {
      const end = deathAppearance(14, 1, supernova, null, SCALE);
      const start = remnantAppearance(remnant, 0, SCALE, supernova);
      expect(start.shockwave).toBeCloseTo(end.shockwave, 6);
      expect(start.shockwaveRadius).toBeCloseTo(end.shockwaveRadius, 6);
      expect(start.shockwaveColor.r).toBeCloseTo(end.shockwaveColor.r, 6);
      expect(start.shockwaveColor.g).toBeCloseTo(end.shockwaveColor.g, 6);
      expect(start.shockwaveColor.b).toBeCloseTo(end.shockwaveColor.b, 6);
    }
  });

  it('keeps expanding and fading for the whole remnant stage', () => {
    const samples = Array.from({ length: 51 }, (_, i) =>
      remnantAppearance(RemnantType.WhiteDwarf, i / 50, SCALE, false),
    );
    for (let i = 1; i < samples.length; i += 1) {
      // Ever larger, ever dimmer — the shell decelerates but never turns back.
      expect(samples[i]!.shockwaveRadius).toBeGreaterThan(samples[i - 1]!.shockwaveRadius);
      expect(samples[i]!.shockwave).toBeLessThan(samples[i - 1]!.shockwave);
    }
    // It is genuinely visible for most of the stage rather than a token frame…
    expect(samples.filter((a) => a.shockwave > 0.05).length).toBeGreaterThan(25);
    // …and it does finally disperse, as a real nebula does.
    expect(samples.at(-1)!.shockwave).toBeCloseTo(0, 6);
  });

  it('is ionised blue-white by the hot core and cools as it thins', () => {
    const young = remnantAppearance(RemnantType.WhiteDwarf, 0.02, SCALE, false);
    const old = remnantAppearance(RemnantType.WhiteDwarf, 0.95, SCALE, false);
    expect(young.shockwaveColor.b).toBeGreaterThan(young.shockwaveColor.r);
    expect(old.shockwaveColor.r).toBeGreaterThan(old.shockwaveColor.b);
  });

  it('stays framed: the shell never runs away from the system', () => {
    for (const supernova of [true, false]) {
      const stall = supernova ? SHELL_STALL_REACH.supernova : SHELL_STALL_REACH.nebula;
      const atRemnant = shellRadius(supernova, DEATH_SWEEP, SCALE);
      // Still inside the framed system when the remnant appears (spec §4.4)…
      expect(atRemnant).toBeGreaterThan(0.3 * SCALE);
      expect(atRemnant).toBeLessThan(1.2 * SCALE);
      // …and bounded forever after, because the shell stalls rather than coasts.
      expect(shellRadius(supernova, DEATH_SWEEP + REMNANT_SWEEP, SCALE)).toBeLessThan(
        stall * SCALE,
      );
    }
  });

  it('gives a brown dwarf no nebula at all — it never died', () => {
    const bd = remnantAppearance(RemnantType.BrownDwarf, 0.3, SCALE, false);
    expect(bd.shockwave).toBe(0);
    expect(bd.shockwaveRadius).toBe(0);
  });

  it('is reachable through starAppearance on the remnant stage', () => {
    const drawn = starAppearance(
      LifecycleStage.Remnant,
      14,
      0.4,
      RemnantType.NeutronStar,
      null,
      true,
      SCALE,
    );
    const shell = nebulaShell(0.4, true, SCALE);
    expect(drawn.shockwave).toBeCloseTo(shell.shockwave, 6);
    expect(drawn.shockwaveRadius).toBeCloseTo(shell.shockwaveRadius, 6);
    // The compact object itself is untouched by the shell around it.
    expect(drawn.magnetosphere).toBe(true);
    expect(drawn.blackHole).toBe(false);
  });
});

describe('bug 3/6 — the drawn star never swallows a surviving planet', () => {
  /** Masses spanning everything the kernel can hand the renderer. */
  const MASSES = [0.001, 0.01, 0.05, 0.08, 0.3, 1, 2, 3, 5, 14, 20, 50, 120, 250];
  /** Every stage, and both death channels / every remnant, at several progresses. */
  const PROGRESSES = [0, 0.12, 0.25, 0.5, 0.75, 0.9, 1];
  const STAGES = [
    LifecycleStage.DustCloud,
    LifecycleStage.ProtostarCoalescence,
    LifecycleStage.FusionIgnition,
    LifecycleStage.MainSequence,
    LifecycleStage.RedGiant,
    LifecycleStage.Death,
    LifecycleStage.Remnant,
  ];
  const REMNANTS = [
    null,
    RemnantType.BrownDwarf,
    RemnantType.WhiteDwarf,
    RemnantType.NeutronStar,
    RemnantType.Pulsar,
    RemnantType.BlackHole,
  ];

  it('mirrors the kernel engulf radius (REDGIANT_ENGULF_AU · M^0.8, floored at 0.1 M☉)', () => {
    expect(REDGIANT_ENGULF_AU).toBe(2.2);
    expect(engulfRadius(1)).toBeCloseTo(2.2, 10);
    expect(engulfRadius(20)).toBeCloseTo(2.2 * Math.pow(20, 0.8), 10);
    // The kernel floors the mass at 0.1 M☉, so anything lighter shares that radius.
    expect(engulfRadius(0.001)).toBeCloseTo(engulfRadius(0.1), 10);
    // Monotone in mass — a bigger star clears a bigger hole.
    for (let i = 1; i < MASSES.length; i += 1) {
      expect(engulfRadius(MASSES[i]!)).toBeGreaterThanOrEqual(engulfRadius(MASSES[i - 1]!));
    }
  });

  it('keeps the drawn radius inside the engulf radius at every stage, mass and progress', () => {
    for (const mass of MASSES) {
      const bound = engulfRadius(mass);
      for (const stage of STAGES) {
        for (const p of PROGRESSES) {
          for (const remnant of REMNANTS) {
            for (const supernova of [false, true]) {
              const drawn = starAppearance(stage, mass, p, remnant, null, supernova);
              expect(
                drawn.radius,
                `stage ${stage} mass ${mass} p ${p} remnant ${remnant} sn ${supernova}`,
              ).toBeLessThanOrEqual(bound);
              expect(Number.isFinite(drawn.radius)).toBe(true);
            }
          }
        }
      }
    }
  });

  it('leaves headroom rather than only just fitting (the giant is ~53 % of the hole)', () => {
    for (const mass of [0.3, 1, 5, 20, 120]) {
      expect(giantPhotosphereRadius(mass) / engulfRadius(mass)).toBeCloseTo(0.5285, 3);
    }
  });

  it('draws the protostar at its physical Hayashi radius, not 215× a clamped one', () => {
    // 4 R☉ · M^0.5 — a few hundredths of an AU, NOT the ~1 AU (1 M☉) / 10.75 AU
    // (20 M☉) the flat ×215 on a clamped main-sequence radius used to produce.
    expect(protostarRadius(1)).toBeCloseTo(4 * SOLAR_RADIUS_AU, 6);
    const solar = starAppearance(LifecycleStage.ProtostarCoalescence, 1, 0);
    expect(solar.radius).toBeCloseTo(4 * SOLAR_RADIUS_AU, 6);
    // The innermost planetesimal the kernel seeds sits near 1 AU: it must be
    // OUTSIDE the drawn protostar at every mass the kernel can produce.
    for (const mass of [1, 3, 14, 20, 50]) {
      expect(starAppearance(LifecycleStage.ProtostarCoalescence, mass, 0).radius).toBeLessThan(0.9);
    }
  });

  it('contracts monotonically from the protostar through ignition to the main sequence', () => {
    for (const mass of [0.08, 1, 3, 20, 50, 250]) {
      const samples = [
        ...PROGRESSES.map(
          (p) => starAppearance(LifecycleStage.ProtostarCoalescence, mass, p).radius,
        ),
        ...PROGRESSES.map((p) => starAppearance(LifecycleStage.FusionIgnition, mass, p).radius),
        starAppearance(LifecycleStage.MainSequence, mass, 0).radius,
      ];
      for (let i = 1; i < samples.length; i += 1) {
        expect(samples[i]!, `mass ${mass} sample ${i}`).toBeLessThanOrEqual(
          samples[i - 1]! + 1e-12,
        );
      }
      // The stage handovers are continuous: no visible jump in the star's size.
      expect(starAppearance(LifecycleStage.ProtostarCoalescence, mass, 1).radius).toBeCloseTo(
        ignitionRadius(mass),
        10,
      );
      expect(starAppearance(LifecycleStage.FusionIgnition, mass, 1).radius).toBeCloseTo(
        mainSequenceRadius(mass),
        10,
      );
      // …and it always starts out bigger than the star it becomes.
      expect(protostarRadius(mass)).toBeGreaterThan(ignitionRadius(mass));
    }
  });

  it('derives every swollen stage from the TRUE radius, so the 0.05 AU clamp cannot inflate it', () => {
    // A 20 M☉ star is above the drawn main-sequence clamp, which is exactly where
    // the old code went wrong: 0.05 (clamped) × 250 instead of 0.0511 × 250.
    expect(mainSequenceRadius(20)).toBe(0.05);
    expect(trueStellarRadius(20)).toBeGreaterThan(mainSequenceRadius(20));
    expect(giantPhotosphereRadius(20)).toBeCloseTo(trueStellarRadius(20) * 250, 10);
    // Massive stars stay in proportion: giant/engulf is mass-independent.
    expect(giantPhotosphereRadius(20) / engulfRadius(20)).toBeCloseTo(
      giantPhotosphereRadius(1) / engulfRadius(1),
      6,
    );
  });

  it('keeps the supernova fireball inside the cleared volume at every progenitor mass', () => {
    for (const mass of [1, 3, 8, 14, 20, 50]) {
      let peak = 0;
      for (let i = 0; i <= 200; i += 1) {
        peak = Math.max(peak, deathAppearance(mass, i / 200, true).radius);
      }
      // Big — many times the red giant's own main-sequence size — but bounded.
      expect(peak).toBeGreaterThan(trueStellarRadius(mass) * 100);
      expect(peak).toBeLessThan(engulfRadius(mass));
      expect(peak / engulfRadius(mass)).toBeLessThan(0.8);
    }
  });
});

describe('bug 6 — the glow halo trades area for brightness, never the reverse', () => {
  it('stops growing the halo once glow passes the swell cap', () => {
    const star = 1.63; // a supernova fireball
    const atCap = coronaRadius(star, CORONA_GLOW_SWELL_CAP);
    // A supernova's glow peaks near 14; the halo is the same size as at 4.
    expect(coronaRadius(star, 14)).toBe(atCap);
    expect(coronaRadius(star, 1000)).toBe(atCap);
    // Below the cap it still responds, so an ordinary star's halo tracks its glow.
    expect(coronaRadius(star, 1)).toBeLessThan(atCap);
    expect(coronaRadius(star, 0)).toBeCloseTo(star * CORONA_BASE_SWELL, 10);
    // Proportional to the star and never negative.
    expect(coronaRadius(2 * star, 1)).toBeCloseTo(2 * coronaRadius(star, 1), 10);
    expect(coronaRadius(-1, 1)).toBe(0);
    expect(coronaRadius(star, -5)).toBeCloseTo(star * CORONA_BASE_SWELL, 10);
  });

  it('spends the glow it cannot turn into area on brightness instead', () => {
    // An ordinary main-sequence star is exactly as bright as it always was.
    expect(coronaIntensity(1)).toBeCloseTo(0.6, 10);
    expect(coronaIntensity(0.4)).toBeCloseTo(0.45, 10);
    // Past the swell cap the halo brightens rather than spreading.
    expect(coronaIntensity(14)).toBeGreaterThan(coronaIntensity(4));
    // And being held back by the viewport cap brightens it too.
    expect(coronaIntensity(1, 1.5)).toBeGreaterThan(coronaIntensity(1, 1));
  });

  it('bounds the brightness so the additive quad can never own the frame', () => {
    for (const glow of [0, 1, 2.6, 4, 14, 1e6]) {
      for (const overflow of [0.1, 1, 2, 1e6]) {
        const intensity = coronaIntensity(glow, overflow);
        expect(intensity).toBeGreaterThanOrEqual(0);
        expect(intensity).toBeLessThanOrEqual(MAX_CORONA_INTENSITY);
      }
    }
    // A size-overflow below 1 (the halo fitted) never DIMS the star.
    expect(coronaIntensity(1, 0.2)).toBe(coronaIntensity(1, 1));
  });
});

describe('companionAppearance — a second star is drawn as a star', () => {
  it('gives a hydrogen-fusing companion its own blackbody temperature and size', () => {
    for (const mass of [FATE_THRESHOLDS.hydrogenBurningMinMass, 0.5, 1, 2, 3, 20]) {
      const look = companionAppearance(mass);
      expect(look.star, `${mass} M☉`).toBe(true);
      expect(look.temperatureK).toBeCloseTo(mainSequenceTemperature(mass), 6);
      expect(look.radius).toBeCloseTo(mainSequenceRadius(mass), 12);
      expect(look.color).toEqual(blackbodyColor(mainSequenceTemperature(mass)));
    }
  });

  it('draws a substellar companion as a cool Jupiter-sized brown dwarf', () => {
    for (const mass of [0.013, 0.03, 0.079]) {
      const look = companionAppearance(mass);
      expect(look.star, `${mass} M☉`).toBe(false);
      expect(look.temperatureK).toBe(BROWN_DWARF_TEMPERATURE_K);
      expect(look.radius).toBeCloseTo(BROWN_DWARF_RADIUS, 12);
      // Dull: it must not compete with a real star's halo.
      expect(look.glow).toBeLessThan(companionAppearance(0.08).glow);
    }
  });

  it('does not jump in size at the instant it ignites', () => {
    // Review P2-B: the drawn radius of a companion crossing the hydrogen-burning
    // limit used to double in ONE frame, because the main-sequence clamp floor
    // (0.001 AU) sat at twice the brown-dwarf radius (5e-4 AU). Degeneracy makes
    // the two genuinely almost the same size, so the handover must be a small
    // step, and it must go UP — a star is never drawn smaller than the brown
    // dwarf it just stopped being.
    const limit = FATE_THRESHOLDS.hydrogenBurningMinMass;
    const below = companionAppearance(limit * (1 - 1e-9));
    const above = companionAppearance(limit);
    expect(below.star).toBe(false);
    expect(above.star).toBe(true);
    expect(above.radius).toBeGreaterThanOrEqual(below.radius);
    expect(above.radius / below.radius).toBeLessThan(1.5);
    // The floor IS the brown-dwarf radius, so the drawn size never decreases
    // with mass anywhere along the substellar → stellar sequence.
    const sequence = [0.001, 0.013, 0.05, 0.079, limit, 0.1, 0.3, 1, 20];
    for (let i = 1; i < sequence.length; i += 1) {
      const lighter = companionAppearance(sequence[i - 1]!);
      const heavier = companionAppearance(sequence[i]!);
      expect(heavier.radius, `${sequence[i]!} M☉`).toBeGreaterThanOrEqual(lighter.radius);
    }
  });

  it('orders companions by mass — hotter, bluer and brighter upward', () => {
    const masses = [0.08, 0.3, 1, 2, 5, 20];
    for (let i = 1; i < masses.length; i += 1) {
      const lighter = companionAppearance(masses[i - 1]!);
      const heavier = companionAppearance(masses[i]!);
      expect(heavier.temperatureK).toBeGreaterThan(lighter.temperatureK);
      expect(heavier.glow).toBeGreaterThanOrEqual(lighter.glow);
    }
    // A red dwarf reads red, a massive companion blue — the cue that says which
    // is which without opening a label.
    expect(companionAppearance(0.1).color.r).toBeGreaterThan(companionAppearance(0.1).color.b);
    expect(companionAppearance(20).color.b).toBeGreaterThan(companionAppearance(20).color.r);
  });

  it('bounds the glow so a companion halo can never own the frame', () => {
    // Same invariant `StarRenderer` enforces for the primary (reported bug 6):
    // the additive halo is bounded from BOTH sides at every possible mass.
    for (const mass of [0, 1e-6, 0.013, 0.08, 1, 20, 150, Number.NaN, Number.POSITIVE_INFINITY]) {
      const look = companionAppearance(mass);
      expect(look.glow, `${mass} M☉`).toBeGreaterThan(0);
      expect(look.glow, `${mass} M☉`).toBeLessThanOrEqual(MAX_COMPANION_GLOW);
      expect(Number.isFinite(look.radius)).toBe(true);
      expect(look.radius).toBeGreaterThan(0);
      expect(look.surfaceLum).toBeGreaterThan(0);
      expect(look.surfaceLum).toBeLessThan(1);
      for (const channel of [look.color.r, look.color.g, look.color.b]) {
        expect(Number.isFinite(channel)).toBe(true);
      }
    }
  });

  it('never draws a companion large enough to enclose a planet it has not eaten', () => {
    // The same hard bound the primary's every stage obeys: the drawn photosphere
    // may not reach past the radius the kernel clears (reported bug 3).
    for (const mass of [0.013, 0.08, 1, 3, 20, 150]) {
      expect(companionAppearance(mass).radius, `${mass} M☉`).toBeLessThanOrEqual(
        engulfRadius(mass),
      );
    }
  });
});
