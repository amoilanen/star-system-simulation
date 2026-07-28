// Cloud → star mass budget (PRD A1: illustrative, but correctly ordered).
//
// A collapsing molecular-cloud core does NOT turn into a star of the same mass.
// Outflows, radiation pressure and the residual disc carry most of it away, so
// the "star formation efficiency" (SFE) of a core is observed to be roughly a
// third — and it DROPS for the most massive cores, whose fierce radiation field
// unbinds their own envelope long before it can fall in.
//
// This module is the single source of truth for that budget. Everything stellar
// (effective temperature, radius, lifetime, death path, the mass shown in the
// labels) is derived from {@link stellarMassFromCloud}, never from the raw cloud
// mass the user dialled in — otherwise a 40 M☉ cloud would produce a 40 M☉ star,
// which is exactly the unphysical behaviour this replaces.
//
// Pure and dependency-free so the whole budget is unit-testable.

/** Clamp a value into the inclusive `[min, max]` range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Tunable, auditable constants of the cloud → star mass budget. */
export const STAR_FORMATION = {
  /** Star formation efficiency of a 1 M☉ core (fraction reaching the star). */
  baseEfficiency: 0.34,
  /**
   * How the efficiency falls with cloud mass: eff ∝ M^(-massEfficiencyExponent).
   * Massive cores blow their envelopes apart, so they keep proportionally less.
   */
  massEfficiencyExponent: 0.08,
  /** Hard bounds on the efficiency, so no cloud keeps everything (or nothing). */
  minEfficiency: 0.16,
  maxEfficiency: 0.42,
  /**
   * Extra retention for metal-poor gas: low metallicity means weaker line-driven
   * winds, so more of the cloud actually reaches (and stays on) the star. Solar
   * metallicity is the reference (factor 1).
   */
  solarMetallicity: 0.02,
  metallicityEfficiencyCoefficient: 1.2,
} as const;

/**
 * Fraction of a cloud of `cloudMass` M☉ that ends up in the star. Falls slowly
 * with mass (radiative feedback) and with metallicity (line-driven winds), and
 * is bounded so the outcome is always a sane fraction. Pure.
 */
export function starFormationEfficiency(cloudMass: number, metals = 0.02): number {
  const m = Math.max(cloudMass, 1e-3);
  const { baseEfficiency, massEfficiencyExponent, minEfficiency, maxEfficiency } = STAR_FORMATION;
  const { solarMetallicity, metallicityEfficiencyCoefficient } = STAR_FORMATION;
  const metalExcess = Math.max(0, metals) - solarMetallicity;
  const metalFactor = clamp(1 - metallicityEfficiencyCoefficient * metalExcess, 0.7, 1.15);
  const raw = baseEfficiency * Math.pow(m, -massEfficiencyExponent) * metalFactor;
  return clamp(raw, minEfficiency, maxEfficiency);
}

/**
 * Mass (M☉) of the star that a cloud of `cloudMass` M☉ actually assembles. The
 * rest of the cloud ends up in the disc, in planets, or is blown back into the
 * interstellar medium. Pure and monotonically increasing in `cloudMass`.
 */
export function stellarMassFromCloud(cloudMass: number, metals = 0.02): number {
  const m = Math.max(cloudMass, 0);
  return m * starFormationEfficiency(m, metals);
}

/**
 * Cloud mass (M☉) needed to assemble a star of `stellarMass` M☉ — the inverse of
 * {@link stellarMassFromCloud}, used by the presets so that e.g. the "Sun-like"
 * preset really does produce a ~1 M☉ star. Solved by fixed-point iteration
 * because the efficiency itself depends on the cloud mass. Pure.
 */
export function cloudMassForStar(stellarMass: number, metals = 0.02): number {
  const target = Math.max(stellarMass, 0);
  if (target === 0) {
    return 0;
  }
  let cloud = target / STAR_FORMATION.baseEfficiency;
  for (let i = 0; i < 24; i += 1) {
    cloud = target / starFormationEfficiency(cloud, metals);
  }
  return cloud;
}
