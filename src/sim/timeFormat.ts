// Human-readable stellar-timescale formatting (HUD elapsed time + speed).
//
// Simulation time is tracked in astronomical seconds (see Clock —
// `DEFAULT_LIFECYCLE_SIM_SECONDS` is 13.8 Gyr expressed in seconds), so a year
// is a fixed number of sim seconds. These helpers turn a raw year count into a
// short localized label like "1 year", "1,000 years", "1 million years" or
// "1.2 billion years", scaling into word magnitudes and localizing the scale
// word + pluralized unit through the i18n catalog. Kept DOM-free for testing.

import type { Locale } from '../config/SimulationConfig';
import type { I18n } from '../i18n/i18n';

/** Seconds in one (Julian) year — matches the Clock's lifecycle calibration. */
export const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

/** Convert simulation seconds to a (possibly fractional) number of years. */
export function simSecondsToYears(simSeconds: number): number {
  return Number.isFinite(simSeconds) ? simSeconds / SECONDS_PER_YEAR : 0;
}

/** Word-magnitude breakpoints, largest first, mapped to an i18n scale-word id. */
const SCALES: ReadonlyArray<{ threshold: number; scaleId: string }> = [
  { threshold: 1e12, scaleId: 'time.scale.trillion' },
  { threshold: 1e9, scaleId: 'time.scale.billion' },
  { threshold: 1e6, scaleId: 'time.scale.million' },
];

/** Cache of Intl.NumberFormat by `${locale}:${maxFractionDigits}` (per-frame use). */
const numberFormatCache = new Map<string, Intl.NumberFormat>();

function numberFormat(locale: string, maxFractionDigits: number): Intl.NumberFormat {
  const key = `${locale}:${maxFractionDigits}`;
  let fmt = numberFormatCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits });
    numberFormatCache.set(key, fmt);
  }
  return fmt;
}

/**
 * Format a year count as a short localized label, e.g. `"1 year"`,
 * `"1,000 years"`, `"1 million years"`, `"1.2 billion years"`. Sub-year positive
 * values (only seen near real-time speed) render as a localized "< 1 year".
 */
export function formatYears(years: number, i18n: I18n, locale: Locale): string {
  const y = Number.isFinite(years) && years > 0 ? years : 0;

  const scale = SCALES.find((s) => y >= s.threshold);
  if (scale) {
    const value = y / scale.threshold;
    const numberText = numberFormat(locale, value < 100 ? 1 : 0).format(value);
    return i18n.translate(locale, 'time.scaled', {
      number: numberText,
      scale: i18n.translate(locale, scale.scaleId),
      unit: i18n.translate(locale, 'time.year', { count: 2 }),
    });
  }

  // Below one million: plain grouped integer with a pluralized unit.
  const rounded = Math.round(y);
  if (rounded === 0 && y > 0) {
    return i18n.translate(locale, 'time.lessThanOne', {
      unit: i18n.translate(locale, 'time.year', { count: 1 }),
    });
  }
  return i18n.translate(locale, 'time.plain', {
    number: numberFormat(locale, 0).format(rounded),
    unit: i18n.translate(locale, 'time.year', { count: rounded }),
  });
}
