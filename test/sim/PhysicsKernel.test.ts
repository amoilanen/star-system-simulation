import { describe, it, expect } from 'vitest';
import {
  ATTRACTOR_OFFSET,
  ATTRACTOR_STRIDE,
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

describe('attractor buffer layout', () => {
  it('has a stride matching the number of fields', () => {
    // `[x, y, z, mu]` per gravitating centre. The Rust `ATTRACTOR_STRIDE` must
    // match this exactly — it is the same memory.
    expect(ATTRACTOR_STRIDE).toBe(4);
  });

  it('has unique, in-range field offsets', () => {
    assertValidLayout(ATTRACTOR_OFFSET, ATTRACTOR_STRIDE);
  });
});

describe('BodyType', () => {
  it('enumerates the supported body kinds with append-only numeric values', () => {
    // The numeric value crosses the WASM boundary in the body buffer's `type`
    // lane and in body events, so the original four MUST keep their meaning;
    // the self-luminous kinds (spec §4.2) are appended after them.
    expect(BodyType.Protoplanet).toBe(0);
    expect(BodyType.Planet).toBe(1);
    expect(BodyType.Comet).toBe(2);
    expect(BodyType.Asteroid).toBe(3);
    expect(BodyType.BrownDwarf).toBe(4);
    expect(BodyType.Star).toBe(5);
  });
});
