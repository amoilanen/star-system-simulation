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
// rather than timed (see `advance_stages` in `wasm/src/lib.rs`).
// A sub-stellar object short-circuits this order entirely — a brown dwarf never
// ignites, so it goes straight from FusionIgnition to Remnant.
//
// Stage durations are the real astrophysical timescales, from published fits
// rather than solved stellar structure (PRD A1). All timing knobs live in one
// place so they are auditable and adjustable; the time warp decides how they
// are compressed on screen.

import type { CloudComposition } from '../config/SimulationConfig';
import { LifecycleStage, RemnantType, determineFate, isSubstellar } from '../config/fateModel';
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
 * Centralized, auditable timing constants for the lifecycle. Sim seconds.
 *
 * These are the REAL astrophysical timescales (to within the accuracy of the
 * fits quoted below); how they are presented on screen — compressed into a
 * watchable span per stage — is the time warp's job (`timeWarp.ts`), not
 * theirs. Mirror in Rust (`wasm/src/stages.rs`).
 */
export const STAGE_TIMING = {
  /** Pre-stellar core: a few free-fall times before the collapse runs away. */
  dustCloudSeconds: 1 * MYR_SECONDS,
  /**
   * Embedded (Class 0/I) protostar accreting its envelope, ~0.5 Myr; more
   * massive cores accrete faster (M^-0.5).
   */
  protostarBaseSeconds: 0.5 * MYR_SECONDS,
  /**
   * Pre-main-sequence (T Tauri / Kelvin–Helmholtz) contraction of a 1 M☉ star
   * to the zero-age main sequence: ~40 Myr. The Sun really did take this long
   * to start burning hydrogen in equilibrium, and the planets formed in this
   * window — it was 0.1 Myr, 400× too short.
   */
  preMainSequenceSolarSeconds: 40 * MYR_SECONDS,
  /** KH time ∝ M^-2.5 above 1 M☉ (Iben 1965: 15 M☉ contracts in ~0.06 Myr)… */
  preMainSequenceHighMassExponent: 2.5,
  /** …and flattens to ∝ M^-1.25 below it (0.1 M☉ takes ~0.7 Gyr). */
  preMainSequenceLowMassExponent: 1.25,
  /**
   * Floor: a massive star reaches the main sequence while still accreting, so
   * its contraction can never be shorter than the accretion itself.
   */
  preMainSequenceMinSeconds: 0.05 * MYR_SECONDS,
  /**
   * A brown dwarf never reaches the main sequence; this stage is its
   * deuterium-burning phase instead, ~10 Myr at 0.05 M☉ and longer for lighter
   * objects (∝ M^-1.5), after which it only cools.
   */
  deuteriumBurningSeconds: 10 * MYR_SECONDS,
  deuteriumBurningReferenceMass: 0.05,
  deuteriumBurningExponent: 1.5,
  /**
   * Hurley, Pols & Tout (2000, eq. 4) fit for the time to the base of the
   * giant branch at Z = 0.02, in Myr:
   *
   *   t_BGB = (a1 + a2 M^4 + a3 M^5.5 + M^7) / (a4 M^2 + a5 M^7)
   *
   * and t_MS ≈ 0.95 t_BGB. Within ~5 % of detailed stellar models from 0.5 to
   * 120 M☉ (1 M☉ → 11 Gyr, 20 M☉ → 8.3 Myr, 60 M☉ → 3.7 Myr), and it has the
   * correct ~3 Myr floor for the most massive stars, where a pure power law
   * (the old M^-2.5) under-estimated a 60 M☉ star's life tenfold.
   */
  mainSequenceFit: [1593.89, 2706.708, 146.6143, 0.0414196, 0.3426349],
  mainSequenceFractionOfBgb: 0.95,
  /** Post-main-sequence (giant branch + core helium burning) ≈ 10 % of the MS. */
  redGiantFractionOfMain: 0.1,
  /**
   * Superwind + planetary-nebula ejection of a low/intermediate-mass star:
   * ~10^4 yr.
   */
  planetaryNebulaSeconds: 1e4 * YEAR_SECONDS,
  /**
   * The drawn core-collapse sequence — implosion, shock breakout, fireball,
   * fade — is a ~1-year event (a supernova's light curve), not 10^4 years.
   * Also used for a direct collapse, where the star simply winks out.
   */
  coreCollapseSeconds: 1 * YEAR_SECONDS,
  /** Reference (solar) metallicity of the lifetime fit. */
  solarMetallicity: 0.02,
  /**
   * Metal-POOR stars burn out SOONER: lower opacity makes them hotter and more
   * luminous at the same mass (a 0.8 M☉ globular-cluster star at Z ≈ 5e-4
   * leaves the main sequence at ~12 Gyr; at solar Z it would take ~25 Gyr).
   * The lifetime scales ≈ (Z/Z☉)^0.2, clamped to the range the fit supports.
   * (It used to scale the other way round.)
   */
  metallicityLifetimeExponent: 0.2,
  metallicityLifetimeMin: 0.45,
  metallicityLifetimeMax: 1.35,
} as const;

/** The current age of the universe (yr) — the yardstick for "longer than ever". */
export const UNIVERSE_AGE_YEARS = 13.8e9;

/**
 * Main-sequence lifetime (sim seconds) of a star of `mass` M☉ and metal mass
 * fraction `metals`: the Hurley–Pols–Tout fit, scaled for metallicity. Pure.
 */
export function mainSequenceLifetimeSeconds(mass: number, metals: number): number {
  const m = Math.max(mass, 1e-3);
  const [a1, a2, a3, a4, a5] = STAGE_TIMING.mainSequenceFit;
  const tBgbMyr = (a1 + a2 * m ** 4 + a3 * m ** 5.5 + m ** 7) / (a4 * m ** 2 + a5 * m ** 7);
  const {
    solarMetallicity,
    metallicityLifetimeExponent,
    metallicityLifetimeMin,
    metallicityLifetimeMax,
  } = STAGE_TIMING;
  const z = Number.isFinite(metals) ? Math.max(metals, 1e-6) : solarMetallicity;
  const metallicityFactor = Math.min(
    metallicityLifetimeMax,
    Math.max(metallicityLifetimeMin, Math.pow(z / solarMetallicity, metallicityLifetimeExponent)),
  );
  return STAGE_TIMING.mainSequenceFractionOfBgb * tBgbMyr * MYR_SECONDS * metallicityFactor;
}

/**
 * Duration (sim seconds) of the stage between the protostar and the main
 * sequence: Kelvin–Helmholtz contraction for a star, deuterium burning for a
 * brown dwarf. Pure.
 */
export function preMainSequenceSeconds(mass: number): number {
  const m = Math.max(mass, 1e-3);
  const t = STAGE_TIMING;
  if (isSubstellar(m)) {
    return (
      t.deuteriumBurningSeconds *
      Math.pow(t.deuteriumBurningReferenceMass / m, t.deuteriumBurningExponent)
    );
  }
  const exponent = m >= 1 ? t.preMainSequenceHighMassExponent : t.preMainSequenceLowMassExponent;
  return Math.max(
    t.preMainSequenceMinSeconds,
    t.preMainSequenceSolarSeconds * Math.pow(m, -exponent),
  );
}

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
 * What happens to the shell the star threw off, once the star itself is a
 * compact remnant. Mirror in Rust (`EJECTA_DRAG`, `EJECTA_LIFETIME`,
 * `DEATH_SWEEP` in `wasm/src/lib.rs`).
 *
 * The envelope does not coast away forever: it sweeps up the interstellar
 * medium, decelerates and settles at a stall radius, where it fades out. Both
 * numbers below are that deceleration expressed as the exponent of
 * `1 − e^-sweep`, i.e. the fraction of the stall radius reached — the kernel
 * integrates it, and `starVisual` draws the shock front with the same law, so
 * the drawn shell and the ejecta particles inside it are one object.
 *
 * The terminal {@link LifecycleStage.Remnant} lasts forever, so the progress the
 * kernel reports through it is precisely how far this dispersal has got: 0 as
 * the compact object appears, 1 once the last of the gas has faded.
 */
export const NEBULA_PHASES = {
  /**
   * How far the shell has swept by the time the remnant appears. Chosen so the
   * shell edge is still comfortably INSIDE the framed system at that moment —
   * it used to be several cloud radii out, i.e. off-screen, before the death
   * stage had even ended.
   */
  deathSweep: 0.6,
  /** …and by the time the nebula has faded out, near the end of its expansion. */
  remnantSweep: 3.25,
} as const;

/**
 * Duration (sim seconds) the star spends IN each stage before advancing to the
 * next, keyed on its `mass` (M☉) and `composition`. The terminal
 * {@link LifecycleStage.Remnant} lasts forever (`Infinity`). Pure; exported for
 * unit testing and for the HUD timeline.
 */
export function stageDurations(
  mass: number,
  composition: CloudComposition,
): Readonly<Record<LifecycleStage, number>> {
  const m = Math.max(mass, Number.EPSILON);
  const { dustCloudSeconds, protostarBaseSeconds, redGiantFractionOfMain } = STAGE_TIMING;
  const mainSequence = mainSequenceLifetimeSeconds(m, composition.metals);
  // A white dwarf's progenitor sheds a planetary nebula over millennia; every
  // other star dies in a core collapse that is over within a year.
  const { remnant } = determineFate(m, composition);
  const quietDeath = remnant === RemnantType.WhiteDwarf || remnant === RemnantType.BrownDwarf;

  return {
    [LifecycleStage.DustCloud]: dustCloudSeconds,
    [LifecycleStage.ProtostarCoalescence]: protostarBaseSeconds * Math.pow(m, -0.5),
    [LifecycleStage.FusionIgnition]: preMainSequenceSeconds(m),
    [LifecycleStage.MainSequence]: mainSequence,
    [LifecycleStage.RedGiant]: mainSequence * redGiantFractionOfMain,
    [LifecycleStage.Death]: quietDeath
      ? STAGE_TIMING.planetaryNebulaSeconds
      : STAGE_TIMING.coreCollapseSeconds,
    [LifecycleStage.Remnant]: Infinity,
  };
}
