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
  BlackHole,
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
   * Effective final STELLAR mass (M☉) at/above which the star ends in a core-
   * collapse supernova. Below this it quietly forms a white dwarf. This is the
   * real Chandrasekhar-driven boundary of ~8 M☉ of stellar (NOT cloud) mass —
   * see `starFormation.ts` for the cloud → star conversion.
   */
  supernovaMinMass: 8,
  /**
   * Effective final mass (M☉) at/above which the resulting neutron star spins
   * rapidly enough to present as a pulsar. Below it (but above the supernova
   * threshold) it is a non-pulsing neutron star.
   */
  pulsarMinMass: 12,
  /**
   * Effective final mass (M☉) at/above which the collapsing core exceeds the
   * Tolman–Oppenheimer–Volkoff limit (~2.2 M☉ of neutron-degenerate matter) and
   * nothing can halt the collapse: a BLACK HOLE forms. Progenitors above roughly
   * 20–25 M☉ are the observed boundary.
   */
  blackHoleMinMass: 22,
  /**
   * Effective final mass (M☉) above which the star collapses DIRECTLY to a black
   * hole with no (or only a failed) supernova — the envelope is swallowed rather
   * than expelled. Observationally this is the "red supergiant disappearance"
   * channel above ~40 M☉.
   */
  directCollapseMinMass: 40,
  /** Reference (solar) metallicity; compositions above this shed more mass. */
  solarMetallicity: 0.02,
  /**
   * How strongly excess metallicity reduces the effective final mass via
   * stronger stellar winds. Illustrative coefficient (dimensionless).
   */
  metalsMassLossCoefficient: 1.5,
  /** Chandrasekhar limit (M☉): the heaviest possible white dwarf. */
  chandrasekharMass: 1.38,
  /** Tolman–Oppenheimer–Volkoff limit (M☉): the heaviest possible neutron star. */
  tovMass: 2.2,
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
 * Determine the death path from the star's mass + composition (FR-4). `mass` is
 * the STELLAR mass (see `starFormation.ts`), not the cloud mass the user dialled
 * in. Uses the centralized {@link FATE_THRESHOLDS}. Pure and deterministic.
 */
export function determineFate(mass: number, composition: CloudComposition): FateOutcome {
  const finalMass = effectiveFinalMass(mass, composition);
  const { supernovaMinMass, pulsarMinMass, blackHoleMinMass, directCollapseMinMass } =
    FATE_THRESHOLDS;

  if (finalMass < supernovaMinMass) {
    return { supernova: false, remnant: RemnantType.WhiteDwarf };
  }
  if (finalMass >= blackHoleMinMass) {
    // Above the direct-collapse mass the envelope is swallowed instead of being
    // expelled — the star simply winks out, leaving a black hole behind.
    return { supernova: finalMass < directCollapseMinMass, remnant: RemnantType.BlackHole };
  }
  if (finalMass >= pulsarMinMass) {
    return { supernova: true, remnant: RemnantType.Pulsar };
  }
  return { supernova: true, remnant: RemnantType.NeutronStar };
}

/**
 * Mass (M☉) of the compact object left behind by a star of `stellarMass`. Only a
 * fraction of the star survives its own death: a white dwarf keeps the ~0.6 M☉
 * core of a solar-type star (semi-empirical initial–final mass relation), a
 * neutron star is pinned between the Chandrasekhar and TOV limits, and even a
 * black hole only retains the fraction of the envelope that falls back.
 *
 * Pure; used both for the displayed remnant mass and for the orbital expansion
 * the surviving planets experience when the star sheds the rest.
 */
export function remnantMass(stellarMass: number, remnant: RemnantType): number {
  const m = Math.max(stellarMass, 0);
  const { chandrasekharMass, tovMass, directCollapseMinMass } = FATE_THRESHOLDS;
  switch (remnant) {
    case RemnantType.WhiteDwarf:
      // Initial–final mass relation: M_f ≈ 0.4 + 0.11 M_i (Kalirai et al.).
      return Math.min(chandrasekharMass, Math.max(0.15, 0.4 + 0.11 * m));
    case RemnantType.NeutronStar:
    case RemnantType.Pulsar:
      // Core mass grows only weakly with progenitor mass and is capped by TOV.
      return Math.min(tovMass, Math.max(chandrasekharMass, 1.15 + 0.03 * m));
    case RemnantType.BlackHole:
    default: {
      // Fall-back fraction rises toward direct collapse, where nearly the whole
      // (already wind-stripped) star is swallowed.
      const fallback = m >= directCollapseMinMass ? 0.75 : 0.35;
      return Math.max(tovMass * 1.5, m * fallback);
    }
  }
}

/** FateModel contract (spec §4.2), backed by the centralized thresholds. */
export interface FateModel {
  determineFate(mass: number, composition: CloudComposition): FateOutcome;
}

/** Default {@link FateModel} implementation used across the simulation. */
export const fateModel: FateModel = { determineFate };
