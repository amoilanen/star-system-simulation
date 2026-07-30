import { describe, it, expect } from 'vitest';
import type { Vec3 } from '../../src/sim/PhysicsKernel';
import {
  damp,
  dampVec3,
  distanceSquared,
  followStep,
  frameDistance,
  KEEP_OUT_MARGIN,
  nearPlaneFor,
  pushOutOfKeepOut,
} from '../../src/render/cameraMath';

describe('frameDistance', () => {
  it('scales linearly with body radius', () => {
    const d1 = frameDistance(1, 50);
    const d2 = frameDistance(2, 50);
    expect(d2).toBeCloseTo(d1 * 2, 6);
  });

  it('places the camera farther for a narrower field of view', () => {
    const wide = frameDistance(1, 90);
    const narrow = frameDistance(1, 20);
    expect(narrow).toBeGreaterThan(wide);
  });

  it('geometrically frames the sphere at the requested margin', () => {
    const fov = 60;
    const radius = 3;
    const margin = 1.6;
    const dist = frameDistance(radius, fov, margin);
    // The half-angle subtended by the sphere at `dist` before the margin.
    const expected = (radius / Math.tan((fov * Math.PI) / 180 / 2)) * margin;
    expect(dist).toBeCloseTo(expected, 6);
  });

  it('never returns a non-positive distance for a zero radius', () => {
    expect(frameDistance(0, 50)).toBeGreaterThan(0);
  });
});

describe('damp', () => {
  it('does not move when dt is zero', () => {
    expect(damp(5, 10, 4, 0)).toBe(5);
  });

  it('moves toward the target and converges as dt grows', () => {
    const mid = damp(0, 10, 4, 0.25);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(10);
    expect(damp(0, 10, 4, 100)).toBeCloseTo(10, 5);
  });

  it('is monotonic toward the target across increasing dt', () => {
    const a = damp(0, 10, 4, 0.1);
    const b = damp(0, 10, 4, 0.2);
    expect(b).toBeGreaterThan(a);
  });
});

describe('dampVec3', () => {
  it('damps each component independently', () => {
    const out = dampVec3([0, 0, 0], [10, -10, 5], 4, 100);
    expect(out[0]).toBeCloseTo(10, 4);
    expect(out[1]).toBeCloseTo(-10, 4);
    expect(out[2]).toBeCloseTo(5, 4);
  });
});

describe('distanceSquared', () => {
  it('computes squared euclidean distance', () => {
    expect(distanceSquared([0, 0, 0], [3, 4, 0])).toBe(25);
  });
});

describe('followStep', () => {
  const DT = 1 / 60; // one 60 fps frame
  const LAMBDA = 4;

  it('has zero steady-state error when target is already on the body', () => {
    // Camera target is at the body; body moves 100 AU per frame (extreme speed).
    // The feed-forward term alone should keep target exactly on the body.
    const prevBodyPos = [0, 0, 0] as [number, number, number];
    const bodyPos = [100, 0, 0] as [number, number, number];
    const prevTarget = [0, 0, 0] as [number, number, number]; // already on body

    const result = followStep(prevTarget, bodyPos, prevBodyPos, LAMBDA, DT);

    // carried = [0] + ([100] − [0]) = [100] = bodyPos → residual is 0 → exactly on body.
    expect(result[0]).toBeCloseTo(100, 6);
    expect(result[1]).toBeCloseTo(0, 6);
    expect(result[2]).toBeCloseTo(0, 6);
  });

  it('converges an initial offset toward the body over several frames (body stationary)', () => {
    // Camera target starts 10 AU behind a stationary body.
    let target = [0, 0, 0] as [number, number, number];
    const bodyPos = [10, 0, 0] as [number, number, number];
    const prevBodyPos = [10, 0, 0] as [number, number, number]; // no movement

    // After enough frames the residual damping must close the gap.
    for (let i = 0; i < 200; i++) {
      target = followStep(target, bodyPos, prevBodyPos, LAMBDA, DT);
    }
    expect(target[0]).toBeCloseTo(10, 3);
  });

  it('steady-state error is zero for arbitrary speed over many frames', () => {
    // Simulate 200 frames of a body moving at 50 AU/frame starting with the
    // camera already on the body (steady state from frame 0).
    const SPEED = 50; // AU per frame
    let target = [0, 0, 0] as [number, number, number];
    let prevBodyPos = [0, 0, 0] as [number, number, number];

    for (let i = 0; i < 200; i++) {
      const bodyPos: [number, number, number] = [
        prevBodyPos[0] + SPEED,
        prevBodyPos[1],
        prevBodyPos[2],
      ];
      target = followStep(target, bodyPos, prevBodyPos, LAMBDA, DT);
      prevBodyPos = bodyPos;
    }

    // In steady state, target should equal the body position exactly.
    expect(target[0]).toBeCloseTo(prevBodyPos[0], 4);
  });

  it('combines feed-forward and residual damping: offset closes while body moves fast', () => {
    // Camera target starts 5 AU behind a body that is also moving at 10 AU/frame.
    const SPEED = 10;
    let target = [0, 0, 0] as [number, number, number]; // 5 AU behind
    let prevBodyPos = [5, 0, 0] as [number, number, number];

    for (let i = 0; i < 500; i++) {
      const bodyPos: [number, number, number] = [prevBodyPos[0] + SPEED, 0, 0];
      target = followStep(target, bodyPos, prevBodyPos, LAMBDA, DT);
      prevBodyPos = bodyPos;
    }

    // Residual offset must have converged to zero; target equals body pos.
    expect(target[0]).toBeCloseTo(prevBodyPos[0], 3);
  });

  it('returns zero delta when prevBodyPos equals bodyPos and target is on body', () => {
    // Completely static — no movement, no offset.
    const pos = [3, -7, 2] as [number, number, number];
    const result = followStep(pos, pos, pos, LAMBDA, DT);
    expect(result[0]).toBeCloseTo(3, 8);
    expect(result[1]).toBeCloseTo(-7, 8);
    expect(result[2]).toBeCloseTo(2, 8);
  });
});

describe('nearPlaneFor', () => {
  it('keeps the default near plane when the camera frames the whole system', () => {
    // Far away: nothing needs a closer plane, so the original 0.02 AU stands.
    expect(nearPlaneFor(60)).toBe(0.02);
    expect(nearPlaneFor(2)).toBe(0.02);
  });

  it('shrinks with the viewing distance so a framed body is never clipped', () => {
    // Flying up to a true-scale rocky world (radius 4.26e-5 AU) puts the camera
    // ~5e-4 AU away — 40× closer than the fixed 0.02 AU plane used to allow.
    const distance = 5e-4;
    const near = nearPlaneFor(distance);
    expect(near).toBeLessThan(distance);
    // The body's near face sits at distance − radius; the plane must clear it.
    expect(near).toBeLessThan(distance - 4.26e-5);
  });

  it('never returns a plane at or beyond the viewing distance', () => {
    for (const d of [1e-5, 1e-4, 5e-4, 1e-3, 0.01, 0.1, 1, 10, 1000]) {
      expect(nearPlaneFor(d)).toBeLessThan(d);
      expect(nearPlaneFor(d)).toBeGreaterThan(0);
    }
  });

  it('floors the plane so the far/near ratio cannot blow up', () => {
    expect(nearPlaneFor(1e-12)).toBe(1e-6);
  });

  it('falls back to the default for degenerate distances', () => {
    expect(nearPlaneFor(0)).toBe(0.02);
    expect(nearPlaneFor(-1)).toBe(0.02);
    expect(nearPlaneFor(Number.NaN)).toBe(0.02);
  });
});

describe('pushOutOfKeepOut (bug 6 — the camera must never end up inside the star)', () => {
  const ORIGIN: Vec3 = [0, 0, 0];

  it('pushes a camera inside the keep-out sphere out to the margin', () => {
    // Focused on a 1 M☉ main-sequence star the camera sits ~0.02 AU out; by the
    // red giant the photosphere is 1.16 AU and it would be deep inside the star.
    const out = pushOutOfKeepOut([0, 0, 0.02], ORIGIN, 1.16);
    expect(Math.hypot(out[0], out[1], out[2])).toBeCloseTo(1.16 * KEEP_OUT_MARGIN, 10);
    // Pushed RADIALLY: the viewing direction from the star is unchanged.
    expect(out[0]).toBe(0);
    expect(out[1]).toBe(0);
    expect(out[2]).toBeGreaterThan(0);
  });

  it('never pulls a camera in — the user keeps any zoom they already have', () => {
    for (const distance of [1e-3, 0.02, 1, 1.86, 5, 63, 5000]) {
      for (const radius of [0, 4.3e-5, 0.00465, 1.16, 1.63, 17.5]) {
        const before: Vec3 = [distance * 0.6, distance * 0.8, 0];
        const after = pushOutOfKeepOut(before, ORIGIN, radius);
        const d0 = Math.hypot(before[0], before[1], before[2]);
        const d1 = Math.hypot(after[0], after[1], after[2]);
        expect(d1, `d ${distance} r ${radius}`).toBeGreaterThanOrEqual(d0 - 1e-12);
        // Either untouched, or exactly at the keep-out margin.
        if (d1 > d0 + 1e-12) {
          expect(d1).toBeCloseTo(radius * KEEP_OUT_MARGIN, 10);
        } else {
          expect(after).toBe(before);
        }
      }
    }
  });

  it('always leaves the camera outside the drawn photosphere with headroom', () => {
    for (const radius of [1e-5, 0.05, 1.16, 10, 17.5]) {
      const out = pushOutOfKeepOut([0, 0, radius * 0.1], ORIGIN, radius);
      expect(Math.hypot(out[0], out[1], out[2])).toBeGreaterThan(radius);
    }
    expect(KEEP_OUT_MARGIN).toBeGreaterThan(1);
  });

  it('handles a camera exactly at the star centre by picking a direction', () => {
    const out = pushOutOfKeepOut([0, 0, 0], ORIGIN, 2);
    expect(Math.hypot(out[0], out[1], out[2])).toBeCloseTo(2 * KEEP_OUT_MARGIN, 10);
    expect(Number.isFinite(out[0] + out[1] + out[2])).toBe(true);
  });

  it('respects a keep-out sphere that is not at the origin', () => {
    const center: Vec3 = [10, -4, 3];
    const out = pushOutOfKeepOut([10.1, -4, 3], center, 1);
    expect(Math.hypot(out[0] - center[0], out[1] - center[1], out[2] - center[2])).toBeCloseTo(
      KEEP_OUT_MARGIN,
      10,
    );
  });

  it('disables itself for a non-positive or non-finite radius', () => {
    const pos: Vec3 = [0, 0, 1e-4];
    for (const radius of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(pushOutOfKeepOut(pos, ORIGIN, radius)).toBe(pos);
    }
  });

  it('accepts a custom margin but never one below 1 (which would pull the camera in)', () => {
    expect(Math.hypot(...pushOutOfKeepOut([0, 0, 0.1], ORIGIN, 1, 3))).toBeCloseTo(3, 10);
    // A margin under 1 is clamped to 1: the camera is placed ON the surface, not inside it.
    expect(Math.hypot(...pushOutOfKeepOut([0, 0, 0.1], ORIGIN, 1, 0.2))).toBeCloseTo(1, 10);
  });
});
