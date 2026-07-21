// Configuration contracts (spec §4.1). These types are the authoritative,
// immutable shape produced by the setup form and consumed by the simulation
// core, renderer, and i18n layers. No rendering or side effects live here.

/**
 * Supported UI locales. Extensible union — the i18n catalog registry is the
 * runtime source of truth; adding a language means adding a catalog, not
 * widening every consumer (FR-2).
 */
export type Locale = 'en' | 'fi';

/**
 * Simplified, astrophysically meaningful cloud composition (PRD A2). The three
 * fractions are expected to sum to 1; use {@link normalizeComposition} to
 * enforce this before constructing a {@link SimulationConfig}.
 */
export interface CloudComposition {
  /** Hydrogen mass fraction, e.g. 0.74. */
  hydrogen: number;
  /** Helium mass fraction, e.g. 0.24. */
  helium: number;
  /** Heavier-elements ("metallicity") mass fraction, e.g. 0.02. */
  metals: number;
}

/**
 * Immutable simulation configuration produced by the setup form (spec §4.1).
 * Consumers must treat instances as read-only.
 */
export interface SimulationConfig {
  locale: Locale;
  composition: CloudComposition;
  /** Initial cloud mass, in solar masses (M☉). */
  mass: number;
  /** Initial cloud radius, in scene/AU units. */
  cloudExtent: number;
  /** Normalized 0..1 pace → mapped to simSecondsPerRealSecond by the Clock. */
  pace: number;
  /** FR-9 toggle: show localized annotations for lifecycle/body events. */
  showEventAnnotations: boolean;
  /** Optional originating preset id, e.g. 'sun-like' | 'low-mass' | 'high-mass'. */
  presetId?: string;
}

/** Tolerance used when checking that composition fractions sum to 1. */
export const COMPOSITION_SUM_TOLERANCE = 1e-6;

/**
 * Returns true when all fractions are finite, non-negative, and sum to 1
 * within {@link COMPOSITION_SUM_TOLERANCE}.
 */
export function isValidComposition(composition: CloudComposition): boolean {
  const { hydrogen, helium, metals } = composition;
  const parts = [hydrogen, helium, metals];
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) {
    return false;
  }
  const sum = hydrogen + helium + metals;
  return Math.abs(sum - 1) <= COMPOSITION_SUM_TOLERANCE;
}

/**
 * Normalizes composition fractions so they sum to exactly 1, preserving their
 * relative proportions. Throws if any fraction is negative/non-finite or if the
 * total is non-positive (nothing to normalize).
 */
export function normalizeComposition(composition: CloudComposition): CloudComposition {
  const { hydrogen, helium, metals } = composition;
  const parts = [hydrogen, helium, metals];
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) {
    throw new RangeError('CloudComposition fractions must be finite and non-negative.');
  }
  const sum = hydrogen + helium + metals;
  if (sum <= 0) {
    throw new RangeError('CloudComposition fractions must sum to a positive value.');
  }
  return {
    hydrogen: hydrogen / sum,
    helium: helium / sum,
    metals: metals / sum,
  };
}
