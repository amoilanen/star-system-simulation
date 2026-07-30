// Pure star-appearance model (spec §3.2, D6). No Three.js dependency so the
// blackbody color ramp and stage→appearance mapping are cheap to unit-test.
//
// The star itself is NOT part of the kernel body buffer — it is the core at the
// scene origin — so its visual parameters (effective temperature, radius, glow
// intensity) are derived here from the lifecycle stage, cloud mass and the
// selected remnant. StarRenderer feeds these into its GLSL uniforms.

import { FATE_THRESHOLDS, LifecycleStage, RemnantType } from '../config/fateModel';
import { DEATH_PHASES, NEBULA_PHASES } from '../sim/stages';
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
 * Zero-age main-sequence radius in scene units (AU) at TRUE physical scale and
 * with NO clamp: `SOLAR_RADIUS_AU · M^0.8` (reusing `stellarRadiusSolar` from
 * astro.ts). 0.00465 AU for the Sun.
 *
 * This — not the clamped {@link mainSequenceRadius} — is the base every SWOLLEN
 * stage (protostar, red giant, fireball, planetary nebula) is derived from.
 * Multiplying the *clamped* radius by the swell factors is what drew a 20 M☉
 * protostar 10.75 AU across (0.05 × 215) and put every planet the kernel had
 * just seeded at 1–7 AU inside the star (reported bugs 3 and 6): the clamp
 * raises a massive star's base radius by up to 20× relative to its true value,
 * and the swell factor then multiplies that error.
 */
export function trueStellarRadius(mass: number): number {
  return SOLAR_RADIUS_AU * stellarRadiusSolar(Math.max(mass, 1e-3));
}

/**
 * Lower floor on every DRAWN stellar radius, in scene units (AU): one Jupiter
 * radius, ≈ 70 000 km ≈ 5e-4 AU.
 *
 * Deliberately EQUAL to {@link BROWN_DWARF_RADIUS}. Electron degeneracy holds
 * every object between a few Jupiter masses and the hydrogen-burning limit at
 * roughly one Jupiter radius, so a 0.079 M☉ brown dwarf and a 0.081 M☉ red dwarf
 * are very nearly the same size in reality. When this floor sat ABOVE the
 * brown-dwarf radius, {@link companionAppearance} made a companion DOUBLE in
 * drawn size in the single frame it crossed the burning limit in; with the two
 * equal, the handover is the ~20 % step the physics actually has.
 */
export const MIN_DRAWN_STELLAR_RADIUS = 5e-4;

/**
 * Base scene radius (scene units = AU) of a main-sequence star from its mass,
 * as DRAWN: {@link trueStellarRadius} clamped to
 * {@link MIN_DRAWN_STELLAR_RADIUS}–0.05 AU.
 *
 * The Sun's radius is 0.00465 AU — a ratio of ~215:1 against a 1 AU orbit.
 * At system-framing distances the star is sub-pixel, which is why
 * `StarRenderer` floors its drawn size to a minimum number of pixels (the same
 * trick Celestia / NASA's Eyes use). That floor keeps it readable WITHOUT
 * inflating the physical radius, so zoomed-in proportions are correct.
 *
 * Clamped: below the lower end the float math loses precision; above the upper
 * end the star fills the inner system regardless of the pixel floor (an
 * extreme-mass "star" would exceed the clamp anyway). Its influence is now
 * confined to the COMPACT stages: nothing multiplies it by more than the
 * ×1.5 of {@link ignitionRadius}, so the clamp can no longer be amplified into
 * an AU-scale error the way the ×215/×250/×350 swells amplified it.
 */
export function mainSequenceRadius(mass: number): number {
  return clamp(trueStellarRadius(mass), MIN_DRAWN_STELLAR_RADIUS, 0.05);
}

/**
 * Red-giant photospheric reach in scene units (AU) for a 1 M☉ star — mirror of
 * `REDGIANT_ENGULF_AU` in `wasm/src/lib.rs`. Inside this radius the KERNEL
 * destroys worlds, so it is the one radius the drawn star is allowed to reach:
 * anything larger would swallow a planet the physics has kept alive.
 */
export const REDGIANT_ENGULF_AU = 2.2;

/**
 * The kernel's engulf radius for a star of `mass` (scene units) — mirror of
 * `Kernel::photosphere_radius`'s red-giant value, `REDGIANT_ENGULF_AU · M^0.8`
 * with the same `max(M, 0.1)` floor.
 *
 * Hard invariant, asserted in `test/render/starVisual.test.ts`: for EVERY stage
 * and EVERY mass, `starAppearance(...).radius <= engulfRadius(mass)`. The drawn
 * photosphere may never enclose an orbit the kernel has not already cleared.
 */
export function engulfRadius(mass: number): number {
  return REDGIANT_ENGULF_AU * Math.pow(Math.max(mass, 0.1), 0.8);
}

/**
 * How many times its TRUE main-sequence radius the star swells as a red giant.
 * The Sun expands to ~250 R☉ ≈ 1.16 AU at its tip-of-the-red-giant-branch peak
 * — a true factor of ~250. At 1 M☉: `0.00465 · 250 ≈ 1.16 AU`, i.e. 53 % of
 * `REDGIANT_ENGULF_AU = 2.2 AU` (the kernel's destruction radius) — and because
 * both scale as `M^0.8` that 53 % holds at EVERY mass, so no planet can survive
 * inside the drawn photosphere that the kernel has not already consumed.
 */
export const RED_GIANT_SWELL = 250;

/**
 * Radius (scene units) of the fully swollen red-giant photosphere: the shared
 * base of the red giant, the imploding core, the supernova fireball and the
 * planetary-nebula envelope, so all four are on one continuous scale.
 */
export function giantPhotosphereRadius(mass: number): number {
  return trueStellarRadius(mass) * RED_GIANT_SWELL;
}

/**
 * Radius the star has contracted to when hydrogen ignites, as a multiple of the
 * radius it settles at: still ~1.5× oversized, matching
 * `stellarRadiusForStageSolar`'s `FusionIgnition` value in `./src/sim/astro.ts`.
 */
export const IGNITION_SWELL = 1.5;

/**
 * Radius (scene units) at hydrogen ignition — where the protostar hands over to
 * `FusionIgnition`, which then contracts to the main sequence.
 *
 * Taken from the DRAWN {@link mainSequenceRadius} rather than the true one so the
 * contraction always ends exactly on the radius the main sequence is drawn at,
 * even for the very low masses the drawn radius floors at 0.001 AU. The ×1.5 is
 * far too small for the clamp to distort anything — it is the ×250/×350 swells
 * that had to be moved off the clamped radius.
 */
export function ignitionRadius(mass: number): number {
  return mainSequenceRadius(mass) * IGNITION_SWELL;
}

/**
 * Protostellar radius in SOLAR radii at the birthline, `4 · M^0.5` — the
 * Hayashi-track radius `stellarRadiusForStageSolar` already uses for the
 * protostar stage. A 1 M☉ protostar is ~4 R☉ ≈ 0.019 AU: four times the Sun,
 * NOT the ~1 AU the old flat ×215 on a clamped radius produced.
 */
export const PROTOSTAR_HAYASHI_SOLAR_RADII = 4;

/**
 * Radius (scene units) of a contracting protostar at the START of
 * `ProtostarCoalescence`, from the physical Hayashi-track radius
 * (`4 R☉ · M^0.5`) rather than a flat multiple of the clamped main-sequence
 * radius.
 *
 * Floored just above {@link ignitionRadius} so the star always CONTRACTS
 * through the stage: the Hayashi radius grows only as `M^0.5` while the ignition
 * radius grows as `M^0.8`, so at the top of the mass range a raw Hayashi radius
 * would make the protostar SMALLER than the star it becomes.
 */
export function protostarRadius(mass: number): number {
  const m = Math.max(mass, 1e-3);
  const hayashi = SOLAR_RADIUS_AU * PROTOSTAR_HAYASHI_SOLAR_RADII * Math.sqrt(m);
  return Math.max(hayashi, ignitionRadius(m) * 1.15);
}

/**
 * Size of the glow halo as a multiple of the drawn star radius: a fixed base
 * plus the star's `glow`, itself capped so the halo's AREA stops responding to a
 * supernova's ×14 luminosity spike. Past that the spike is spent on brightness
 * (see {@link coronaIntensity}) and on `StarRenderer`'s viewport-relative size
 * cap, never on more of the screen.
 */
export const CORONA_BASE_SWELL = 3.5;
export const CORONA_GLOW_SWELL_CAP = 4;

/**
 * World-space radius (scene units) the additive glow halo wants for a star of
 * drawn radius `starRadius` and the given `glow`. `StarRenderer` then floors AND
 * caps its APPARENT size — this is only the physical size it asks for. Pure.
 */
export function coronaRadius(starRadius: number, glow: number): number {
  const g = clamp(glow, 0, CORONA_GLOW_SWELL_CAP);
  return Math.max(starRadius, 0) * (CORONA_BASE_SWELL + g);
}

/**
 * Hard ceiling on the halo's brightness. The corona is an additive quad, so its
 * contribution to the frame is `intensity × area`: once the area is capped this
 * is the only thing left that can grow, and it too has to stop somewhere.
 */
export const MAX_CORONA_INTENSITY = 1.6;

/**
 * Brightness the glow halo is drawn at, for a star of the given `glow` whose
 * apparent size was held back by a factor of `sizeOverflow` (1 = it fitted).
 *
 * Everything the halo cannot express as AREA it expresses as BRIGHTNESS: the
 * `glow` above {@link CORONA_GLOW_SWELL_CAP} that no longer swells it, and the
 * viewport cap `StarRenderer` applied on top. An ordinary star (`glow ≈ 1`,
 * uncapped) is unchanged at 0.6; a supernova's ×14 breakout spike reaches the
 * ceiling instead of reaching across the screen. Pure.
 */
export function coronaIntensity(glow: number, sizeOverflow = 1): number {
  const base = Math.min(1, 0.35 + Math.max(glow, 0) * 0.25);
  const beyondSwellCap = 1 + 0.06 * Math.max(0, glow - CORONA_GLOW_SWELL_CAP);
  return clamp(base * beyondSwellCap * Math.max(sizeOverflow, 1), 0, MAX_CORONA_INTENSITY);
}

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
 * larger than a white dwarf (4.3e-5 AU), and — because it IS the drawn floor
 * ({@link MIN_DRAWN_STELLAR_RADIUS}) — continuous with the faintest true star
 * across the hydrogen-burning limit rather than half its size.
 */
export const BROWN_DWARF_RADIUS = MIN_DRAWN_STELLAR_RADIUS;

/**
 * Effective temperature of a brown dwarf, in Kelvin. L/T dwarfs sit at roughly
 * 1000-2000 K — below the ~2400 K floor of the coolest real star, which is why
 * they glow a dull red rather than shining.
 */
export const BROWN_DWARF_TEMPERATURE_K = 1800;

/**
 * Ceiling on a COMPANION's corona/glow multiplier. The primary sits at
 * `glow = 1` on the main sequence, and a companion may genuinely outshine it —
 * but the halo is an additive billboard, so its growth has to stop well before
 * it can wash the frame (reported bug 6). Everything above the cap is expressed
 * as the companion's colour temperature, not as more screen area.
 */
export const MAX_COMPANION_GLOW = 1.6;

/** Floor on a companion STAR's glow, so the faintest red dwarf still reads. */
export const MIN_COMPANION_GLOW = 0.35;

/** Glow multiplier of a brown-dwarf companion: barely more than a dark ember. */
export const BROWN_DWARF_GLOW = 0.12;

/** Visual parameters for one self-luminous companion in the body buffer. */
export interface CompanionAppearance {
  /** True for a hydrogen-fusing star, false for a deuterium-only brown dwarf. */
  star: boolean;
  /** Effective surface temperature in Kelvin. */
  temperatureK: number;
  /** Blackbody colour at {@link CompanionAppearance.temperatureK}. */
  color: Rgb;
  /** Photospheric radius in scene units (AU), at true physical scale. */
  radius: number;
  /** Corona/glow multiplier, on the same scale as {@link StarAppearance.glow}. */
  glow: number;
  /**
   * Brightness the drawn disc is tinted to. Below 1 for the same reason the
   * primary's is: the ACES tone-map desaturates anything near white, and a
   * companion that reads as a white ball has lost the one cue — its colour —
   * that says how massive it is.
   */
  surfaceLum: number;
}

/**
 * Appearance of a self-luminous COMPANION of `massSolar` — a second star or a
 * brown dwarf the kernel seeded and typed by its own mass (spec §4.2, §4.7).
 *
 * The primary is not in the body buffer, so it has {@link starAppearance} and a
 * whole lifecycle; a companion is just a mass in the buffer, and this is the
 * whole of its look. Everything comes from the same physics the primary uses:
 * {@link mainSequenceTemperature} for the temperature, {@link blackbodyColor}
 * for the hue and {@link mainSequenceRadius} for the size — so a 2 M☉ companion
 * is drawn as the blue-white star it is instead of as the ringed gas giant a
 * mass-blind renderer made of it (reported bugs 1 and 2).
 *
 * `glow` follows `M^0.5` rather than the true `M^3.5` luminosity law: the halo
 * only has to ORDER companions by mass, and the real law's ×100 dynamic range is
 * exactly what turned an additive billboard into a wall of light. Pure.
 */
export function companionAppearance(massSolar: number): CompanionAppearance {
  const mass = Number.isFinite(massSolar) ? Math.max(massSolar, 0) : 0;
  const star = mass >= FATE_THRESHOLDS.hydrogenBurningMinMass;
  if (!star) {
    return {
      star: false,
      temperatureK: BROWN_DWARF_TEMPERATURE_K,
      color: blackbodyColor(BROWN_DWARF_TEMPERATURE_K),
      radius: BROWN_DWARF_RADIUS,
      glow: BROWN_DWARF_GLOW,
      // Dull and deep red: a brown dwarf radiates mostly in the infrared.
      surfaceLum: 0.35,
    };
  }
  const temperatureK = mainSequenceTemperature(mass);
  return {
    star: true,
    temperatureK,
    color: blackbodyColor(temperatureK),
    radius: mainSequenceRadius(mass),
    glow: clamp(Math.sqrt(mass), MIN_COMPANION_GLOW, MAX_COMPANION_GLOW),
    surfaceLum: 0.7,
  };
}

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
      // A cool, dim, contracting protostar warming from ~1200 K toward ~2800 K,
      // drawn at its PHYSICAL Hayashi-track radius (~4 R☉ ≈ 0.019 AU for 1 M☉)
      // and contracting to the ignition radius, which `FusionIgnition` picks up.
      //
      // It used to be drawn at ×215 the CLAMPED main-sequence radius — ~1 AU for
      // a solar star and 10.75 AU for a 20 M☉ one, which swallowed every
      // planetesimal the kernel seeds at this very stage (1–7 AU) and made the
      // surviving worlds look as if they hugged the star (reported bugs 3 and 6).
      // Legibility is the pixel FLOOR's job (`MIN_STAR_PIXELS`), not the physical
      // radius's — that is the whole point of having a floor.
      const temperatureK = 1200 + 1600 * p;
      const start = protostarRadius(mass);
      const radius = start + (ignitionRadius(mass) - start) * p;
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
      // end value (`ignitionRadius`, 1.5× the ZAMS radius) and contracts to the
      // drawn main-sequence radius by p=1 — a seamless continuation of the
      // Kelvin-Helmholtz shrinkage that ends with hydrogen ignition.
      const temperatureK = 2800 + (msTemp - 2800) * p;
      const start = ignitionRadius(mass);
      const radius = start + (msRadius - start) * p;
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
      // Swells from the drawn main-sequence radius to the giant photosphere,
      // which is derived from the TRUE (unclamped) radius — see
      // `giantPhotosphereRadius`.
      const radius = msRadius + (giantPhotosphereRadius(mass) - msRadius) * p;
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
      // `progress` here is the NEBULA's own clock (the kernel reports the
      // remnant stage's progress as how far the shell has dispersed), so the
      // compact object is drawn inside a shell that goes on expanding and fading
      // instead of appearing alone against an empty sky.
      return remnantAppearance(remnant, p, systemScale, supernova);

    default:
      return HIDDEN_STAR;
  }
}

/**
 * How far the supernova fireball's photosphere expands, as a multiple of the
 * star's TRUE (unclamped) main-sequence radius — see {@link trueStellarRadius}.
 *
 * Reconsidered against the same bound as every other swollen stage: the fireball
 * peaks at `≈ 349 · SOLAR_RADIUS_AU · M^0.8 = 1.62 · M^0.8` scene units, i.e.
 * 74 % of {@link engulfRadius}, at every mass. That is a bright ball visibly
 * dwarfing the inner system yet still inside the volume the kernel has already
 * cleared — where it used to be computed off the CLAMPED radius, which turned a
 * 20 M☉ progenitor's fireball into a 17.5 AU sphere with a 262 AU corona quad
 * in front of it (the reported screen-filling white-out). The transparent BLAST
 * SHELL driven by `SHELL_STALL_REACH` still sweeps far beyond it.
 */
export const FIREBALL_SWELL = 350;

/**
 * Radius at which the expanding shell finally STALLS, as a fraction of the birth
 * cloud's radius. Mirror of `EJECTA_STALL_REACH_*` in `wasm/src/lib.rs`.
 *
 * A real remnant does not coast forever: it sweeps up the interstellar medium,
 * decelerates and settles at a fixed radius, where it fades. The kernel
 * integrates exactly that, and the drawn shock front has to be the same shell as
 * the particles — so both use the same stall radius and the same sweep law.
 */
export const SHELL_STALL_REACH = { supernova: 1.5, nebula: 1.4 } as const;

/**
 * How far through that deceleration the shell is when the remnant appears, and
 * when the nebula has finally faded — see {@link NEBULA_PHASES}, which owns both
 * numbers because the kernel mirrors them.
 *
 * `deathSweep = 0.6` puts the shell edge at ~45 % of its stall radius: 0.6–1.1
 * cloud radii, still comfortably inside the framed system. The shell used to be
 * sized to cover 3.3 cloud radii by the same moment (165 AU for a 50 AU cloud,
 * against a view about 62 AU high), so the nebula was already off-screen before
 * it could be seen at all.
 */
export const DEATH_SWEEP = NEBULA_PHASES.deathSweep;
/** How far it has swept once the nebula has faded out entirely. */
export const REMNANT_SWEEP = NEBULA_PHASES.remnantSweep;

/**
 * Radius (scene units) of the decelerating shell after the given sweep, around a
 * system of cloud radius `scale`. Pure; the single law both the death stage and
 * the remnant stage draw the shell with, which is what makes the handover
 * between them seamless.
 */
export function shellRadius(supernova: boolean, sweep: number, scale: number): number {
  const stall = supernova ? SHELL_STALL_REACH.supernova : SHELL_STALL_REACH.nebula;
  return Math.max(scale, 1) * stall * (1 - Math.exp(-Math.max(sweep, 0)));
}

/**
 * Brightness the shell still carries at the moment the remnant appears — the
 * value the death stage fades DOWN to and the remnant stage fades on FROM.
 *
 * It used to fade to exactly zero at the end of the death stage while
 * `remnantAppearance` carried `...NO_BLAST`, so from the remnant on there was no
 * drawn nebula at all: "there is no nebula, only the small star remnant".
 */
export const NEBULA_HANDOVER_BRIGHTNESS = 0.35;

/**
 * Colour temperature (K) of the shell at that same moment: gas ionised by the
 * ferociously hot exposed core reads blue-white. Both death channels end here,
 * so the handover has no colour step either.
 */
export const NEBULA_IONISED_K = 13000;

/** …and the cooled, recombining colour the nebula has faded to by the end. */
export const NEBULA_COOL_K = 3600;

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
  // Every swollen radius here is derived from the TRUE (unclamped) radius, so a
  // massive progenitor's fireball stays in proportion instead of being inflated
  // by the drawn radius's 0.05 AU clamp.
  const trueRadius = trueStellarRadius(mass);
  const msTemp = mainSequenceTemperature(mass) * compositionTempFactor(composition);
  const giantRadius = giantPhotosphereRadius(mass);
  const scale = Math.max(systemScale, 1);
  const { shockBreakout, peakLuminosity } = DEATH_PHASES;

  if (!supernova) {
    return planetaryNebulaAppearance(giantRadius, p, scale);
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
  const fireball = trueRadius * (0.18 + FIREBALL_SWELL * expansion);
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

  // Cools from the breakout flash to `NEBULA_IONISED_K`, which is exactly where
  // the remnant stage's nebula picks the colour up.
  const shellColorK = clamp(
    BREAKOUT_TEMPERATURE_K * (1 - 0.8 * q) + NEBULA_IONISED_K - 0.2 * BREAKOUT_TEMPERATURE_K,
    NEBULA_IONISED_K,
    BREAKOUT_TEMPERATURE_K,
  );
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
    // The shell keeps expanding and fading for the whole sequence, and is handed
    // over — still lit, still expanding — to `remnantAppearance`'s nebula, which
    // continues it. It used to fade to exactly zero here while the remnant drew
    // no shell at all, which is why the remnant stage had no nebula in it.
    shockwave: clamp(NEBULA_HANDOVER_BRIGHTNESS + 0.65 * decay, 0, 1),
    shockwaveRadius: shellRadius(true, DEATH_SWEEP * q, scale),
    shockwaveColor: blackbodyColor(shellColorK),
  };
}

/**
 * The quiet death of a low-mass star: the envelope drifts off as a planetary
 * nebula and the exposed core — one of the hottest objects in the universe at
 * ~100 000 K — lights it up from inside before cooling into a white dwarf.
 */
function planetaryNebulaAppearance(giantRadius: number, p: number, scale: number): StarAppearance {
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
      // A slow, gentle shell rather than a blast wave — and it is drawn with the
      // same decelerating law as everything else, so it hands straight over.
      shockwave: 0.45 * k,
      shockwaveRadius: shellRadius(false, DEATH_SWEEP * p, scale),
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
    // Dims toward the handover brightness — NOT to nothing: the shell is still
    // there when the white dwarf appears, and `remnantAppearance` goes on drawing
    // it as the fading planetary nebula the star has just become.
    shockwave: 0.45 + (NEBULA_HANDOVER_BRIGHTNESS - 0.45) * k,
    shockwaveRadius: shellRadius(false, DEATH_SWEEP * p, scale),
    // Warmed by the exposed core until the gas is fully ionised: the shell ends
    // this stage at exactly the colour the remnant's nebula begins it.
    shockwaveColor: blackbodyColor(4200 + (NEBULA_IONISED_K - 4200) * k),
  };
}

/**
 * Effective surface temperature of a young neutron star, in Kelvin. Real values
 * are ~10^6 K — far off the blackbody ramp's domain, where everything saturates
 * to the same blue — so the ramp is fed the top of its range, which is the
 * correct COLOUR for anything that hot.
 */
export const NEUTRON_STAR_TEMPERATURE_K = 40000;

/**
 * The nebula the star left behind, as it looks `progress` of the way through the
 * remnant stage (spec §4.4, decision D2).
 *
 * The dying star's receding photosphere hands over to THIS, not to nothing: the
 * shell keeps expanding — ever more slowly, as it sweeps up the interstellar
 * medium — and fades out over the whole remnant stage, ionised blue-white while
 * it is still close to the searing core and cooling as it thins. `progress` and
 * the fade are on the kernel's own nebula clock (`EJECTA_LIFETIME`), so the drawn
 * shell and the ejecta particles inside it die out together.
 *
 * Pure; exported for unit testing.
 */
export function nebulaShell(
  progress: number,
  supernova: boolean,
  systemScale: number,
): Pick<StarAppearance, 'shockwave' | 'shockwaveRadius' | 'shockwaveColor'> {
  const p = clamp(progress, 0, 1);
  const temperatureK = NEBULA_IONISED_K - (NEBULA_IONISED_K - NEBULA_COOL_K) * Math.pow(p, 0.7);
  return {
    // Starts exactly where the death stage left it and thins away to nothing.
    shockwave: NEBULA_HANDOVER_BRIGHTNESS * Math.pow(1 - p, 1.5),
    shockwaveRadius: shellRadius(supernova, DEATH_SWEEP + REMNANT_SWEEP * p, systemScale),
    shockwaveColor: blackbodyColor(temperatureK),
  };
}

/**
 * Visual appearance of the terminal compact remnant, inside the nebula it threw
 * off. `progress` runs 0→1 as that nebula disperses; `supernova` and
 * `systemScale` size the shell exactly as the death stage sized it.
 */
export function remnantAppearance(
  remnant: RemnantType | null,
  progress = 0,
  systemScale = DEFAULT_SYSTEM_SCALE,
  supernova = false,
): StarAppearance {
  // A brown dwarf is not a corpse: it never died, so there is no shell around it.
  const nebula =
    remnant === null || remnant === RemnantType.BrownDwarf
      ? NO_BLAST
      : nebulaShell(progress, supernova, systemScale);
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
        // …inside the planetary nebula it just blew off.
        ...nebula,
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
        // …inside the still-expanding supernova remnant.
        ...nebula,
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
        ...nebula,
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
        ...nebula,
        blackHole: true,
      };
    }
    default:
      return HIDDEN_STAR;
  }
}
