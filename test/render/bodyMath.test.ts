import { describe, it, expect } from 'vitest';
import { advanceSpin, tailDirectionAwayFromStar, tailLength } from '../../src/render/bodyMath';

describe('tailDirectionAwayFromStar', () => {
  it('points from the star toward the comet, normalized', () => {
    const dir = tailDirectionAwayFromStar([3, 0, 0], [0, 0, 0]);
    expect(dir[0]).toBeCloseTo(1, 6);
    expect(dir[1]).toBeCloseTo(0, 6);
    expect(dir[2]).toBeCloseTo(0, 6);
  });

  it('accounts for a non-origin star position', () => {
    const dir = tailDirectionAwayFromStar([0, 5, 0], [0, 2, 0]);
    expect(dir[0]).toBeCloseTo(0, 6);
    expect(dir[1]).toBeCloseTo(1, 6);
    expect(dir[2]).toBeCloseTo(0, 6);
  });

  it('returns a unit vector for arbitrary offsets', () => {
    const dir = tailDirectionAwayFromStar([1, 2, 2], [0, 0, 0]);
    const len = Math.hypot(dir[0], dir[1], dir[2]);
    expect(len).toBeCloseTo(1, 6);
  });

  it('falls back to a stable direction when comet sits on the star', () => {
    const dir = tailDirectionAwayFromStar([0, 0, 0], [0, 0, 0]);
    expect(dir).toEqual([1, 0, 0]);
  });
});

describe('tailLength', () => {
  it('grows as the comet nears the star', () => {
    const near = tailLength([1, 0, 0], [0, 0, 0], 10);
    const far = tailLength([50, 0, 0], [0, 0, 0], 10);
    expect(near).toBeGreaterThan(far);
    expect(near).toBeLessThanOrEqual(10);
  });
});

describe('advanceSpin', () => {
  it('accumulates the spin angle over time', () => {
    expect(advanceSpin(0, 2, 0.5)).toBeCloseTo(1, 6);
  });

  it('wraps into [0, 2π)', () => {
    const angle = advanceSpin(6.0, 2, 1); // 6 + 2 = 8 > 2π
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(Math.PI * 2);
    expect(angle).toBeCloseTo(8 - 2 * Math.PI, 6);
  });

  it('handles negative spin rates', () => {
    const angle = advanceSpin(0, -1, 1);
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(Math.PI * 2);
  });
});
