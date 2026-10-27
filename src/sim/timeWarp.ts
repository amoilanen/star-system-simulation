// Adaptive time warp: how fast the stellar clock runs, stage by stage.
//
// A star's stages last anywhere from ~1 year (a supernova) to ~10^12 years (a
// red dwarf's main sequence), and even ONE stage spans five orders of magnitude
// across the mass range (3 Myr for a 60 M☉ star, 11 Gyr for the Sun). No single
// clock rate can show all of that: the old fixed pace either left a Sun-like
// star on its main sequence for decades of wall-clock time or crossed a massive
// star's whole life inside one frame.
//
// The adaptive warp instead gives every stage a WALL-CLOCK BUDGET and runs the
// clock at whatever rate fits the stage's REAL duration into it. The durations
// themselves stay physical (`stages.ts`); only their presentation is
// compressed, and the HUD always shows the rate actually in use, so the warp is
// honest about what it is doing.
//
// Three kinds of stage are paced differently:
//
//   - FORMATION is driven by accretion on the kernel's bounded orbital clock,
//     which the kernel holds to the stellar clock: it never runs ahead of the
//     real formation timescales, so a stage takes its budget or its natural
//     accretion time, whichever is longer — and a slow fixed rate really is slow.
//   - The DEATH is paced by the kernel itself (`DEATH_PHASES.minSteps`) so the
//     collapse → flash → fireball sequence is always watchable and the ejecta
//     shell stays in step with the drawn one; the warp only has to be fast
//     enough for that cap to engage.
//   - The long STELLAR stages (main sequence, giant) and the open-ended
//     remnant follow their budgets, scaled by the user's speed setting.
//
// Pure and DOM-free so the whole policy is unit-testable.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import { SECONDS_PER_YEAR } from './timeFormat';

/** Tunable, auditable constants of the adaptive warp. */
export const TIME_WARP = {
  /** Wall-clock seconds a main sequence takes at 1× speed. */
  mainSequenceSeconds: 45,
  /** Wall-clock seconds the giant phase takes at 1× speed. */
  redGiantSeconds: 20,
  /**
   * Wall-clock budget handed to the death. Deliberately SHORTER than the
   * kernel's own minimum (`DEATH_PHASES.minSteps` frames ≈ 4 s), so the kernel's
   * cap always engages and the death plays out over exactly its designed number
   * of steps; it is NOT scaled by the speed setting for the same reason.
   */
  deathSeconds: 2,
  /** Wall-clock seconds over which the remnant's nebula span plays at 1×. */
  remnantSeconds: 30,
  /**
   * Wall-clock budget of each formation stage. The kernel never lets formation
   * run ahead of the stellar clock, so this is the SHORTEST a formation stage
   * can take; a stage whose accretion is naturally slower (the protostar, the
   * contraction to ignition: ~6 s each) takes its natural time instead.
   */
  formationSeconds: 3,
  /**
   * Real time a remnant's surroundings take to evolve visibly, in years: a
   * planetary nebula disperses in ~3·10^4 yr, a supernova remnant merges into
   * the interstellar medium over ~10^5 yr, a black hole born without an
   * explosion has no shell at all (show its quiet ~Myr), and a brown dwarf only
   * cools, over billions of years.
   */
  remnantSpanYears: {
    planetaryNebula: 3e4,
    supernovaRemnant: 1e5,
    quietCollapse: 1e6,
    brownDwarfCooling: 1e9,
  },
  /**
   * Floor on the warp (yr per real second). Well above the rate at which the
   * kernel's orbital clock saturates (~30 yr/s at 60 fps), so the orbits, the
   * death's ejecta and the nebula always run at full visual speed in adaptive
   * mode, even at the slowest setting.
   */
  minYearsPerSecond: 1000,
  /** Speed setting range: pace 0 → ÷8, pace 0.5 → 1×, pace 1 → ×8. */
  speedRange: 8,
  /** Wall-clock seconds "skip to next stage" spends crossing what is left. */
  skipSeconds: 1.5,
} as const;

/** How the clock rate is chosen. */
export type TimeMode = 'adaptive' | 'fixed';

/** Everything the warp needs to know about where the system is. */
export interface WarpContext {
  stage: LifecycleStage;
  /** Normalized 0..1 progress through the current stage. */
  stageProgress: number;
  /** Real stage durations (sim seconds), as from `stageDurations`. */
  durations: Readonly<Record<LifecycleStage, number>>;
  /** The remnant this system ends as. */
  remnant: RemnantType;
  /** Whether its death is a supernova. */
  supernova: boolean;
}

/** Speed multiplier for a normalized pace: 1/8 … 1 … 8, geometric. Pure. */
export function speedMultiplier(pace: number): number {
  const p = Number.isFinite(pace) ? Math.min(1, Math.max(0, pace)) : 0.5;
  return Math.pow(TIME_WARP.speedRange, 2 * p - 1);
}

/** Real time (yr) the remnant stage's visible evolution takes. Pure. */
export function remnantSpanYears(remnant: RemnantType, supernova: boolean): number {
  const spans = TIME_WARP.remnantSpanYears;
  switch (remnant) {
    case RemnantType.BrownDwarf:
      return spans.brownDwarfCooling;
    case RemnantType.WhiteDwarf:
      return spans.planetaryNebula;
    default:
      return supernova ? spans.supernovaRemnant : spans.quietCollapse;
  }
}

/** Whether a stage can be fast-forwarded with "skip to next stage". */
export function isSkippable(stage: LifecycleStage): boolean {
  return stage === LifecycleStage.MainSequence || stage === LifecycleStage.RedGiant;
}

/**
 * Adaptive clock rate (sim seconds per real second) for the current stage at
 * the user's `pace`. Pure; never below {@link TIME_WARP.minYearsPerSecond}.
 */
export function adaptiveRate(context: WarpContext, pace: number): number {
  const speed = speedMultiplier(pace);
  const floor = TIME_WARP.minYearsPerSecond * SECONDS_PER_YEAR;
  const duration = context.durations[context.stage];
  let rate: number;
  switch (context.stage) {
    case LifecycleStage.MainSequence:
      rate = (duration / TIME_WARP.mainSequenceSeconds) * speed;
      break;
    case LifecycleStage.RedGiant:
      rate = (duration / TIME_WARP.redGiantSeconds) * speed;
      break;
    case LifecycleStage.Death:
      rate = duration / TIME_WARP.deathSeconds;
      break;
    case LifecycleStage.Remnant:
      rate =
        ((remnantSpanYears(context.remnant, context.supernova) * SECONDS_PER_YEAR) /
          TIME_WARP.remnantSeconds) *
        speed;
      break;
    default:
      rate = duration / TIME_WARP.formationSeconds;
      break;
  }
  return Number.isFinite(rate) ? Math.max(floor, rate) : floor;
}

/**
 * Rate that crosses what is left of a skippable stage in
 * {@link TIME_WARP.skipSeconds}, or 0 when the stage cannot be skipped. Pure.
 */
export function skipRate(context: WarpContext): number {
  if (!isSkippable(context.stage)) {
    return 0;
  }
  const duration = context.durations[context.stage];
  const progress = Math.min(1, Math.max(0, context.stageProgress));
  const remaining = duration * (1 - progress);
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return 0;
  }
  return remaining / TIME_WARP.skipSeconds;
}
