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

/** Classify a planet by mass, matching the info-panel's terminology exactly. */
export function planetClass(massSolar: number): PlanetClass {
  const earth = solarToEarthMasses(massSolar);
  if (earth >= GAS_GIANT_MIN_EARTH_MASSES) {
    return PlanetClass.GasGiant;
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
  /** Number of drawn moons. */
  moonCount: number;
}

/** Largest number of moons drawn for a single planet. */
export const MAX_MOONS_PER_PLANET = 4;

/**
 * Derive a planet's whole appearance from its id and mass. Deterministic: the
 * same (id, mass class) always yields the same look.
 */
export function planetLook(id: number, massSolar: number): PlanetLook {
  const cls = planetClass(massSolar);
  const palette = PALETTES[cls];
  const pick = Math.floor(bodyHash(id, 1) * palette.length) % palette.length;
  const base = palette[pick] ?? palette[0]!;
  // A gentle per-body brightness jitter so even two worlds sharing a palette
  // entry are not pixel-identical.
  const shade = 0.85 + 0.3 * bodyHash(id, 2);

  return {
    planetClass: cls,
    color: {
      r: Math.min(1, base.r * shade),
      g: Math.min(1, base.g * shade),
      b: Math.min(1, base.b * shade),
    },
    // Most worlds are modestly tilted; a minority are dramatically so.
    axialTilt: (bodyHash(id, 3) < 0.8 ? 0.6 : 1.9) * (bodyHash(id, 4) - 0.5) * 2,
    // Rings need a massive world to hold them and are commonest on gas giants.
    hasRings: cls === PlanetClass.GasGiant ? bodyHash(id, 5) < 0.55 : bodyHash(id, 5) < 0.12,
    moonCount: moonCountFor(cls, id),
  };
}

/**
 * How many moons a world of this class keeps. Giants have deep gravity wells and
 * dozens of satellites; terrestrials have none or one. Bounded by
 * {@link MAX_MOONS_PER_PLANET} because these are drawn, not simulated.
 */
function moonCountFor(cls: PlanetClass, id: number): number {
  const roll = bodyHash(id, 6);
  switch (cls) {
    case PlanetClass.GasGiant:
      return 3 + (roll < 0.5 ? 0 : 1);
    case PlanetClass.IceGiant:
      return 2 + (roll < 0.6 ? 0 : 1);
    default:
      return roll < 0.45 ? 0 : 1;
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
  /** Angular speed in radians per second of real time. */
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
  return {
    // Well clear of the planet's disc, and spaced so the orbits never overlap.
    radiusFactor: 3.4 + 2.1 * index + 0.6 * jitter,
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
 * the given elapsed time.
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
