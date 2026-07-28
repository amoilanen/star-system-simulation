// Lifecycle stage definitions & timing (spec §3.3, §4.2, FR-3, FR-4).
//
// The shared, kernel-agnostic description of how a star system progresses:
//
//   DustCloud → ProtostarCoalescence → FusionIgnition → MainSequence
//            → RedGiant → Death → Remnant
//
// This module owns the ORDERING, the per-stage entry events, the internal
// structure of the death, and the illustrative stage durations. It deliberately
// owns no state machine: both kernels drive the progression themselves, because
// only they know the accreted core mass that makes FORMATION physics-driven
// rather than timed (see `TsFallbackKernel.advanceStages` and its Rust twin).
// A sub-stellar object short-circuits this order entirely — a brown dwarf never
// ignites, so it goes straight from FusionIgnition to Remnant.
//
// Stage durations are illustrative, not simulation-grade (PRD A1): they use the
// real qualitative ordering (massive stars live fast and die young) rather than
// solving stellar structure. All timing knobs live in one place so they are
// auditable and adjustable.

import type { CloudComposition } from '../config/SimulationConfig';
import { LifecycleStage } from '../config/fateModel';
import { SimEventType } from './events';

/** One Julian year in seconds; the base unit for the illustrative durations. */
const YEAR_SECONDS = 365.25 * 24 * 3600;
/** One million years in seconds. */
const MYR_SECONDS = 1e6 * YEAR_SECONDS;

/**
 * Ordered stages the FSM walks through, from initial to terminal. Kept explicit
 * (rather than relying on enum arithmetic) so the progression is auditable.
 */
export const STAGE_ORDER: readonly LifecycleStage[] = [
  LifecycleStage.DustCloud,
  LifecycleStage.ProtostarCoalescence,
  LifecycleStage.FusionIgnition,
  LifecycleStage.MainSequence,
  LifecycleStage.RedGiant,
  LifecycleStage.Death,
  LifecycleStage.Remnant,
] as const;

/**
 * The event emitted when the FSM ENTERS each stage. `DustCloud` is the initial
 * stage and therefore has no entry event. Exactly one event corresponds to each
 * of the six transitions, satisfying FR-3's "one event per transition".
 */
export const STAGE_ENTRY_EVENT: Readonly<Partial<Record<LifecycleStage, SimEventType>>> = {
  [LifecycleStage.ProtostarCoalescence]: SimEventType.CollapseOnset,
  [LifecycleStage.FusionIgnition]: SimEventType.ProtostarFormed,
  [LifecycleStage.MainSequence]: SimEventType.FusionIgnition,
  [LifecycleStage.RedGiant]: SimEventType.RedGiantOnset,
  [LifecycleStage.Death]: SimEventType.DeathEvent,
  [LifecycleStage.Remnant]: SimEventType.RemnantFormed,
} as const;

/**
 * Centralized, auditable timing constants for the illustrative lifecycle. Sim
 * seconds. Main-sequence lifetime dominates and scales steeply with mass
 * (t ∝ M^-2.5), reproducing the real qualitative ordering.
 */
export const STAGE_TIMING = {
  /** Cloud drift before gravitational collapse sets in. */
  dustCloudSeconds: 1 * MYR_SECONDS,
  /** Protostellar coalescence; more massive clouds collapse faster (M^-0.5). */
  protostarBaseSeconds: 0.5 * MYR_SECONDS,
  /** Brief pre-main-sequence ignition window. */
  fusionIgnitionSeconds: 0.1 * MYR_SECONDS,
  /** Solar main-sequence lifetime (~10 Gyr) at the M^-2.5 reference mass of 1. */
  mainSequenceSolarSeconds: 10e9 * YEAR_SECONDS,
  /** Red-giant phase as a fraction of the main-sequence lifetime. */
  redGiantFractionOfMain: 0.1,
  /** Brief death window (supernova flash / envelope shedding). */
  deathSeconds: 0.01 * MYR_SECONDS,
  /** Reference (solar) metallicity used to modulate main-sequence lifetime. */
  solarMetallicity: 0.02,
  /**
   * How strongly excess metallicity shortens the main-sequence lifetime
   * (higher opacity/luminosity). Illustrative, dimensionless.
   */
  metallicityLifetimeCoefficient: 2,
} as const;

/**
 * Internal structure of the DEATH stage, as fractions of its duration.
 *
 * A core-collapse supernova is not one event but a short, violent sequence, and
 * the whole point of the death scene is that the viewer can SEE that sequence:
 *
 *   1. the iron core implodes and the envelope starts to fall in behind it —
 *      the star briefly shrinks and dims (the deceptive calm);
 *   2. the rebound shock reaches the surface and BREAKS OUT: a blinding
 *      ultraviolet flash;
 *   3. the envelope is blown off at ~10^4 km/s as an expanding fireball that
 *      brightens to peak luminosity while cooling from ~10^5 K;
 *   4. the fireball thins and fades, leaving the compact remnant inside a
 *      still-expanding shell.
 *
 * Both kernels and the renderer key off these fractions, so the ejecta shell is
 * thrown at exactly the moment the flash is drawn. Mirror in Rust.
 */
export const DEATH_PHASES = {
  /** Fraction of the stage spent collapsing before the shock breaks out. */
  shockBreakout: 0.12,
  /** Fraction at which the expanding fireball reaches peak luminosity. */
  peakLuminosity: 0.34,
  /**
   * Smallest number of kernel steps the DEATH stage may take.
   *
   * The stellar clock is compressed by up to ~14 orders of magnitude, so at a
   * fast pace ONE frame spans far more than the ~10^4 yr the death lasts, and
   * the star blinked from red giant straight to remnant with nothing in
   * between. Capping how much of the stage a single step may consume makes the
   * death always watchable — the same reasoning as `orbitalStep`'s compression
   * of the orbital dynamics, and it only engages when the pace is fast enough
   * for the death to be sub-frame anyway.
   */
  minSteps: 240,
} as const;

/**
 * Illustrative duration (sim seconds) the star spends IN each stage before
 * advancing to the next, keyed on `mass` (M☉) and `composition`. The terminal
 * {@link LifecycleStage.Remnant} lasts forever (`Infinity`). Pure; exported for
 * unit testing and for callers that want to preview the timeline.
 */
export function stageDurations(
  mass: number,
  composition: CloudComposition,
): Readonly<Record<LifecycleStage, number>> {
  const m = Math.max(mass, Number.EPSILON);
  const {
    dustCloudSeconds,
    protostarBaseSeconds,
    fusionIgnitionSeconds,
    mainSequenceSolarSeconds,
    redGiantFractionOfMain,
    deathSeconds,
    solarMetallicity,
    metallicityLifetimeCoefficient,
  } = STAGE_TIMING;

  // Higher-than-solar metallicity shortens the main-sequence lifetime; clamp to
  // a small positive factor so extreme compositions never zero/negate time.
  const metalExcess = composition.metals - solarMetallicity;
  const metallicityFactor = Math.max(0.1, 1 - metallicityLifetimeCoefficient * metalExcess);

  const mainSequence = mainSequenceSolarSeconds * Math.pow(m, -2.5) * metallicityFactor;

  return {
    [LifecycleStage.DustCloud]: dustCloudSeconds,
    [LifecycleStage.ProtostarCoalescence]: protostarBaseSeconds * Math.pow(m, -0.5),
    [LifecycleStage.FusionIgnition]: fusionIgnitionSeconds,
    [LifecycleStage.MainSequence]: mainSequence,
    [LifecycleStage.RedGiant]: mainSequence * redGiantFractionOfMain,
    [LifecycleStage.Death]: deathSeconds,
    [LifecycleStage.Remnant]: Infinity,
  };
}
