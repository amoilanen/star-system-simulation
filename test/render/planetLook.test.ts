import { describe, expect, it } from 'vitest';
import {
  MAX_MOONS_PER_PLANET,
  PlanetClass,
  moonOffset,
  moonOrbit,
  planetClass,
  planetLook,
} from '../../src/render/planetLook';
import { GAS_GIANT_MIN_EARTH_MASSES, ICE_GIANT_MIN_EARTH_MASSES } from '../../src/ui/bodyInfo';
import { EARTH_MASSES_PER_SOLAR } from '../../src/sim/astro';

/** Convert Earth masses to the solar masses the kernel buffer carries. */
const solar = (earthMasses: number): number => earthMasses / EARTH_MASSES_PER_SOLAR;

describe('planetClass', () => {
  it('matches the info panel’s mass thresholds exactly', () => {
    expect(planetClass(solar(1))).toBe(PlanetClass.Rocky);
    expect(planetClass(solar(ICE_GIANT_MIN_EARTH_MASSES))).toBe(PlanetClass.IceGiant);
    expect(planetClass(solar(GAS_GIANT_MIN_EARTH_MASSES))).toBe(PlanetClass.GasGiant);
    expect(planetClass(solar(318))).toBe(PlanetClass.GasGiant);
  });
});

describe('bug 8 — planets must not all look alike', () => {
  it('is deterministic for a given body', () => {
    const a = planetLook(7, solar(1));
    const b = planetLook(7, solar(1));
    expect(a).toEqual(b);
  });

  it('gives neighbouring worlds of the same class different colours', () => {
    const colors = new Set<string>();
    for (let id = 0; id < 12; id += 1) {
      const { r, g, b } = planetLook(id, solar(1)).color;
      colors.add(`${r.toFixed(3)},${g.toFixed(3)},${b.toFixed(3)}`);
    }
    // Previously every planet shared ONE material, i.e. exactly 1 colour.
    expect(colors.size).toBeGreaterThan(8);
  });

  it('colours each class from its own palette', () => {
    // Rocky worlds are mostly warm rock and regolith (one ocean world aside);
    // every ice giant is blue-dominant.
    let warmRocky = 0;
    for (let id = 0; id < 12; id += 1) {
      const c = planetLook(id, solar(1)).color;
      if (c.r >= c.b) {
        warmRocky += 1;
      }
    }
    expect(warmRocky).toBeGreaterThan(6);

    let blueIceGiants = 0;
    for (let id = 0; id < 12; id += 1) {
      const c = planetLook(id, solar(20)).color;
      if (c.b > c.r) {
        blueIceGiants += 1;
      }
    }
    expect(blueIceGiants).toBe(12);
  });

  it('tilts axes and hands out rings and moons unevenly', () => {
    const looks = Array.from({ length: 16 }, (_, id) => planetLook(id, solar(200)));
    expect(new Set(looks.map((l) => l.axialTilt)).size).toBeGreaterThan(8);
    // Some giants have rings, some do not — a ringed world is a landmark.
    expect(looks.some((l) => l.hasRings)).toBe(true);
    expect(looks.some((l) => !l.hasRings)).toBe(true);
    for (const look of looks) {
      expect(look.moonCount).toBeLessThanOrEqual(MAX_MOONS_PER_PLANET);
    }
  });

  it('gives giants more moons than rocky worlds', () => {
    const total = (massSolar: number): number =>
      Array.from({ length: 20 }, (_, id) => planetLook(id, massSolar).moonCount).reduce(
        (a, b) => a + b,
        0,
      );
    expect(total(solar(400))).toBeGreaterThan(total(solar(1)));
  });
});

describe('bug 3 — moons need room and a visible orbit', () => {
  it('places every moon well outside its planet’s drawn disc', () => {
    for (let id = 0; id < 20; id += 1) {
      for (let k = 0; k < MAX_MOONS_PER_PLANET; k += 1) {
        // Radii are multiples of the planet's DRAWN radius, so >1 means the moon
        // is outside the sphere at every zoom level — the reported bug was moons
        // sitting inside (or on) their planet.
        expect(moonOrbit(id, k).radiusFactor).toBeGreaterThan(3);
        expect(moonOrbit(id, k).sizeFactor).toBeLessThan(0.35);
      }
    }
  });

  it('never lets two of a planet’s moons share an orbit', () => {
    for (let id = 0; id < 10; id += 1) {
      const radii = Array.from(
        { length: MAX_MOONS_PER_PLANET },
        (_, k) => moonOrbit(id, k).radiusFactor,
      );
      for (let k = 1; k < radii.length; k += 1) {
        expect(radii[k]!).toBeGreaterThan(radii[k - 1]! + 1);
      }
    }
  });

  it('keeps the moon exactly on the circle the orbit ring draws', () => {
    const orbit = moonOrbit(5, 1);
    for (const t of [0, 0.7, 3.3, 12.5]) {
      const [x, y, z] = moonOffset(orbit, t);
      // Distance from the planet is constant: a true circle, so the drawn ring
      // and the moon on it can never disagree.
      expect(Math.hypot(x, y, z)).toBeCloseTo(orbit.radiusFactor, 6);
      // …and it lies in the plane obtained by rotating x–z about x by `tilt`.
      expect(y * Math.cos(orbit.tilt) + z * Math.sin(orbit.tilt)).toBeCloseTo(0, 6);
    }
  });

  it('moves the moons around their planet over time', () => {
    const orbit = moonOrbit(2, 0);
    const start = moonOffset(orbit, 0);
    const later = moonOffset(orbit, 1.5);
    expect(
      Math.hypot(start[0] - later[0], start[1] - later[1], start[2] - later[2]),
    ).toBeGreaterThan(0.1);
  });

  it('runs inner moons faster than outer ones (Kepler)', () => {
    expect(moonOrbit(4, 0).angularSpeed).toBeGreaterThan(moonOrbit(4, 2).angularSpeed);
  });
});
