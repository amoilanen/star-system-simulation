import { describe, it, expect } from 'vitest';
import { orbitPathPoints, orbitalElements } from '../../src/render/orbitPath';
import type { Vec3 } from '../../src/sim/PhysicsKernel';

/** Radius of the i-th sampled point in a flat [x,y,z,...] path. */
function radiusAt(points: Float32Array, i: number): number {
  return Math.hypot(points[i * 3] ?? 0, points[i * 3 + 1] ?? 0, points[i * 3 + 2] ?? 0);
}

describe('orbitalElements', () => {
  const mu = 100;

  it('identifies a circular orbit (e ≈ 0, bound)', () => {
    const r = 10;
    const v = Math.sqrt(mu / r); // exact circular speed
    const el = orbitalElements([r, 0, 0], [0, 0, v], mu);
    expect(el).not.toBeNull();
    expect(el!.eccentricity).toBeCloseTo(0, 6);
    expect(el!.bound).toBe(true);
    // Semi-latus rectum of a circle is its radius.
    expect(el!.semiLatusRectum).toBeCloseTo(r, 6);
  });

  it('identifies an elliptical orbit (0 < e < 1)', () => {
    const r = 10;
    const v = Math.sqrt(mu / r) * 0.8; // slower than circular ⇒ ellipse
    const el = orbitalElements([r, 0, 0], [0, 0, v], mu);
    expect(el!.eccentricity).toBeGreaterThan(0);
    expect(el!.eccentricity).toBeLessThan(1);
    expect(el!.bound).toBe(true);
  });

  it('identifies a hyperbolic (unbound) orbit at above escape speed', () => {
    const r = 10;
    const escape = Math.sqrt((2 * mu) / r);
    const el = orbitalElements([r, 0, 0], [0, 0, escape * 1.3], mu);
    expect(el!.eccentricity).toBeGreaterThan(1);
    expect(el!.bound).toBe(false);
  });

  it('returns null for a purely radial fall (no angular momentum)', () => {
    expect(orbitalElements([10, 0, 0], [-1, 0, 0], mu)).toBeNull();
  });

  it('returns null for degenerate inputs', () => {
    expect(orbitalElements([0, 0, 0], [0, 0, 1], mu)).toBeNull();
    expect(orbitalElements([10, 0, 0], [0, 0, 1], 0)).toBeNull();
  });

  it('orients the orbital plane from the angular momentum', () => {
    // Orbit in the x–z plane ⇒ the in-plane basis has no y component.
    const el = orbitalElements([10, 0, 0], [0, 0, 3], mu)!;
    expect(Math.abs(el.periapsisDir[1])).toBeLessThan(1e-9);
    expect(Math.abs(el.inPlaneDir[1])).toBeLessThan(1e-9);
  });
});

describe('orbitPathPoints', () => {
  const mu = 100;

  it('traces a closed circle of the right radius', () => {
    const r = 12;
    const v = Math.sqrt(mu / r);
    const points = orbitPathPoints([r, 0, 0], [0, 0, v], mu, { segments: 64 });
    expect(points.length).toBe(65 * 3);
    for (let i = 0; i < 65; i += 1) {
      expect(radiusAt(points, i)).toBeCloseTo(r, 4);
    }
    // Closed: last point coincides with the first.
    expect(points[0]).toBeCloseTo(points[64 * 3]!, 4);
    expect(points[2]).toBeCloseTo(points[64 * 3 + 2]!, 4);
  });

  it('passes through the body’s current position', () => {
    const pos: Vec3 = [9, 0, 4];
    const vel: Vec3 = [0.4, 0, 2.6];
    const points = orbitPathPoints(pos, vel, mu, { segments: 512 });
    const target = Math.hypot(...pos);
    let best = Infinity;
    for (let i = 0; i < points.length / 3; i += 1) {
      best = Math.min(
        best,
        Math.hypot(
          (points[i * 3] ?? 0) - pos[0],
          (points[i * 3 + 1] ?? 0) - pos[1],
          (points[i * 3 + 2] ?? 0) - pos[2],
        ),
      );
    }
    // Some sampled point lies essentially on the body itself.
    expect(best).toBeLessThan(target * 0.02);
  });

  it('varies between periapsis and apoapsis for an eccentric orbit', () => {
    const r = 10;
    const v = Math.sqrt(mu / r) * 0.75;
    const points = orbitPathPoints([r, 0, 0], [0, 0, v], mu, { segments: 128 });
    let min = Infinity;
    let max = 0;
    for (let i = 0; i < points.length / 3; i += 1) {
      const d = radiusAt(points, i);
      min = Math.min(min, d);
      max = Math.max(max, d);
    }
    expect(min).toBeLessThan(r);
    expect(max).toBeGreaterThan(r * 0.99);
    expect(max).toBeGreaterThan(min);
  });

  it('draws a finite arc for an unbound orbit', () => {
    const r = 10;
    const escape = Math.sqrt((2 * mu) / r);
    const points = orbitPathPoints([r, 0, 0], [0, 0, escape * 1.4], mu, {
      segments: 64,
      maxRadius: 500,
    });
    expect(points.length).toBe(65 * 3);
    for (let i = 0; i < 65; i += 1) {
      const d = radiusAt(points, i);
      expect(Number.isFinite(d)).toBe(true);
      expect(d).toBeLessThanOrEqual(500 + 1e-6);
    }
    // An open branch is NOT closed: its two endpoints are far apart. (The arc
    // is symmetric about periapsis, so compare full 3-D endpoints, not just x.)
    const endpointGap = Math.hypot(
      (points[0] ?? 0) - (points[64 * 3] ?? 0),
      (points[1] ?? 0) - (points[64 * 3 + 1] ?? 0),
      (points[2] ?? 0) - (points[64 * 3 + 2] ?? 0),
    );
    expect(endpointGap).toBeGreaterThan(r);
  });

  it('returns an empty path when there is no drawable orbit', () => {
    expect(orbitPathPoints([10, 0, 0], [-1, 0, 0], mu).length).toBe(0);
  });
});

describe('degenerate radial trajectories (bug: straight lines through the star)', () => {
  it('draws nothing for a body falling straight at the star', () => {
    // Velocity exactly antiparallel to position ⇒ zero angular momentum. There
    // is no orbital plane and no conic; drawing one produced a straight streak
    // running through the star that never went away.
    const pos: Vec3 = [60, 0, 45];
    const vel: Vec3 = [-1.2, 0, -0.9];
    expect(orbitalElements(pos, vel, 110)).toBeNull();
    expect(orbitPathPoints(pos, vel, 110)).toHaveLength(0);
  });

  it('rejects a NEARLY radial trajectory too, at any scale', () => {
    // Numerical noise leaves a minuscule tangential component. The rejection
    // test is relative to |r||v|, so it still reads as "collinear" — an absolute
    // epsilon would let this through and draw the same streak.
    const pos: Vec3 = [60, 0, 45];
    const vel: Vec3 = [-1.2, 1e-9, -0.9];
    expect(orbitalElements(pos, vel, 110)).toBeNull();
    expect(orbitPathPoints(pos, vel, 110)).toHaveLength(0);

    // The same trajectory scaled up a millionfold is still radial.
    const bigPos: Vec3 = [6e7, 0, 4.5e7];
    const bigVel: Vec3 = [-1.2e3, 1e-3, -0.9e3];
    expect(orbitalElements(bigPos, bigVel, 110)).toBeNull();
  });

  it('still draws a genuine fly-by with a real impact parameter', () => {
    // Same approach, but missing the star by a healthy margin: a real hyperbola.
    const pos: Vec3 = [60, 0, 45];
    const vel: Vec3 = [-1.2, 0.05, -0.9 + 0.6];
    const elements = orbitalElements(pos, vel, 110);
    expect(elements).not.toBeNull();
    const periapsis = elements!.semiLatusRectum / (1 + elements!.eccentricity);
    expect(periapsis).toBeGreaterThan(1);
    expect(orbitPathPoints(pos, vel, 110).length).toBeGreaterThan(0);
  });
});
