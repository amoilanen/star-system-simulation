import { describe, expect, it } from 'vitest';
import { formatYears, SECONDS_PER_YEAR, simSecondsToYears } from '../../src/sim/timeFormat';
import { i18n } from '../../src/i18n/i18n';

const en = (years: number): string => formatYears(years, i18n, 'en');

describe('simSecondsToYears', () => {
  it('converts sim seconds to years by the year length', () => {
    expect(simSecondsToYears(SECONDS_PER_YEAR)).toBeCloseTo(1, 9);
    expect(simSecondsToYears(SECONDS_PER_YEAR * 1000)).toBeCloseTo(1000, 6);
    expect(simSecondsToYears(0)).toBe(0);
  });
});

describe('formatYears (en)', () => {
  it('formats plain year counts with grouping and pluralization', () => {
    expect(en(0)).toBe('0 years');
    expect(en(1)).toBe('1 year');
    expect(en(999)).toBe('999 years');
    expect(en(1000)).toBe('1,000 years');
    expect(en(12_000)).toBe('12,000 years');
    expect(en(999_999)).toBe('999,999 years');
  });

  it('scales into million / billion / trillion words', () => {
    expect(en(1_000_000)).toBe('1 million years');
    expect(en(1_200_000)).toBe('1.2 million years');
    expect(en(1_200_000_000)).toBe('1.2 billion years');
    expect(en(13_800_000_000)).toBe('13.8 billion years');
    expect(en(2_000_000_000_000)).toBe('2 trillion years');
  });

  it('renders positive sub-year values as "< 1 year"', () => {
    expect(en(0.00001)).toBe('< 1 year');
  });
});

describe('formatYears (fi)', () => {
  const fi = (years: number): string => formatYears(years, i18n, 'fi');

  it('localizes the unit and scale words', () => {
    expect(fi(1)).toContain('vuosi');
    expect(fi(1000)).toContain('vuotta');
    expect(fi(1_200_000_000)).toContain('miljardia');
    expect(fi(1_200_000_000)).toContain('vuotta');
    expect(fi(2_000_000)).toContain('miljoonaa');
  });
});
