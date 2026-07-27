// Keplerian orbit reconstruction from a body's instantaneous state vector.
//
// The kernel only stores each body's position and velocity, so to DRAW an orbit
// we solve for the conic section those state vectors imply around the central
// mass (the classic two-body orbital-elements problem):
//
//   h = r × v                     specific angular momentum (orbit normal)
//   e = ((v² − μ/r)·r − (r·v)·v)/μ eccentricity vector (points at periapsis)
//   p = |h|²/μ                    semi-latus rectum
//   r(ν) = p / (1 + e·cos ν)      the conic, in the orbital plane
//
// which covers ellipses (e < 1, bound planets), parabolas and hyperbolas
// (e ≥ 1, comets/asteroids merely passing through) with one formula. The kernel
// integrates SOFTENED gravity, so the drawn conic is exact only for r ≫ the
// softening length — true for every body outside the star's immediate vicinity.
//
// Pure and DOM/Three.js-free so the orbital mechanics can be unit-tested.

import type { Vec3 } from '../sim/PhysicsKernel';

/** Orbital elements describing the conic a state vector lies on. */
export interface OrbitalElements {
  /** Eccentricity: <1 ellipse (bound), =1 parabola, >1 hyperbola (unbound). */
  eccentricity: number;
  /** Semi-latus rectum in scene units. */
  semiLatusRectum: number;
  /** Unit vector from the focus toward periapsis. */
  periapsisDir: Vec3;
  /** Unit vector in the orbital plane, 90° ahead of {@link periapsisDir}. */
  inPlaneDir: Vec3;
  /** Whether the orbit is closed (gravitationally bound). */
  bound: boolean;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function norm(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

function scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function unit(v: Vec3): Vec3 | null {
  const n = norm(v);
  return n > 1e-12 ? scale(v, 1 / n) : null;
}

/**
 * Solve the orbital elements implied by a body's state vector around a central
 * gravitational parameter `mu`. Returns null for degenerate states (zero
 * angular momentum — a purely radial fall — which has no drawable orbit).
 */
export function orbitalElements(pos: Vec3, vel: Vec3, mu: number): OrbitalElements | null {
  const r = norm(pos);
  if (!(r > 1e-9) || !(mu > 0)) {
    return null;
  }
  const h = cross(pos, vel);
  const hMag = norm(h);
  // Radial (zero-angular-momentum) trajectory: the "orbit" is a degenerate line
  // straight through the star, with no drawable conic. The test is RELATIVE to
  // |r||v|, so it means "position and velocity are collinear" at any scale — an
  // absolute epsilon would accept a slow, distant body whose |h| is small merely
  // because of the units and draw a straight line running through the star.
  if (!(hMag > 1e-6 * r * norm(vel))) {
    return null;
  }

  const v2 = dot(vel, vel);
  const rv = dot(pos, vel);
  // Eccentricity vector: ((v² − μ/r)·r − (r·v)·v) / μ
  const eVec: Vec3 = [
    ((v2 - mu / r) * pos[0] - rv * vel[0]) / mu,
    ((v2 - mu / r) * pos[1] - rv * vel[1]) / mu,
    ((v2 - mu / r) * pos[2] - rv * vel[2]) / mu,
  ];
  const eccentricity = norm(eVec);
  const semiLatusRectum = (hMag * hMag) / mu;

  // Periapsis direction; for a (near-)circular orbit any in-plane direction
  // works, so fall back to the current radius vector.
  const periapsisDir = unit(eVec) ?? unit(pos);
  const normal = unit(h);
  if (periapsisDir === null || normal === null) {
    return null;
  }
  // Completes the right-handed in-plane basis (ŵ × p̂).
  const inPlaneDir = cross(normal, periapsisDir);

  return {
    eccentricity,
    semiLatusRectum,
    periapsisDir,
    inPlaneDir,
    bound: eccentricity < 1,
  };
}

/** Options for {@link orbitPathPoints}. */
export interface OrbitPathOptions {
  /** Number of sampled points along the path. Default 128. */
  segments?: number;
  /**
   * For UNBOUND orbits, how much of the open branch to draw, as a fraction of
   * the asymptotic true anomaly. Default 0.85 (keeps the arc finite).
   */
  hyperbolicSpan?: number;
  /** Clamp on any sampled radius, so unbound arcs stay in frame. Default 4000. */
  maxRadius?: number;
}

/**
 * Sample the orbit as a flat `[x,y,z, x,y,z, ...]` array of world-space points.
 *
 * A bound orbit yields a closed ellipse (first point repeated at the end);
 * an unbound orbit yields a finite arc of its hyperbolic branch. Returns an
 * empty array when the state has no drawable orbit.
 */
export function orbitPathPoints(
  pos: Vec3,
  vel: Vec3,
  mu: number,
  options: OrbitPathOptions = {},
): Float32Array {
  const elements = orbitalElements(pos, vel, mu);
  if (elements === null) {
    return new Float32Array(0);
  }
  const segments = Math.max(8, Math.floor(options.segments ?? 128));
  const maxRadius = options.maxRadius ?? 4000;
  const { eccentricity: e, semiLatusRectum: p, periapsisDir: P, inPlaneDir: Q } = elements;

  // A near-radial orbit (periapsis essentially at the star) samples as a line
  // running from the star out to the radius clamp and back — visually a straight
  // streak through the star rather than an orbit. Such a trajectory is a plunge,
  // not an orbit, so draw nothing.
  const periapsis = p / (1 + e);
  if (!(periapsis > 1e-3 * norm(pos))) {
    return new Float32Array(0);
  }

  // True-anomaly range: a full turn when bound, otherwise a bounded arc of the
  // open branch (the conic diverges at ν → ±arccos(−1/e)).
  let start: number;
  let end: number;
  if (elements.bound) {
    start = 0;
    end = Math.PI * 2;
  } else {
    const span = Math.min(Math.max(options.hyperbolicSpan ?? 0.85, 0.05), 0.98);
    // e ≥ 1 ⇒ −1/e ∈ [−1, 0), so acos is always defined here.
    const limit = Math.acos(Math.max(-1, -1 / Math.max(e, 1.0000001))) * span;
    start = -limit;
    end = limit;
  }

  const count = segments + 1;
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const nu = start + ((end - start) * i) / segments;
    const denom = 1 + e * Math.cos(nu);
    // Guard the asymptote; clamp instead of emitting an infinite point.
    const radius = denom > 1e-6 ? Math.min(p / denom, maxRadius) : maxRadius;
    const c = Math.cos(nu) * radius;
    const s = Math.sin(nu) * radius;
    out[i * 3] = P[0] * c + Q[0] * s;
    out[i * 3 + 1] = P[1] * c + Q[1] * s;
    out[i * 3 + 2] = P[2] * c + Q[2] * s;
  }
  return out;
}
