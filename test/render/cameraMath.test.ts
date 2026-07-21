import { describe, it, expect } from 'vitest';
import { damp, dampVec3, distanceSquared, frameDistance } from '../../src/render/cameraMath';

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
