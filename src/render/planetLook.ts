// Per-planet appearance model: colour, axial tilt, rings and moon systems.
//
// The kernel deliberately knows nothing about what a planet LOOKS like — it only
// tracks mass, radius and orbit. Everything here is therefore derived
// deterministically from the body's stable id plus its physical properties, so a
// given world keeps the same face for the whole run (and across a rewind) while
// no two neighbours look alike.
//
// Pure and Three.js-free so the classification and the moon geometry can be
// unit-tested; `BodyRenderer` turns the results into instances.

import { solarToEarthMasses } from '../sim/astro';
import { GAS_GIANT_MIN_EARTH_MASSES, ICE_GIANT_MIN_EARTH_MASSES } from '../ui/bodyInfo';

/** Linear RGB triple in [0, 1]. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Broad compositional class of a planet, from its mass (see `bodyInfo.ts`). */
export enum PlanetClass {
  Rocky,
  IceGiant,
  GasGiant,
  /**
   * A world with no condensable solids at all: a small hydrogen/helium envelope
   * with nothing rocky or icy underneath, which is the only kind of low-mass
   * world a metal-poor disc could ever assemble (spec §4.3, Decision D3).
   */
  GasDwarf,
}

/**
 * Metal mass fraction of the Sun's birth cloud — the reference composition, and
 * the host mirror of `SOLAR_METALLICITY` in `wasm/src/nbody.rs`.
 */
export const SOLAR_METALLICITY = 0.02;

/** Ceiling on the solid budget relative to solar (mirror of `MAX_SOLID_FRACTION`). */
export const MAX_SOLID_FRACTION = 4;

/**
 * Smallest solid budget that still condenses rock, ice and the debris rings and
 * moons are made of: an eighth of the solar value, which is exactly the budget
 * below which the kernel can no longer assemble a single planetary embryo
 * (`seeded_planetesimal_count` in `wasm/src/lib.rs`).
 */
export const MIN_SOLID_FRACTION_FOR_ROCK = 1 / 8;

/**
 * Condensable-solid budget at `metals`, relative to solar — the host mirror of
 * `solid_fraction` in `wasm/src/nbody.rs`. In this three-species model the metals
 * fraction holds every condensable species, so `metals = 0` means no rock, no
 * ice, and therefore no solid surface, no ring and no moon anywhere in the disc.
 */
export function solidFraction(metals: number): number {
  if (!Number.isFinite(metals) || metals <= 0) {
    return 0;
  }
  return Math.min(metals / SOLAR_METALLICITY, MAX_SOLID_FRACTION);
}

/**
 * Deterministic 0..1 hash of a body id and a channel index. Small, stable and
 * free of state — the same body always gets the same face, however many times
 * the renderer restarts or the history is rewound.
 */
export function bodyHash(id: number, channel: number): number {
  const x = Math.sin((Math.abs(id) + 1) * 127.1 + channel * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Classify a planet by mass and by the disc's composition, matching the
 * info-panel's mass terminology exactly.
 *
 * Mass alone is not enough (reported bug 4): rock and ice are made of metals, so
 * in a metal-poor disc a low-mass world cannot be a "stone" planet and a
 * mid-mass one cannot be an ICE giant — both are hydrogen/helium puffballs. The
 * disc's metallicity defaults to solar, which is the composition every existing
 * classification was written against.
 */
export function planetClass(massSolar: number, metals: number = SOLAR_METALLICITY): PlanetClass {
  const earth = solarToEarthMasses(massSolar);
  if (earth >= GAS_GIANT_MIN_EARTH_MASSES) {
    // A giant is mostly hydrogen and helium whatever the disc is made of.
    return PlanetClass.GasGiant;
  }
  if (solidFraction(metals) < MIN_SOLID_FRACTION_FOR_ROCK) {
    return PlanetClass.GasDwarf;
  }
  if (earth >= ICE_GIANT_MIN_EARTH_MASSES) {
    return PlanetClass.IceGiant;
  }
  return PlanetClass.Rocky;
}

/**
 * Palettes per class, in linear RGB. The hues are the ones the Solar System
 * actually shows: iron-rust and basalt greys for the terrestrials, the pale
 * methane cyan-blues of Uranus and Neptune, and the ammonia cream/ochre/salmon
 * bands of Jupiter and Saturn. Previously every planet shared ONE material
 * (`0x88aaff`), which is why they all looked alike.
 */
const PALETTES: Readonly<Record<PlanetClass, readonly Rgb[]>> = {
  [PlanetClass.Rocky]: [
    { r: 0.62, g: 0.45, b: 0.33 }, // rust / iron oxide (Mars)
    { r: 0.55, g: 0.53, b: 0.5 }, // basalt grey (Mercury)
    { r: 0.78, g: 0.71, b: 0.55 }, // dusty regolith (Venus)
    { r: 0.33, g: 0.47, b: 0.56 }, // ocean-and-cloud world (Earth)
    { r: 0.45, g: 0.4, b: 0.36 }, // dark carbonaceous crust
  ],
  [PlanetClass.IceGiant]: [
    { r: 0.35, g: 0.62, b: 0.78 }, // methane cyan (Uranus)
    { r: 0.24, g: 0.42, b: 0.78 }, // deep azure (Neptune)
    { r: 0.44, g: 0.7, b: 0.72 }, // pale sea-green
  ],
  [PlanetClass.GasGiant]: [
    { r: 0.79, g: 0.66, b: 0.48 }, // ammonia cream + ochre bands (Jupiter)
    { r: 0.85, g: 0.76, b: 0.55 }, // pale gold (Saturn)
    { r: 0.72, g: 0.5, b: 0.36 }, // deep salmon
    { r: 0.66, g: 0.6, b: 0.7 }, // hazy lilac (a cool, methane-rich giant)
  ],
  // Nothing condenses in a metal-free disc, so there are no oxides, no ices and
  // none of the hazes that colour the worlds above: a hydrogen/helium envelope
  // is nearly colourless, scattering blue-grey and washing out to pale.
  [PlanetClass.GasDwarf]: [
    { r: 0.58, g: 0.63, b: 0.7 }, // Rayleigh-scattering blue-grey
    { r: 0.66, g: 0.68, b: 0.71 }, // pale, featureless hydrogen
    { r: 0.6, g: 0.66, b: 0.68 }, // faint helium-tinted haze
  ],
};

/** The full drawn appearance of one planet. */
export interface PlanetLook {
  /** Compositional class, driving palette and ring/moon likelihood. */
  planetClass: PlanetClass;
  /** Base albedo colour in linear RGB. */
  color: Rgb;
  /** Axial tilt in radians (Earth 23°, Uranus 98° — worlds are not upright). */
  axialTilt: number;
  /** Whether this world carries a ring system. */
  hasRings: boolean;
  /**
   * Ring visual prominence in [0, 1]. 1 = full-opacity Saturn-like ring; values
   * < 1 yield a dimmer, translucent ring (ice-giant style). 0 means no ring
   * (hasRings is always false when this is 0).
   */
  ringProminence: number;
  /** Number of drawn moons. */
  moonCount: number;
}

/** Largest number of moons drawn for a single planet. */
export const MAX_MOONS_PER_PLANET = 4;

/**
 * Derive a planet's whole appearance from its id, its mass and the composition
 * of the disc it grew in. Deterministic: the same (id, class) always yields the
 * same look.
 */
export function planetLook(
  id: number,
  massSolar: number,
  metals: number = SOLAR_METALLICITY,
): PlanetLook {
  const cls = planetClass(massSolar, metals);
  const palette = PALETTES[cls];
  const pick = Math.floor(bodyHash(id, 1) * palette.length) % palette.length;
  const base = palette[pick] ?? palette[0]!;
  // A gentle per-body brightness jitter so even two worlds sharing a palette
  // entry are not pixel-identical.
  const shade = 0.85 + 0.3 * bodyHash(id, 2);

  // Ring presence and visual prominence, by class (spec §3.3):
  //   - Gas giant:  prominent rings on ~30 % of worlds (Saturn-like is the exception)
  //   - Ice giant:  faint rings on ~25 % of worlds (Uranus/Neptune-style, low opacity)
  //   - Rocky:      never — rocky worlds lack the mass / Roche radius to sustain rings
  // A ring is shattered ice and rock (spec §4.3), so it also needs the disc to
  // have contained solids in the first place: a metal-free system can show no
  // rings at all, whatever a world weighs.
  const solids = solidFraction(metals) >= MIN_SOLID_FRACTION_FOR_ROCK;
  const ringRoll = bodyHash(id, 5);
  let hasRings: boolean;
  let ringProminence: number;
  if (cls === PlanetClass.GasGiant && solids) {
    hasRings = ringRoll < 0.3;
    ringProminence = hasRings ? 1.0 : 0;
  } else if (cls === PlanetClass.IceGiant && solids) {
    hasRings = ringRoll < 0.25;
    ringProminence = hasRings ? 0.3 : 0;
  } else {
    hasRings = false;
    ringProminence = 0;
  }

  return {
    planetClass: cls,
    color: {
      r: Math.min(1, base.r * shade),
      g: Math.min(1, base.g * shade),
      b: Math.min(1, base.b * shade),
    },
    // Most worlds are modestly tilted; a minority are dramatically so.
    axialTilt: (bodyHash(id, 3) < 0.8 ? 0.6 : 1.9) * (bodyHash(id, 4) - 0.5) * 2,
    hasRings,
    ringProminence,
    moonCount: solids ? moonCountFor(cls, id) : 0,
  };
}

/**
 * How many moons a world of this class keeps. Giants have deep gravity wells and
 * dozens of satellites; terrestrials have none or one. Bounded by
 * {@link MAX_MOONS_PER_PLANET} because these are drawn, not simulated. A moon is
 * a solid body, so a disc with no solids hands out none of them (see the
 * `solids` gate in {@link planetLook}).
 */
function moonCountFor(cls: PlanetClass, id: number): number {
  const roll = bodyHash(id, 6);
  switch (cls) {
    case PlanetClass.GasGiant:
      return 3 + (roll < 0.5 ? 0 : 1);
    case PlanetClass.IceGiant:
      return 2 + (roll < 0.6 ? 0 : 1);
    default:
      // Rocky worlds rarely host moons — ~30 % chance of one (spec §3.3).
      return roll < 0.3 ? 1 : 0;
  }
}

/** The geometry of one drawn moon's circular orbit around its planet. */
export interface MoonOrbit {
  /** Orbit radius, as a MULTIPLE of the planet's drawn radius. */
  radiusFactor: number;
  /** Orbital plane tilt about the planet's local x-axis, in radians. */
  tilt: number;
  /** Phase at t = 0, in radians. */
  phase: number;
  /**
   * Angular speed in radians per sim-second (spec §3.4). The body renderer
   * advances moon positions by `angularSpeed × effectiveDt` where `effectiveDt`
   * is the sim dt for this frame, clamped to a legibility range so moons freeze
   * when paused and remain visible at all non-paused paces.
   */
  angularSpeed: number;
  /** Moon radius, as a MULTIPLE of the planet's drawn radius. */
  sizeFactor: number;
}

/**
 * Orbit of moon `index` around planet `id`.
 *
 * Everything is expressed relative to the planet's DRAWN radius, which is what
 * fixes the reported bug: bodies are floored to a minimum apparent size on
 * screen, so a moon placed at a multiple of the planet's TRUE radius ended up
 * buried inside the drawn sphere at every zoom level except the closest. Scaling
 * with the drawn radius keeps the moon system proportional to what is actually
 * on screen, so the moons — and their orbit rings — are always visible outside
 * their planet.
 */
export function moonOrbit(id: number, index: number): MoonOrbit {
  const jitter = bodyHash(id, 20 + index);
  // Geometric orbit-radius family (spec §3.3):
  //   r_k = 6 · 1.8^k · (0.9 + 0.2·jitter)
  // This mirrors the Galilean spread (Io≈6 R♃ … Callisto≈26 R♃) and keeps every
  // moon's orbit ring clearly outside the one below it.
  //   k=0: ~6   drawn radii  (Io-like)
  //   k=1: ~10.8 drawn radii  (Europa-like)
  //   k=2: ~19.4 drawn radii  (Ganymede-like)
  //   k=3: ~35   drawn radii  (Callisto-like)
  const radiusFactor = 6 * Math.pow(1.8, index) * (0.9 + 0.2 * jitter);
  return {
    radiusFactor,
    // A few degrees of inclination each, with the odd steeply-tilted capture.
    tilt: (bodyHash(id, 40 + index) - 0.5) * 0.9,
    phase: jitter * Math.PI * 2,
    // Inner moons orbit faster (Kepler): ω ∝ a^-3/2.
    angularSpeed: 0.85 * Math.pow(1 + index * 0.62, -1.5) * (0.85 + 0.3 * jitter),
    sizeFactor: 0.16 + 0.07 * bodyHash(id, 60 + index),
  };
}

/**
 * Position of a moon relative to its planet's centre, in DRAWN-radius units, at
 * the given accumulated sim-time elapsed (spec §3.4).
 *
 * The orbit is a unit circle in the x–z plane rotated about the local x-axis by
 * {@link MoonOrbit.tilt} — matching exactly what a Three.js `rotation.x = tilt`
 * does to the drawn orbit ring, so the moon is always ON the circle the overlay
 * draws rather than beside it.
 */
export function moonOffset(orbit: MoonOrbit, elapsedSeconds: number): [number, number, number] {
  const angle = orbit.phase + elapsedSeconds * orbit.angularSpeed;
  const x = Math.cos(angle) * orbit.radiusFactor;
  const flat = Math.sin(angle) * orbit.radiusFactor;
  return [x, -flat * Math.sin(orbit.tilt), flat * Math.cos(orbit.tilt)];
}
