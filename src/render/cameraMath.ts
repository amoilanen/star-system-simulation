// Pure camera framing/follow math (spec §3.6, FR-8). No Three.js dependency so
// the focus-distance and smooth-follow logic can be unit-tested directly. The
// Three.js `CameraController` consumes these results to position the camera.

import type { Vec3 } from '../sim/PhysicsKernel';

/** Clamp a value into the inclusive `[min, max]` range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Distance a perspective camera must sit from a sphere of the given `radius` so
 * it is fully framed within the vertical field of view, with a `margin` (>1)
 * leaving headroom around the body. Pure; exported for unit testing (FR-8).
 */
export function frameDistance(radius: number, fovDegrees: number, margin = 1.6): number {
  const safeRadius = Math.max(radius, 1e-4);
  const halfFov = (clamp(fovDegrees, 1, 179) * Math.PI) / 180 / 2;
  const tan = Math.tan(halfFov);
  const distance = tan > 1e-6 ? safeRadius / tan : safeRadius;
  return distance * Math.max(margin, 1);
}

/**
 * Frame-rate-independent exponential smoothing toward a target, used for the
 * camera's smooth center/follow (FR-8). `lambda` is the decay rate (larger =
 * snappier); with `dt → ∞` the result reaches `target`, with `dt = 0` it stays
 * at `current`. Pure.
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  if (!Number.isFinite(dt) || dt <= 0) {
    return current;
  }
  const t = 1 - Math.exp(-Math.max(0, lambda) * dt);
  return current + (target - current) * t;
}

/** Component-wise {@link damp} for a 3-vector (camera focus target follow). */
export function dampVec3(current: Vec3, target: Vec3, lambda: number, dt: number): Vec3 {
  return [
    damp(current[0], target[0], lambda, dt),
    damp(current[1], target[1], lambda, dt),
    damp(current[2], target[2], lambda, dt),
  ];
}

/** Squared Euclidean distance between two points. */
export function distanceSquared(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}
