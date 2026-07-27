// Pure star-appearance model (spec §3.2, D6). No Three.js dependency so the
// blackbody color ramp and stage→appearance mapping are cheap to unit-test.
//
// The star itself is NOT part of the kernel body buffer — it is the core at the
// scene origin — so its visual parameters (effective temperature, radius, glow
// intensity) are derived here from the lifecycle stage, cloud mass and the
// selected remnant. StarRenderer feeds these into its GLSL uniforms.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import type { CloudComposition } from '../config/SimulationConfig';

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
 * Blackbody-approximation color ramp (Tanner Helland approximation), mapping an
 * effective temperature in Kelvin to a normalized linear RGB triple. Cool stars
 * are red/orange, ~6600 K is near-white, and hot stars trend blue-white. Pure;
 * exported for unit testing at the key temperatures used across the lifecycle.
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

  return {
    r: clamp(r, 0, 255) / 255,
    g: clamp(g, 0, 255) / 255,
    b: clamp(b, 0, 255) / 255,
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
}

/**
 * Main-sequence effective temperature from mass (M☉), following the real
 * qualitative ordering: more massive stars are hotter/bluer. Illustrative, not a
 * stellar-structure solution (PRD A1). Sun (1 M☉) maps near 5800 K.
 */
export function mainSequenceTemperature(mass: number): number {
  const m = Math.max(mass, 1e-3);
  return clamp(5800 * Math.pow(m, 0.5), 2500, 40000);
}

/**
 * Base scene radius (scene units = AU) of a main-sequence star from its mass.
 *
 * The Sun's true radius is 0.00465 AU against an innermost planet at ~1 AU — a
 * ratio of over 200:1. Drawing that literally would make the star a single
 * pixel, so it is exaggerated ~10× to 0.047 AU, but no further: at that size the
 * star is still ~1/20 of the innermost orbit and the system finally reads at
 * Solar-System scale, instead of the previous 0.5 AU "arcade" ball that spanned
 * a sizeable fraction of the inner system. Visibility when zoomed out is handled
 * by a minimum APPARENT size in the renderer (see `screenScale.ts`), not by
 * inflating the physical radius.
 */
export function mainSequenceRadius(mass: number): number {
  const m = Math.max(mass, 1e-3);
  return clamp(0.047 * Math.pow(m, 0.4), 0.02, 0.4);
}

/**
 * How many times its main-sequence radius the star swells as a red giant. The
 * Sun will reach ~250 R☉ ≈ 1.2 AU and engulf its inner planets — a factor of
 * ~250. Compressed here to a still-spectacular 26× (≈1.2 AU for a solar star),
 * which keeps the visible photosphere consistent with `REDGIANT_ENGULF_AU`, the
 * radius inside which the kernel actually destroys planets.
 */
export const RED_GIANT_SWELL = 26;

/**
 * Radius of a compact remnant, in scene units. A white dwarf is Earth-sized
 * (4e-5 AU) and a neutron star is a city — both utterly invisible at true scale,
 * so they are drawn at the smallest size that still reads as a point of light.
 */
export const WHITE_DWARF_RADIUS = 0.018;
export const NEUTRON_STAR_RADIUS = 0.012;

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
): StarAppearance {
  const p = clamp(progress, 0, 1);
  const msTemp = mainSequenceTemperature(mass) * compositionTempFactor(composition);
  const msRadius = mainSequenceRadius(mass);

  switch (stage) {
    case LifecycleStage.DustCloud:
      return {
        visible: false,
        temperatureK: 0,
        color: { r: 0, g: 0, b: 0 },
        radius: 0,
        glow: 0,
        surfaceLum: 0,
        pulsarBeam: false,
      };

    case LifecycleStage.ProtostarCoalescence: {
      // A cool, dim, contracting protostar warming from ~1200 K toward ~2800 K.
      // Protostars are genuinely several times their eventual main-sequence size
      // and shrink as they contract onto it.
      const temperatureK = 1200 + 1600 * p;
      const radius = msRadius * (6 - 3 * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius,
        glow: 0.4 + 0.3 * p,
        // Dim, deep-red glowing ball of gas — keep the disk well below white-out.
        surfaceLum: 0.4 + 0.15 * p,
        pulsarBeam: false,
      };
    }

    case LifecycleStage.FusionIgnition: {
      // Ignition flash: temperature ramps sharply to the main-sequence value.
      const temperatureK = 2800 + (msTemp - 2800) * p;
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: msRadius,
        glow: 0.8 + 0.6 * p,
        surfaceLum: 0.55 + 0.35 * p,
        pulsarBeam: false,
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
        surfaceLum: 0.9,
        pulsarBeam: false,
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
      };
    }

    case LifecycleStage.Death: {
      // Peak brightness (supernova flash / envelope ejection): the swollen giant
      // collapses from its red-giant size down toward the compact remnant.
      const temperatureK = 8000;
      const radius = msRadius * RED_GIANT_SWELL * (1 - 0.94 * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: Math.max(radius, WHITE_DWARF_RADIUS),
        glow: 2.5,
        surfaceLum: 1.0,
        pulsarBeam: false,
      };
    }

    case LifecycleStage.Remnant:
      return remnantAppearance(remnant);

    default:
      return {
        visible: false,
        temperatureK: 0,
        color: { r: 0, g: 0, b: 0 },
        radius: 0,
        glow: 0,
        surfaceLum: 0,
        pulsarBeam: false,
      };
  }
}

/** Visual appearance of the terminal compact remnant. */
export function remnantAppearance(remnant: RemnantType | null): StarAppearance {
  switch (remnant) {
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
      };
    }
    case RemnantType.NeutronStar: {
      const temperatureK = 30000; // tiny, intense
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: NEUTRON_STAR_RADIUS,
        glow: 2.0,
        surfaceLum: 1.0,
        pulsarBeam: false,
      };
    }
    case RemnantType.Pulsar: {
      const temperatureK = 34000; // neutron star + sweeping beam
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: NEUTRON_STAR_RADIUS,
        glow: 2.2,
        surfaceLum: 1.0,
        pulsarBeam: true,
      };
    }
    default:
      return {
        visible: false,
        temperatureK: 0,
        color: { r: 0, g: 0, b: 0 },
        radius: 0,
        glow: 0,
        surfaceLum: 0,
        pulsarBeam: false,
      };
  }
}
