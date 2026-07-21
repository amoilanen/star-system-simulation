// Pure star-appearance model (spec §3.2, D6). No Three.js dependency so the
// blackbody color ramp and stage→appearance mapping are cheap to unit-test.
//
// The star itself is NOT part of the kernel body buffer — it is the core at the
// scene origin — so its visual parameters (effective temperature, radius, glow
// intensity) are derived here from the lifecycle stage, cloud mass and the
// selected remnant. StarRenderer feeds these into its GLSL uniforms.

import { LifecycleStage, RemnantType } from '../config/fateModel';

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

/** Base scene radius of a main-sequence star from its mass (gentle scaling). */
export function mainSequenceRadius(mass: number): number {
  const m = Math.max(mass, 1e-3);
  return clamp(1.0 * Math.pow(m, 0.4), 0.4, 8);
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
): StarAppearance {
  const p = clamp(progress, 0, 1);
  const msTemp = mainSequenceTemperature(mass);
  const msRadius = mainSequenceRadius(mass);

  switch (stage) {
    case LifecycleStage.DustCloud:
      return {
        visible: false,
        temperatureK: 0,
        color: { r: 0, g: 0, b: 0 },
        radius: 0,
        glow: 0,
        pulsarBeam: false,
      };

    case LifecycleStage.ProtostarCoalescence: {
      // A cool, dim, contracting protostar warming from ~1200 K toward ~2800 K.
      const temperatureK = 1200 + 1600 * p;
      const radius = msRadius * (1.8 - 0.6 * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius,
        glow: 0.4 + 0.3 * p,
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
        pulsarBeam: false,
      };
    }

    case LifecycleStage.MainSequence:
      return {
        visible: true,
        temperatureK: msTemp,
        color: blackbodyColor(msTemp),
        radius: msRadius,
        glow: 1.0,
        pulsarBeam: false,
      };

    case LifecycleStage.RedGiant: {
      // Cools toward ~3400 K while the envelope swells several-fold.
      const temperatureK = msTemp + (3400 - msTemp) * p;
      const radius = msRadius * (1 + 6 * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius,
        glow: 1.0 + 0.5 * p,
        pulsarBeam: false,
      };
    }

    case LifecycleStage.Death: {
      // Peak brightness (supernova flash / envelope ejection).
      const temperatureK = 8000;
      const radius = msRadius * (7 - 5 * p);
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: Math.max(radius, 0.3),
        glow: 2.5,
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
        pulsarBeam: false,
      };
  }
}

/** Visual appearance of the terminal compact remnant. */
export function remnantAppearance(remnant: RemnantType | null): StarAppearance {
  switch (remnant) {
    case RemnantType.WhiteDwarf: {
      const temperatureK = 15000; // small, hot, blue-white
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: 0.35,
        glow: 1.2,
        pulsarBeam: false,
      };
    }
    case RemnantType.NeutronStar: {
      const temperatureK = 30000; // tiny, intense
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: 0.18,
        glow: 2.0,
        pulsarBeam: false,
      };
    }
    case RemnantType.Pulsar: {
      const temperatureK = 34000; // neutron star + sweeping beam
      return {
        visible: true,
        temperatureK,
        color: blackbodyColor(temperatureK),
        radius: 0.18,
        glow: 2.2,
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
        pulsarBeam: false,
      };
  }
}
