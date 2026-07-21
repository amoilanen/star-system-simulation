import { describe, it, expect } from 'vitest';
import {
  isValidComposition,
  normalizeComposition,
  COMPOSITION_SUM_TOLERANCE,
} from '../../src/config/SimulationConfig';

describe('CloudComposition validation & normalization', () => {
  it('accepts fractions that already sum to 1', () => {
    expect(isValidComposition({ hydrogen: 0.74, helium: 0.24, metals: 0.02 })).toBe(true);
  });

  it('rejects fractions that do not sum to 1 beyond tolerance', () => {
    expect(isValidComposition({ hydrogen: 0.5, helium: 0.24, metals: 0.02 })).toBe(false);
  });

  it('rejects negative or non-finite fractions', () => {
    expect(isValidComposition({ hydrogen: -0.1, helium: 0.9, metals: 0.2 })).toBe(false);
    expect(isValidComposition({ hydrogen: Number.NaN, helium: 0.5, metals: 0.5 })).toBe(false);
  });

  it('normalizes arbitrary positive fractions to sum to 1', () => {
    const normalized = normalizeComposition({ hydrogen: 74, helium: 24, metals: 2 });
    const sum = normalized.hydrogen + normalized.helium + normalized.metals;
    expect(Math.abs(sum - 1)).toBeLessThanOrEqual(COMPOSITION_SUM_TOLERANCE);
    expect(normalized.hydrogen).toBeCloseTo(0.74, 10);
    expect(normalized.metals).toBeCloseTo(0.02, 10);
  });

  it('preserves relative proportions when normalizing', () => {
    const normalized = normalizeComposition({ hydrogen: 3, helium: 1, metals: 0 });
    expect(normalized.hydrogen).toBeCloseTo(0.75, 10);
    expect(normalized.helium).toBeCloseTo(0.25, 10);
    expect(isValidComposition(normalized)).toBe(true);
  });

  it('throws on non-positive totals and invalid inputs', () => {
    expect(() => normalizeComposition({ hydrogen: 0, helium: 0, metals: 0 })).toThrow(RangeError);
    expect(() => normalizeComposition({ hydrogen: -1, helium: 1, metals: 1 })).toThrow(RangeError);
  });
});
