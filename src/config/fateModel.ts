// Stellar lifecycle & death-path model (spec §4.2, §7-D4, FR-4).
//
// This module is the SINGLE SOURCE OF TRUTH for how initial parameters map to a
// stellar remnant. All thresholds are centralized in FATE_THRESHOLDS so the
// educational outcome is auditable and adjustable without touching logic. The
// model is illustrative, not simulation-grade (PRD A1): it uses real qualitative
// ordering and plausible mass boundaries rather than solving stellar structure.

import type { CloudComposition } from './SimulationConfig';

/** Ordered stages of the stellar lifecycle (spec §4.2). */
export enum LifecycleStage {
  DustCloud,
  ProtostarCoalescence,
  FusionIgnition,
  MainSequence,
  RedGiant,
  Death,
  Remnant,
}

/** Terminal compact-object types this model produces (spec §4.2). */
export enum RemnantType {
  WhiteDwarf,
  NeutronStar,
  Pulsar,
}

/** Outcome of a fate determination. */
export interface FateOutcome {
  /** Whether the death is a supernova (true) or a quiet envelope shed (false). */
  supernova: boolean;
  /** The compact remnant left behind. */
  remnant: RemnantType;
}

/** Centralized, auditable thresholds driving FR-4. Single source of truth. */
export const FATE_THRESHOLDS = {
  /**
   * Effective final mass (M☉) at/above which the star ends in a core-collapse
   * supernova. Below this it quietly forms a white dwarf. Real Chandrasekhar-
   * driven boundary is ~8 M☉ of initial mass.
   */
  supernovaMinMass: 8,
  /**
   * Effective final mass (M☉) at/above which the resulting neutron star spins
   * rapidly enough to present as a pulsar. Below it (but above the supernova
   * threshold) it is a non-pulsing neutron star.
   */
  pulsarMinMass: 12,
  /** Reference (solar) metallicity; compositions above this shed more mass. */
  solarMetallicity: 0.02,
  /**
   * How strongly excess metallicity reduces the effective final mass via
   * stronger stellar winds. Illustrative coefficient (dimensionless).
   */
  metalsMassLossCoefficient: 1.5,
} as const;

/**
 * Effective final stellar mass after accounting for composition-driven mass
 * loss. Higher-than-solar metallicity drives stronger winds and reduces the
 * mass that reaches the death stage; lower metallicity slightly increases it.
 * Clamped to be non-negative.
 */
export function effectiveFinalMass(mass: number, composition: CloudComposition): number {
  const { metalsMassLossCoefficient, solarMetallicity } = FATE_THRESHOLDS;
  const metalExcess = composition.metals - solarMetallicity;
  const retained = 1 - metalsMassLossCoefficient * metalExcess;
  return Math.max(0, mass * retained);
}

/**
 * Determine the death path from initial mass + composition (FR-4). Uses the
 * centralized {@link FATE_THRESHOLDS}. Pure and deterministic.
 */
export function determineFate(mass: number, composition: CloudComposition): FateOutcome {
  const finalMass = effectiveFinalMass(mass, composition);
  const { supernovaMinMass, pulsarMinMass } = FATE_THRESHOLDS;

  if (finalMass < supernovaMinMass) {
    return { supernova: false, remnant: RemnantType.WhiteDwarf };
  }
  if (finalMass >= pulsarMinMass) {
    return { supernova: true, remnant: RemnantType.Pulsar };
  }
  return { supernova: true, remnant: RemnantType.NeutronStar };
}

/** FateModel contract (spec §4.2), backed by the centralized thresholds. */
export interface FateModel {
  determineFate(mass: number, composition: CloudComposition): FateOutcome;
}

/** Default {@link FateModel} implementation used across the simulation. */
export const fateModel: FateModel = { determineFate };
