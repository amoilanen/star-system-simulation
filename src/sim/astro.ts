// Astronomical unit conversions & physical derivations (educational accuracy).
//
// The simulation works in abstract "scene units" chosen for legibility, but the
// figures shown to the user (labels, info panels) must be REAL physics. This
// module is the single, pure, unit-tested bridge between the two:
//
//   scene units ⇄ astronomical units, solar ⇄ Earth masses, Keplerian orbital
//   velocity, planetary equilibrium temperature, stellar core/surface
//   temperature.
//
// Nothing here touches the DOM or Three.js, so every relation can be checked
// against textbook values (Earth: ~278 K and ~29.8 km/s at 1 AU; solar core:
// ~1.5e7 K).

import { LifecycleStage, RemnantType } from '../config/fateModel';

/**
 * Scene units per astronomical unit. One scene unit IS one AU, matching the
 * setup form's "cloud size 50 AU" control — so a body drawn 30 units from the
 * star really is at 30 AU, and the snow line at 2.7 AU sits where it should.
 * Bodies are still drawn far larger than true scale (otherwise they would be
 * sub-pixel), so only DISTANCES use this mapping; body radii are purely visual
 * (see `bodyRadiusFromMass`).
 */
export const SCENE_UNITS_PER_AU = 1;

/** Earth masses per solar mass. */
export const EARTH_MASSES_PER_SOLAR = 332946;

/** Jupiter masses per solar mass. */
export const JUPITER_MASSES_PER_SOLAR = 1047.35;

/** Solar radius expressed in astronomical units. */
export const SOLAR_RADIUS_AU = 0.00465047;

/** The Sun's effective (surface) temperature in Kelvin. */
export const SOLAR_EFFECTIVE_TEMPERATURE_K = 5772;

/** The Sun's central temperature in Kelvin. */
export const SOLAR_CORE_TEMPERATURE_K = 1.57e7;

/** Earth's mean orbital speed in km/s — the reference for Kepler's third law. */
export const EARTH_ORBITAL_SPEED_KMS = 29.78;

/** Convert a scene-unit distance to astronomical units. */
export function sceneToAu(sceneDistance: number): number {
  return Math.max(0, sceneDistance) / SCENE_UNITS_PER_AU;
}

/** Convert an astronomical-unit distance to scene units. */
export function auToScene(au: number): number {
  return Math.max(0, au) * SCENE_UNITS_PER_AU;
}

/** Convert a mass in solar masses to Earth masses. */
export function solarToEarthMasses(solarMasses: number): number {
  return Math.max(0, solarMasses) * EARTH_MASSES_PER_SOLAR;
}

/** Convert a mass in solar masses to Jupiter masses. */
export function solarToJupiterMasses(solarMasses: number): number {
  return Math.max(0, solarMasses) * JUPITER_MASSES_PER_SOLAR;
}

/**
 * Circular orbital speed in km/s at `distanceAu` around a star of
 * `starMassSolar`, from Kepler's third law: v = 29.78 · √(M / a). Earth (M = 1,
 * a = 1) returns ~29.78 km/s. Returns 0 for a non-positive distance.
 */
export function orbitalVelocityKms(starMassSolar: number, distanceAu: number): number {
  if (!(distanceAu > 0) || !(starMassSolar > 0)) {
    return 0;
  }
  return EARTH_ORBITAL_SPEED_KMS * Math.sqrt(starMassSolar / distanceAu);
}

/**
 * Main-sequence stellar radius in SOLAR radii from mass, using the standard
 * approximation R ∝ M^0.8 for low-mass stars. Illustrative but correctly
 * ordered (more massive ⇒ larger).
 */
export function stellarRadiusSolar(massSolar: number): number {
  const m = Math.max(massSolar, 1e-3);
  return Math.pow(m, 0.8);
}

/**
 * Planetary equilibrium (surface) temperature in Kelvin for a body orbiting at
 * `distanceAu` from a star of effective temperature `starTeffK` and radius
 * `starRadiusSolar`:
 *
 *   T_eq = T_eff · √(R_star / 2d)
 *
 * with an optional Bond `albedo` factor (default 0.3, Earth-like), giving ~255 K
 * for Earth and ~278 K for a perfect absorber. Returns 0 beyond a sane domain.
 */
export function equilibriumTemperatureK(
  starTeffK: number,
  starRadiusSolar: number,
  distanceAu: number,
  albedo = 0,
): number {
  if (!(distanceAu > 0) || !(starTeffK > 0) || !(starRadiusSolar > 0)) {
    return 0;
  }
  const radiusAu = starRadiusSolar * SOLAR_RADIUS_AU;
  const a = Math.min(Math.max(albedo, 0), 0.99);
  return starTeffK * Math.sqrt(radiusAu / (2 * distanceAu)) * Math.pow(1 - a, 0.25);
}

/**
 * Illustrative stellar CORE temperature in Kelvin for the current lifecycle
 * stage. Hydrogen fusion switches on near 1e7 K; core temperature rises steeply
 * once the star contracts, and a red-giant/evolved core is far hotter (helium
 * burning ~1e8 K). Compact remnants are quoted at their (much lower) surface-
 * adjacent interior scale for a white dwarf and extreme values for neutron
 * stars. Pure and clamped; illustrative rather than a stellar-structure result.
 */
export function coreTemperatureK(
  stage: LifecycleStage,
  massSolar: number,
  remnant: RemnantType | null = null,
): number {
  const m = Math.max(massSolar, 1e-3);
  // Core temperature scales weakly with mass on the main sequence.
  const mainSequenceCore = SOLAR_CORE_TEMPERATURE_K * Math.pow(m, 0.55);
  switch (stage) {
    case LifecycleStage.DustCloud:
      // A cold molecular cloud core: tens of Kelvin.
      return 20;
    case LifecycleStage.ProtostarCoalescence:
      // Contracting, heating, but below the fusion threshold.
      return 3e6;
    case LifecycleStage.FusionIgnition:
      // Just crossing the ~1e7 K hydrogen-burning threshold.
      return 1e7;
    case LifecycleStage.MainSequence:
      return mainSequenceCore;
    case LifecycleStage.RedGiant:
      // Helium burning in a contracted core.
      return Math.max(1e8, mainSequenceCore * 6);
    case LifecycleStage.Death:
      // Runaway burning / core collapse.
      return Math.max(3e8, mainSequenceCore * 20);
    case LifecycleStage.Remnant:
      switch (remnant) {
        case RemnantType.NeutronStar:
        case RemnantType.Pulsar:
          return 1e9;
        case RemnantType.WhiteDwarf:
        default:
          return 1e7;
      }
    default:
      return mainSequenceCore;
  }
}
