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
  const safeRadius = Math.max(radius, 1e-5);
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

/**
 * Largest near-clip plane that still keeps everything in front of a camera
 * orbiting `distance` away from its focus target visible.
 *
 * Bodies are drawn at TRUE scale (spec §3.2), so framing an Earth-sized world
 * (radius 4.26e-5 AU) puts the camera ~5e-4 AU away — a hundred times closer
 * than the fixed 0.02 AU near plane the scene used to carry, which clipped the
 * focused body away entirely and left a black screen. The near plane therefore
 * has to track the viewing distance.
 *
 * `distance / 100` sits comfortably inside any framed body (framing distance is
 * ≥ ~4 radii, so the body's near face is at ≥ 0.75·distance) while staying as
 * large as possible for depth precision. Clamped to `max` (the original value,
 * used whenever the camera is far enough away that nothing needs a closer
 * plane) and floored at `min` so the far/near ratio can never blow up. Pure.
 */
export function nearPlaneFor(distance: number, min = 1e-6, max = 0.02): number {
  if (!Number.isFinite(distance) || distance <= 0) {
    return max;
  }
  return clamp(distance * 0.01, Math.min(min, max), max);
}

/**
 * Multiple of the keep-out radius the camera is pushed to when it has to be
 * moved — enough headroom that the swelling star's surface (and the corona rim
 * that hugs it) is in front of the lens rather than around it.
 */
export const KEEP_OUT_MARGIN = 1.6;

/**
 * Furthest the orbit camera can ever pull back from its focus target (scene
 * units, i.e. AU). The zoom clamp in `CameraController`.
 */
export const MAX_CAMERA_DISTANCE = 5000;

/**
 * World radius that encloses everything the camera can ever frame: the furthest
 * it can pull back, plus the view half-extent at that distance (the field of
 * view is well under 90°, so that half-extent is smaller than the distance
 * itself — one extra factor of the distance is a generous bound).
 *
 * Used as the draw extent for orbit paths: a path cut off HERE is always cut
 * outside the frame, so a hyperbolic fly-by runs off the edge of the view at any
 * zoom instead of bending into a circular arc around a nearby clamp radius
 * (reported bug 5, the "orbits cut into sectors").
 */
export const MAX_VIEW_RADIUS = MAX_CAMERA_DISTANCE * 2;

/**
 * Push a camera at `position` OUT of a keep-out sphere of `keepOutRadius`
 * centred on `center`, radially away from that centre.
 *
 * The star is not a kernel body, so nothing used to stop it from swelling over a
 * camera that was already parked next to it: focusing on a 1 M☉ main-sequence
 * star puts the camera ~0.02 AU from the origin, and by the red giant the
 * photosphere is 1.16 AU — the camera is INSIDE the star and its additive
 * corona, i.e. the whole screen is glow (reported bug 6). There is an equivalent
 * guard for followed BODIES; this is the one for the star.
 *
 * Only ever pushes OUTWARD: a camera already clear of the sphere is returned
 * untouched, so the user's zoom is never taken away from them, only given back.
 * A camera exactly at the centre is pushed along +Z (any direction will do).
 * Pure; exported for unit testing.
 */
export function pushOutOfKeepOut(
  position: Vec3,
  center: Vec3,
  keepOutRadius: number,
  margin = KEEP_OUT_MARGIN,
): Vec3 {
  if (!Number.isFinite(keepOutRadius) || keepOutRadius <= 0) {
    return position;
  }
  const minimum = keepOutRadius * Math.max(margin, 1);
  const dx = position[0] - center[0];
  const dy = position[1] - center[1];
  const dz = position[2] - center[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (distance >= minimum) {
    return position;
  }
  if (distance < 1e-12) {
    return [center[0], center[1], center[2] + minimum];
  }
  const k = minimum / distance;
  return [center[0] + dx * k, center[1] + dy * k, center[2] + dz * k];
}

/** Squared Euclidean distance between two points. */
export function distanceSquared(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Feed-forward follow step (spec §3.6).
 *
 * Eliminates steady-state camera lag at any body speed by decomposing
 * follow into two parts:
 *
 *   1. **Feed-forward**: translate the previous camera target by the body's
 *      full per-frame delta (`bodyPos − prevBodyPos`).  This alone keeps
 *      the camera exactly on top of the body regardless of how fast it moves.
 *   2. **Residual damping**: exponentially damp the remaining gap between
 *      the carried position and the body.  This converges any initial
 *      focus-transition offset but contributes zero steady-state error once
 *      the camera has caught up.
 *
 * Property: when `prevTarget === prevBodyPos` (steady state), the result
 * equals `bodyPos` exactly for every `dt > 0` and any body speed.
 *
 * @param prevTarget   Camera focus target from the previous frame.
 * @param bodyPos      Current body world position.
 * @param prevBodyPos  Body world position from the previous frame.
 * @param lambda       Residual-damping rate (larger = snappier catch-up).
 * @param dt           Real elapsed time since last frame (seconds).
 * @returns            New camera focus target for this frame.
 */
export function followStep(
  prevTarget: Vec3,
  bodyPos: Vec3,
  prevBodyPos: Vec3,
  lambda: number,
  dt: number,
): Vec3 {
  // Step 1: carry the target by the body's exact delta (zero steady-state lag).
  const carried: Vec3 = [
    prevTarget[0] + (bodyPos[0] - prevBodyPos[0]),
    prevTarget[1] + (bodyPos[1] - prevBodyPos[1]),
    prevTarget[2] + (bodyPos[2] - prevBodyPos[2]),
  ];
  // Step 2: damp the residual from carried toward bodyPos (initial-offset convergence).
  return dampVec3(carried, bodyPos, lambda, dt);
}
