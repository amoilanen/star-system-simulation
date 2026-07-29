// Pure star-appearance model (spec §3.2, D6). No Three.js dependency so the
// blackbody color ramp and stage→appearance mapping are cheap to unit-test.
//
// The star itself is NOT part of the kernel body buffer — it is the core at the
// scene origin — so its visual parameters (effective temperature, radius, glow
// intensity) are derived here from the lifecycle stage, cloud mass and the
// selected remnant. StarRenderer feeds these into its GLSL uniforms.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import { DEATH_PHASES } from '../sim/stages';
import type { CloudComposition } from '../config/SimulationConfig';
import { SOLAR_RADIUS_AU, stellarRadiusSolar } from '../sim/astro';

/** Linear RGB triple in [0, 1]. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Clamp a value into the inclusive `[min, max]` range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * How far the rendered star colours are pushed AWAY from white, relative to the
 * true blackbody chromaticity (1 = physically exact).
 *
 * A real O-star radiates (0.79, 0.86, 1.00) — technically blue, but so close to
 * white that after ACES tone-mapping and the bloom pass it reads as a plain
 * white ball, which is why "I have never once seen a blueish star". Human
 * observers have the same problem through a telescope; the vivid blues and reds
 * of astrophotography come from exactly this kind of saturation stretch. The
 * hue is never invented — only its distance from grey is amplified.
 */
export const SPECTRAL_SATURATION = 1.9;

/** Rec. 709 relative luminance of a linear RGB triple. */
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Blackbody-approximation color ramp (Tanner Helland approximation), mapping an
 * effective temperature in Kelvin to a normalized linear RGB triple, with the
 * chroma stretched by {@link SPECTRAL_SATURATION} and the result normalized so
 * its brightest channel is 1 — the star's BRIGHTNESS is carried separately by
 * `surfaceLum`/`glow`, so this function only has to carry the hue.
 *
 * Cool stars are deep orange-red, ~6600 K is white, and hot stars are
 * unmistakably blue. Pure; exported for unit testing at the key temperatures
 * used across the lifecycle.
 */
export function blackbodyColor(temperatureK: number): Rgb {
  // The approximation is defined for ~1000–40000 K; clamp into that domain.
  const t = clamp(temperatureK, 1000, 40000) / 100;

  let r: number;
  let g: number;
  let b: number;

  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  }

  if (t >= 66) {
    b = 255;
  } else if (t <= 19) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  }

  const lr = clamp(r, 0, 255) / 255;
  const lg = clamp(g, 0, 255) / 255;
  const lb = clamp(b, 0, 255) / 255;

  // Stretch each channel away from the triple's own luminance (a pure chroma
  // boost: a neutral colour stays neutral, so ~6600 K remains white).
  const y = luminance(lr, lg, lb);
  const sr = Math.max(0, y + (lr - y) * SPECTRAL_SATURATION);
  const sg = Math.max(0, y + (lg - y) * SPECTRAL_SATURATION);
  const sb = Math.max(0, y + (lb - y) * SPECTRAL_SATURATION);

  // Re-normalize to the brightest channel so the hue survives at any exposure.
  const peak = Math.max(sr, sg, sb, Number.EPSILON);
  return {
    r: clamp(sr / peak, 0, 1),
    g: clamp(sg / peak, 0, 1),
    b: clamp(sb / peak, 0, 1),
  };
}

/** Visual parameters the star shader consumes for the current frame. */
export interface StarAppearance {
  /** Whether the star/remnant is visible at all (hidden during DustCloud). */
  visible: boolean;
  /** Effective surface temperature in Kelvin, fed to {@link blackbodyColor}. */
  temperatureK: number;
  /** Blackbody color at {@link StarAppearance.temperatureK}. */
  color: Rgb;
  /** Sphere radius in scene units (protostar → main-sequence → red-giant swell). */
  radius: number;
  /** Corona/glow intensity multiplier (bloom driver). */
  glow: number;
  /**
   * Surface-brightness multiplier for the star DISK (not the halo). Cool stars
   * (protostar, red giant) use a value < 1 so their disk keeps its blackbody hue
   * instead of the ACES tone-map + bloom washing every bright disk to white; hot
   * stars sit near 1 and read white-hot, as they should.
   */
  surfaceLum: number;
  /** Whether a rotating pulsar beam should be rendered (pulsar remnant only). */
  pulsarBeam: boolean;
  /**
   * How much animated surface granulation the star shader applies, 0..1.
   *
   * Real stars have a boiling, mottled photosphere; a neutron star's surface is
   * a smooth, degenerate, magnetically-locked crust. Rendering the same noisy
   * convection on a body drawn a few pixels across is what made the neutron star
   * look like a speckled blob rather than a searing point of light.
   */
  surfaceDetail: number;
  /**
   * Render the neutron star's magnetosphere: a tilted, rapidly rotating ring of
   * synchrotron-bright plasma. This (not the surface) is what actually makes a
   * neutron star spectacular — see the Crab pulsar's wind nebula.
   */
  magnetosphere: boolean;
  /**
   * Render as a BLACK HOLE: a genuinely black event horizon framed by a photon
   * ring and a hot accretion disc. It has no photosphere, so `color`/`glow`
   * describe the disc rather than a surface.
   */
  blackHole: boolean;
  /**
   * Brightness of the expanding BLAST SHELL, 0..1 (0 = not drawn). The shell is
   * the shock front ploughing into the surrounding gas: optically thin, so it is
   * drawn limb-brightened, exactly as a real supernova remnant appears.
   */
  shockwave: number;
  /** Radius of that shell in scene units (grows for the whole death sequence). */
  shockwaveRadius: number;
  /** Colour of the shell, hottest at breakout and cooling as it expands. */
  shockwaveColor: Rgb;
}

/** Appearance fields shared by every "nothing to see here" state. */
const HIDDEN_STAR: StarAppearance = {
  visible: false,
  temperatureK: 0,
  color: { r: 0, g: 0, b: 0 },
  radius: 0,
  glow: 0,
  surfaceLum: 0,
  pulsarBeam: false,
  surfaceDetail: 0,
  magnetosphere: false,
  blackHole: false,
  shockwave: 0,
  shockwaveRadius: 0,
  shockwaveColor: { r: 0, g: 0, b: 0 },
};

/** Fields every ordinary (non-remnant, non-exploding) star shares. */
const NO_BLAST = {
  magnetosphere: false,
  blackHole: false,
  shockwave: 0,
  shockwaveRadius: 0,
  shockwaveColor: { r: 0, g: 0, b: 0 },
} as const;

/**
 * Main-sequence effective temperature from mass (M☉), following the real
 * qualitative ordering: more massive stars are hotter/bluer. Illustrative, not a
 * stellar-structure solution (PRD A1). Sun (1 M☉) maps near 5800 K.
 *
 * The exponent is 0.6, not 0.5: the observed main sequence runs ~3800 K at
 * 0.5 M☉, 5772 K at 1, ~9600 K at 2, ~17 000 K at 5 and ~35 000 K at 20 M☉,
 * which a square root under-predicts badly at the top end — one reason the hot,
 * blue stars never looked hot or blue.
 */
export function mainSequenceTemperature(mass: number): number {
  const m = Math.max(mass, 1e-3);
  return clamp(5800 * Math.pow(m, 0.6), 2400, 45000);
}

/**
 * Base scene radius (scene units = AU) of a main-sequence star from its mass,
 * at TRUE physical scale: `SOLAR_RADIUS_AU · M^0.8` (reusing
 * `stellarRadiusSolar` from astro.ts).
 *
 * The Sun's radius is 0.00465 AU — a ratio of ~215:1 against a 1 AU orbit.
 * At system-framing distances the star is sub-pixel, which is why
 * `StarRenderer` floors its drawn size to a minimum number of pixels (the same
 * trick Celestia / NASA's Eyes use). That floor keeps it readable WITHOUT
 * inflating the physical radius, so zoomed-in proportions are correct.
 *
 * Clamped 0.001–0.05 AU: below the lower end the float math loses precision;
 * above the upper end the star fills the inner system regardless of the pixel
 * floor (an extreme-mass "star" would exceed the clamp anyway).
 */
export function mainSequenceRadius(mass: number): number {
  const m = Math.max(mass, 1e-3);
  return clamp(SOLAR_RADIUS_AU * stellarRadiusSolar(m), 0.001, 0.05);
}

/**
 * How many times its main-sequence radius the star swells as a red giant.
 * The Sun expands to ~250 R☉ ≈ 1.16 AU at its tip-of-the-red-giant-branch peak
 * — a true factor of ~250. At 1 M☉: `0.00465 · 250 ≈ 1.16 AU`, well inside
 * `REDGIANT_ENGULF_AU = 2.2 AU` (the kernel's destruction radius), so no
 * planet can survive inside the photosphere that the kernel has not already
 * consumed. More massive giants swell proportionally larger.
 */
export const RED_GIANT_SWELL = 250;

/**
 * True physical radius of a white dwarf, in scene units (AU). White dwarfs are
 * Earth-sized: R_WD ≈ 6 400 km ≈ 4.3e-5 AU. At system scale this is
 * sub-pixel, so `StarRenderer` applies its pixel-floor; zoomed in the white
 * dwarf reads as a small, bright point rather than a ball — correct.
 */
export const WHITE_DWARF_RADIUS = 4.3e-5;

/**
 * Illustrative floor radius used for neutron stars and pulsars, in scene
 * units. True scale is ~10 km ≈ 7e-8 AU — physically invisible; even the
 * pixel floor would render an unresolvable speck. This value sits at the
 * pixel-floor threshold so the magnetosphere ring and pulsar beams remain
 * legible without inflating the "surface". Documented exception.
 */
export const NEUTRON_STAR_RADIUS = 1e-5;

/**
 * Illustrative floor radius for a black hole's EVENT HORIZON, in scene units.
 * A stellar-mass hole is 30–60 km (2–4e-7 AU) — also physically invisible.
 * Kept at the same pixel-floor level as `NEUTRON_STAR_RADIUS` so the photon
 * ring and accretion disc geometry scales correctly from it. Documented
 * exception.
 */
export const BLACK_HOLE_RADIUS = 1e-5;

/**
 * True physical radius of a brown dwarf, in scene units (AU). Electron
 * degeneracy keeps every brown dwarf at roughly one Jupiter radius regardless
 * of mass: R_BD ≈ 70 000 km ≈ 5e-4 AU. Drawn at true scale: noticeably
 * larger than a white dwarf (4.3e-5 AU), yet clearly smaller than even the
 * faintest true star (≥ 0.001 AU after clamping).
 */
export const BROWN_DWARF_RADIUS = 5e-4;

/**
 * Effective temperature of a brown dwarf, in Kelvin. L/T dwarfs sit at roughly
 * 1000-2000 K — below the ~2400 K floor of the coolest real star, which is why
 * they glow a dull red rather than shining.
 */
export const BROWN_DWARF_TEMPERATURE_K = 1800;

/**
 * Composition-driven temperature multiplier (illustrative). Metal-rich gas is
 * more opaque, giving a slightly cooler/redder photosphere; a metal-poor
 * (hydrogen-dominated) cloud runs a touch hotter/bluer. Centred on the Solar
 * metallicity (~0.02) and gently bounded. Pure.
 */
export function compositionTempFactor(composition: CloudComposition | null): number {
  if (composition === null) {
    return 1;
  }
  const metals = Math.max(0, composition.metals);
  // −0.02 (metal-poor) … +0.13 (very metal-rich) around the solar reference.
  return clamp(1 - (metals - 0.02) * 1.2, 0.85, 1.12);
}

/**
 * Main-sequence effective temperature as it drifts over the star's life. A star
 * arrives on the main sequence hotter and bluer, then cools and yellows as it
 * ages (`progress` 0→1). Combined with the mass ordering (massive ⇒ blue) and
 * composition, this gives the "young bluish → older yellowish" progression
 * (illustrative, exaggerated for legibility). Pure.
 */
export function mainSequenceTemperatureAt(
  mass: number,
  progress: number,
  composition: CloudComposition | null = null,
): number {
  const p = clamp(progress, 0, 1);
  const base = mainSequenceTemperature(mass) * compositionTempFactor(composition);
  // Young (p=0) ~1.15× hotter/bluer, ageing to ~0.9× cooler/yellower.
  const ageFactor = 1.15 - 0.25 * p;
  return clamp(base * ageFactor, 2500, 40000);
}

/**
 * Derive the star's visual appearance for a lifecycle stage. `progress` is the
 * normalized fraction (0..1) through the current stage, used to animate smooth
 * transitions (protostar warming, red-giant swelling). Pure and deterministic.
 */
export function starAppearance(
  stage: LifecycleStage,
  mass: number,
  progress: number,
  remnant: RemnantType | null = null,
  composition: CloudComposition | null = null,
  supernova = false,
  systemScale = DEFAULT_SYSTEM_SCALE,
): StarAppearance {
  const p = clamp(progress, 0, 1);
  const msTemp = mainSequenceTemperature(mass) * compositionTempFactor(composition);
  const msRadius = mainSequenceRadius(mass);

  switch (stage) {
    case LifecycleStage.DustCloud:
      return HIDDEN_STAR;

    case LifecycleStage.ProtostarCoalescence: {
      // A cool, dim, contracting protostar warming from ~1200 K toward ~2800 K.
      // Protostars are genuinely ~AU scale in reality before they settle onto
      // the main sequence.  With true-scale msRadius (~0.00465 AU for 1 M☉)
      // the old ×6 factor gave only 0.03 AU — a pixel.  We now use ×215 at
      // the start (~1 AU for a solar star) shrinking to ×108 at the end
      // (~0.5 AU), which hands off seamlessly to FusionIgnition's own contraction
      // (see below).  Both factors scale the true-scale radius, so massive
      // protostars (msRadius ≈ 0.038 AU at 14 M☉) are correctly larger (~8 AU).
      const temperatureK = 1200 + 1600 * p;
      const radius = msRadius * (215 - 107 * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius,
        glow: 0.4 + 0.3 * p,
        // Dim, deep-red glowing ball of gas — keep the disk well below white-out.
        surfaceLum: 0.4 + 0.15 * p,
        pulsarBeam: false,
        // Vigorously convective and blotchy while it contracts.
        surfaceDetail: 1,
        ...NO_BLAST,
      };
    }

    case LifecycleStage.FusionIgnition: {
      // Ignition flash: temperature ramps sharply to the main-sequence value
      // while the star contracts.  Radius starts at the ProtostarCoalescence
      // end value (×108 msRadius ≈ 0.5 AU for 1 M☉) and contracts to true
      // main-sequence radius by p=1 — a seamless continuation of the
      // Kelvin-Helmholtz shrinkage that ends with hydrogen ignition.
      const temperatureK = 2800 + (msTemp - 2800) * p;
      const radius = msRadius * (108 - 107 * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius,
        glow: 0.8 + 0.6 * p,
        surfaceLum: 0.55 + 0.35 * p,
        pulsarBeam: false,
        surfaceDetail: 1,
        ...NO_BLAST,
      };
    }

    case LifecycleStage.MainSequence: {
      // Colour drifts over the star's life: young → hotter/bluer, ageing →
      // cooler/yellower (plus the composition tint), so the main-sequence phase
      // is not a static colour.
      const temperatureK = mainSequenceTemperatureAt(mass, p, composition);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: msRadius,
        glow: 1.0,
        // Kept well below 1 so the blackbody hue survives the ACES tone-map,
        // which compresses (and desaturates) anything approaching white: a hot
        // star must read BLUE, not as another white ball (reported bug 5). The
        // brightness the eye expects comes from the corona halo and bloom.
        surfaceLum: 0.7,
        pulsarBeam: false,
        surfaceDetail: 1,
        ...NO_BLAST,
      };
    }

    case LifecycleStage.RedGiant: {
      // Cools toward ~3100 K while the envelope swells several-fold. The cooling
      // is front-loaded (sqrt curve) so the star reads visibly orange-red for
      // most of the stage rather than only at the very end.
      const cool = Math.sqrt(p);
      const temperatureK = msTemp + (3100 - msTemp) * cool;
      const radius = msRadius * (1 + (RED_GIANT_SWELL - 1) * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius,
        // Bright, luminous halo (bloom) …
        glow: 1.0 + 0.5 * p,
        // … but a deliberately dim disk so the cool orange-red hue survives the
        // tone-map instead of saturating to white at the bright core.
        surfaceLum: 0.45 - 0.2 * cool,
        pulsarBeam: false,
        surfaceDetail: 1,
        ...NO_BLAST,
      };
    }

    case LifecycleStage.Death:
      return deathAppearance(mass, p, supernova, composition, systemScale);

    case LifecycleStage.Remnant:
      return remnantAppearance(remnant);

    default:
      return HIDDEN_STAR;
  }
}

/**
 * How far the supernova fireball's photosphere expands, as a multiple of the
 * star's (true-scale) main-sequence radius. With `mainSequenceRadius` now at
 * physical scale (~0.037 AU for a 14 M☉ progenitor), this factor is set so
 * the fireball peaks at ~10 AU — visibly dwarfing the system's inner planets
 * while remaining a bounded sphere that does not swamp the camera. The
 * transparent BLAST SHELL driven by `SHOCKWAVE_REACH` sweeps far beyond it.
 */
export const FIREBALL_SWELL = 350;

/**
 * How far the BLAST SHELL reaches by the end of the death stage, as a fraction
 * of the birth cloud's radius — matched to the distance the kernel's ejecta
 * particles actually cover in that time, so the drawn shock front and the real
 * expanding debris move together. The shell keeps going afterwards; from the
 * remnant stage on, the particles alone carry it.
 */
export const SHOCKWAVE_REACH = { supernova: 3.3, nebula: 1.3 } as const;

/** Cloud radius (scene units) assumed when the caller does not supply one. */
export const DEFAULT_SYSTEM_SCALE = 50;

/** Peak effective temperature at shock breakout (K) — a UV flash. */
export const BREAKOUT_TEMPERATURE_K = 40000;

/**
 * Appearance during the DEATH stage: the star's last few moments, drawn as the
 * physical sequence rather than as a fade.
 *
 * For a CORE-COLLAPSE SUPERNOVA (`supernova`):
 *   1. `p < shockBreakout` — the iron core implodes and the envelope falls in
 *      behind it. The star visibly SHRINKS and dims; nothing has escaped yet.
 *   2. at `shockBreakout` — the rebound shock reaches the surface: a blinding
 *      ~10^5 K ultraviolet flash, and the kernel throws its ejecta shell on the
 *      very same fraction.
 *   3. up to `peakLuminosity` — the fireball expands and brightens to peak.
 *   4. afterwards — it cools through white and orange, thins, and the receding
 *      photosphere hands over to the compact remnant while the blast shell
 *      keeps racing outward.
 *
 * For a QUIET death (low-mass star ⇒ planetary nebula) the envelope is puffed
 * gently away over the first half of the stage and the second half exposes the
 * ferociously hot stellar core — the blue-white central star of the nebula.
 *
 * Pure; exported for unit testing.
 */
export function deathAppearance(
  mass: number,
  progress: number,
  supernova: boolean,
  composition: CloudComposition | null = null,
  systemScale = DEFAULT_SYSTEM_SCALE,
): StarAppearance {
  const p = clamp(progress, 0, 1);
  const msRadius = mainSequenceRadius(mass);
  const msTemp = mainSequenceTemperature(mass) * compositionTempFactor(composition);
  const giantRadius = msRadius * RED_GIANT_SWELL;
  const scale = Math.max(systemScale, 1);
  const { shockBreakout, peakLuminosity } = DEATH_PHASES;

  if (!supernova) {
    return planetaryNebulaAppearance(msRadius, giantRadius, p, scale);
  }

  if (p < shockBreakout) {
    // --- 1. CORE COLLAPSE ---------------------------------------------------
    // The core implodes in about a second and the envelope follows it inward.
    // Quadratic because the infall accelerates, and the star DIMS: this is the
    // moment of calm that makes the flash land.
    const k = p / shockBreakout;
    const temperatureK = msTemp * (1 + 0.5 * k);
    return {
      visible: true,
      temperatureK,
      color: blackbodyColor(temperatureK),
      radius: giantRadius * (1 - 0.82 * k * k),
      glow: 1.4 - 0.9 * k,
      surfaceLum: 0.5 - 0.22 * k,
      pulsarBeam: false,
      surfaceDetail: 1,
      ...NO_BLAST,
    };
  }

  // --- 2-4. BREAKOUT, FIREBALL, FADE ----------------------------------------
  const q = (p - shockBreakout) / (1 - shockBreakout); // 0 at breakout, 1 at the end
  const peakQ = (peakLuminosity - shockBreakout) / (1 - shockBreakout);

  // The photosphere is blown outward almost instantly, then keeps coasting; past
  // the peak it RECEDES back through the thinning ejecta toward the remnant, so
  // the shrinking star never has to jump discontinuously to the compact object.
  const expansion = 1 - Math.exp(-6 * q);
  const receding = q <= peakQ ? 0 : Math.pow((q - peakQ) / (1 - peakQ), 1.5);
  const fireball = msRadius * (0.18 + FIREBALL_SWELL * expansion);
  const radius = Math.max(NEUTRON_STAR_RADIUS, fireball * (1 - 0.995 * receding));

  // Cools from the breakout flash through white and into the orange of an
  // expanding, adiabatically cooling envelope.
  const temperatureK = clamp(
    BREAKOUT_TEMPERATURE_K * Math.pow(1 - 0.985 * q, 1.6) + 3400,
    3400,
    BREAKOUT_TEMPERATURE_K,
  );

  // Light curve: an instantaneous breakout spike, a broad maximum, then decay.
  const rise = q <= peakQ ? Math.pow(q / Math.max(peakQ, 1e-6), 0.35) : 1;
  const decay = q <= peakQ ? 1 : Math.pow(1 - (q - peakQ) / (1 - peakQ), 1.4);
  const spike = Math.exp(-Math.pow(q / 0.06, 2)); // the breakout flash itself
  const luminosity = rise * decay;

  const shellColorK = clamp(BREAKOUT_TEMPERATURE_K * (1 - 0.8 * q) + 5000, 5000, 40000);
  return {
    visible: true,
    temperatureK,
    color: blackbodyColor(temperatureK),
    radius,
    // A brief, blinding breakout spike on top of a strong (but not screen-
    // filling) sustained maximum: a supernova's light curve is a flash followed
    // by a long decline, not a sustained white-out.
    glow: 1 + 4.5 * luminosity + 9 * spike,
    surfaceLum: clamp(0.55 + 0.45 * luminosity, 0, 1) * (1 - 0.9 * receding),
    pulsarBeam: false,
    // The fireball is a smooth, opaque, radiation-dominated photosphere — none
    // of the convective mottling a living star has.
    surfaceDetail: 0.15,
    magnetosphere: false,
    blackHole: false,
    // The shell keeps expanding and fading for the whole sequence, reaching zero
    // exactly as the stage ends: from there the ejecta PARTICLES the kernel
    // integrates are the visible remnant shell, so the handover has no seam.
    shockwave: clamp(0.35 + 0.65 * decay, 0, 1) * (1 - Math.pow(q, 3)),
    shockwaveRadius: msRadius + scale * SHOCKWAVE_REACH.supernova * Math.pow(q, 0.85),
    shockwaveColor: blackbodyColor(shellColorK),
  };
}

/**
 * The quiet death of a low-mass star: the envelope drifts off as a planetary
 * nebula and the exposed core — one of the hottest objects in the universe at
 * ~100 000 K — lights it up from inside before cooling into a white dwarf.
 */
function planetaryNebulaAppearance(
  msRadius: number,
  giantRadius: number,
  p: number,
  scale: number,
): StarAppearance {
  const SHED_END = 0.55;
  if (p < SHED_END) {
    // Pulsating, cooling envelope slowly being pushed away by radiation pressure.
    const k = p / SHED_END;
    const temperatureK = 3300 - 400 * k;
    return {
      visible: true,
      temperatureK,
      color: blackbodyColor(temperatureK),
      radius: giantRadius * (1 + 0.35 * k),
      glow: 1.4 + 0.5 * k,
      surfaceLum: 0.4 - 0.12 * k,
      pulsarBeam: false,
      surfaceDetail: 1,
      magnetosphere: false,
      blackHole: false,
      // A slow, gentle shell rather than a blast wave.
      shockwave: 0.45 * k,
      shockwaveRadius: msRadius + scale * SHOCKWAVE_REACH.nebula * 0.45 * Math.pow(k, 0.85),
      shockwaveColor: blackbodyColor(4200),
    };
  }
  // The envelope becomes transparent and the searing core is laid bare.
  const k = (p - SHED_END) / (1 - SHED_END);
  const temperatureK = clamp(3000 + 37000 * Math.pow(k, 0.7), 3000, 40000);
  return {
    visible: true,
    temperatureK,
    color: blackbodyColor(temperatureK),
    radius: Math.max(WHITE_DWARF_RADIUS, giantRadius * 1.35 * Math.pow(1 - k, 2.4)),
    glow: 1.9 - 0.6 * k,
    surfaceLum: 0.35 + 0.6 * k,
    pulsarBeam: false,
    surfaceDetail: 1 - 0.7 * k,
    magnetosphere: false,
    blackHole: false,
    // Fades to nothing by the end of the stage, handing over to the ejecta cloud.
    shockwave: 0.45 * (1 - Math.pow(k, 2)),
    shockwaveRadius: msRadius + scale * SHOCKWAVE_REACH.nebula * (0.45 + 0.55 * Math.pow(k, 0.85)),
    shockwaveColor: blackbodyColor(4200 + 8000 * k),
  };
}

/**
 * Effective surface temperature of a young neutron star, in Kelvin. Real values
 * are ~10^6 K — far off the blackbody ramp's domain, where everything saturates
 * to the same blue — so the ramp is fed the top of its range, which is the
 * correct COLOUR for anything that hot.
 */
export const NEUTRON_STAR_TEMPERATURE_K = 40000;

/** Visual appearance of the terminal compact remnant. */
export function remnantAppearance(remnant: RemnantType | null): StarAppearance {
  switch (remnant) {
    case RemnantType.BrownDwarf: {
      // Not a corpse but a failure-to-launch: an object that never fused
      // hydrogen. It is drawn as a dim, dull-red ember — barely self-luminous,
      // with a mottled, convecting (and in reality cloudy) surface, which is
      // exactly how it differs from the brilliant point of a compact remnant.
      return {
        visible: true,
        temperatureK: BROWN_DWARF_TEMPERATURE_K,
        color: blackbodyColor(BROWN_DWARF_TEMPERATURE_K),
        radius: BROWN_DWARF_RADIUS,
        // Barely glowing: it radiates the heat of its own contraction, nothing more.
        glow: 0.45,
        surfaceLum: 0.35,
        pulsarBeam: false,
        // Brown dwarfs are fully convective, with banded weather and dust clouds.
        surfaceDetail: 0.85,
        ...NO_BLAST,
      };
    }
    case RemnantType.WhiteDwarf: {
      // A cooled white dwarf reads as a small, WHITE ball (as requested): a
      // near-neutral blackbody rather than the hot blue-white of a just-formed
      // one, so the birth→death colour arc ends unmistakably on white.
      const temperatureK = 7200;
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: WHITE_DWARF_RADIUS,
        glow: 1.2,
        surfaceLum: 0.95,
        pulsarBeam: false,
        // A degenerate surface, but still a thin radiating atmosphere.
        surfaceDetail: 0.25,
        ...NO_BLAST,
      };
    }
    case RemnantType.NeutronStar: {
      return {
        visible: true,
        temperatureK: NEUTRON_STAR_TEMPERATURE_K,
        color: blackbodyColor(NEUTRON_STAR_TEMPERATURE_K),
        radius: NEUTRON_STAR_RADIUS,
        glow: 2.4,
        surfaceLum: 1.0,
        pulsarBeam: false,
        // A smooth, degenerate crust: no convection, no granulation.
        surfaceDetail: 0,
        ...NO_BLAST,
        magnetosphere: true,
      };
    }
    case RemnantType.Pulsar: {
      return {
        visible: true,
        temperatureK: NEUTRON_STAR_TEMPERATURE_K,
        color: blackbodyColor(NEUTRON_STAR_TEMPERATURE_K),
        radius: NEUTRON_STAR_RADIUS,
        glow: 2.6,
        surfaceLum: 1.0,
        pulsarBeam: true,
        surfaceDetail: 0,
        ...NO_BLAST,
        magnetosphere: true,
      };
    }
    case RemnantType.BlackHole: {
      // No photosphere at all: `color` describes the accretion disc, whose inner
      // edge glows at ~10^7 K, and the horizon itself is drawn perfectly black.
      const temperatureK = 22000;
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: BLACK_HOLE_RADIUS,
        glow: 1.8,
        // The horizon emits nothing; every photon comes from the disc/ring.
        surfaceLum: 0,
        pulsarBeam: false,
        surfaceDetail: 0,
        ...NO_BLAST,
        blackHole: true,
      };
    }
    default:
      return HIDDEN_STAR;
  }
}
