// Pure body-visual math (spec §3.2, FR-6/FR-7). No Three.js dependency so the
// comet-tail orientation and spin accumulation are unit-testable. BodyRenderer
// applies these results to instanced meshes.

import type { Vec3 } from '../sim/PhysicsKernel';

/** Euclidean length of a vector. */
function length(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

/**
 * Unit direction a comet tail should point: radially AWAY from the star, i.e.
 * the normalized vector from the star to the comet (solar-wind/radiation push,
 * FR-7). Returns a stable fallback `[1,0,0]` when the comet sits exactly on the
 * star. Pure; exported for unit testing.
 */
export function tailDirectionAwayFromStar(bodyPos: Vec3, starPos: Vec3): Vec3 {
  const dx = bodyPos[0] - starPos[0];
  const dy = bodyPos[1] - starPos[1];
  const dz = bodyPos[2] - starPos[2];
  const len = Math.hypot(dx, dy, dz);
  if (len <= 1e-9) {
    return [1, 0, 0];
  }
  return [dx / len, dy / len, dz / len];
}

/**
 * Tail length scaled by proximity to the star: closer comets grow longer,
 * brighter tails (radiation pressure rises as 1/r²-ish). Clamped to a sane
 * visual range. Pure.
 */
export function tailLength(bodyPos: Vec3, starPos: Vec3, maxLength: number): number {
  const r = length([bodyPos[0] - starPos[0], bodyPos[1] - starPos[1], bodyPos[2] - starPos[2]]);
  const near = 1 / (1 + r * 0.15);
  return Math.max(0, Math.min(maxLength, maxLength * near));
}

/**
 * Accumulate an axial spin angle (radians) for a body spinning at `spinRate`
 * over elapsed `dt`, wrapped into `[0, 2π)` to avoid unbounded growth (FR-6).
 * Pure.
 */
export function advanceSpin(currentAngle: number, spinRate: number, dt: number): number {
  const next = currentAngle + spinRate * dt;
  const twoPi = Math.PI * 2;
  const wrapped = next % twoPi;
  return wrapped < 0 ? wrapped + twoPi : wrapped;
}
