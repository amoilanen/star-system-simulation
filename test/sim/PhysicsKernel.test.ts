import { describe, it, expect } from 'vitest';
import {
  BODY_OFFSET,
  BODY_STRIDE,
  BodyType,
  PARTICLE_OFFSET,
  PARTICLE_STRIDE,
} from '../../src/sim/PhysicsKernel';

/** All lane offsets in a layout must be unique and fit within the stride. */
function assertValidLayout(offsets: Record<string, number>, stride: number): void {
  const values = Object.values(offsets);
  expect(values).toHaveLength(stride);
  expect(new Set(values).size).toBe(values.length);
  for (const v of values) {
    expect(Number.isInteger(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(stride);
  }
}

describe('particle buffer layout', () => {
  it('has a stride matching the number of fields', () => {
    expect(PARTICLE_STRIDE).toBe(7);
  });

  it('has unique, in-range field offsets', () => {
    assertValidLayout(PARTICLE_OFFSET, PARTICLE_STRIDE);
  });
});

describe('body buffer layout', () => {
  it('has a stride matching the number of fields', () => {
    expect(BODY_STRIDE).toBe(12);
  });

  it('has unique, in-range field offsets', () => {
    assertValidLayout(BODY_OFFSET, BODY_STRIDE);
  });
});

describe('BodyType', () => {
  it('enumerates the four supported body kinds', () => {
    expect(BodyType.Protoplanet).toBe(0);
    expect(BodyType.Planet).toBe(1);
    expect(BodyType.Comet).toBe(2);
    expect(BodyType.Asteroid).toBe(3);
  });
});
