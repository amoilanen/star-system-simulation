// Simulation clock: pace mapping + pause (spec §3.4, FR-5, A6).
//
// Two modes:
//
//   - ADAPTIVE (default): the rate is chosen per stage by the time warp
//     (`timeWarp.ts`) so every stage of every star is watchable, and the pace
//     is a speed multiplier on that. The owner (the runner) pushes the rate in
//     with `setAdaptiveRate` each frame; the clock itself stays stage-agnostic.
//   - FIXED: one constant rate for the whole run, chosen by the pace as below —
//     the honest "feel how long a main sequence really is" mode.
//
// In fixed mode the user's normalized `pace` in [0, 1] maps to a
// `simSecondsPerRealSecond` factor spanning two extremes:
//   - pace = 0 → near-real astronomical time: the sim advances ~1 sim second per
//     real second, so a full lifecycle would take astronomical wall-clock time.
//   - pace = 1 → the whole birth→death cycle compresses into ~1 minute of real
//     time (FR-5).
//
// Because the endpoints differ by many orders of magnitude, the mapping is
// GEOMETRIC (log-linear) in pace so the slider feels smooth across the range.
// Pause freezes the sim (`dt = 0`) WITHOUT stopping rendering: the render loop
// keeps calling `advance`, it just returns 0 and does not move `simTime` (A6).

import type { TimeMode } from './timeWarp';

/** Tunable endpoints of the pace→rate mapping. All optional; sane defaults. */
export interface ClockOptions {
  /** How the rate is chosen. Default `'adaptive'`. */
  mode?: TimeMode;
  /** Initial normalized pace in [0, 1]. Default 0.5. */
  pace?: number;
  /** sim seconds per real second at pace = 0 (near-real). Default 1. */
  nearRealRate?: number;
  /**
   * Total sim-time span of a full birth→death lifecycle, in sim seconds. At
   * pace = 1 this whole span elapses over {@link fullCycleRealSeconds}. Default
   * ~13.8e9 years expressed in seconds, an illustrative stellar lifetime.
   */
  lifecycleSimSeconds?: number;
  /** Real seconds a full lifecycle takes at pace = 1. Default 60 (~1 minute). */
  fullCycleRealSeconds?: number;
}

/** Default near-real rate: one sim second per real second. */
export const DEFAULT_NEAR_REAL_RATE = 1;

/** Default full-lifecycle sim span (~13.8 Gyr in seconds), illustrative. */
export const DEFAULT_LIFECYCLE_SIM_SECONDS = 13.8e9 * 365.25 * 24 * 3600;

/** Default wall-clock duration of a full lifecycle at pace = 1 (seconds). */
export const DEFAULT_FULL_CYCLE_REAL_SECONDS = 60;

/** Clamp a value into the inclusive `[min, max]` range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Map a normalized pace to the sim-seconds-per-real-second rate for the given
 * endpoints, using geometric interpolation between the near-real rate and the
 * fast (full-cycle-in-~1-minute) rate. Pure; exported for unit testing.
 *
 * - `paceToRate(0)` === near-real rate.
 * - `paceToRate(1)` === `lifecycleSimSeconds / fullCycleRealSeconds`.
 */
export function paceToRate(
  pace: number,
  nearRealRate: number,
  lifecycleSimSeconds: number,
  fullCycleRealSeconds: number,
): number {
  const p = clamp(pace, 0, 1);
  const fastRate = lifecycleSimSeconds / fullCycleRealSeconds;
  // Geometric interpolation: near * (fast/near)^p. Guards a zero near-real rate.
  if (nearRealRate <= 0) {
    return fastRate * p;
  }
  return nearRealRate * Math.pow(fastRate / nearRealRate, p);
}

/**
 * The simulation clock. Owns the current pace, pause state, and accumulated
 * simulation time. The render loop calls {@link advance} with real elapsed
 * seconds each frame and applies the returned sim `dt` to the physics kernel.
 */
export class Clock {
  private paceValue: number;
  private pausedValue = false;
  private simTimeValue = 0;
  private modeValue: TimeMode;
  /** Latest stage-aware rate pushed in by the owner (adaptive mode). */
  private adaptiveRateValue = 0;
  /** One-off rate floor (e.g. "skip to next stage"); 0 when inactive. */
  private boostRateValue = 0;

  private readonly nearRealRate: number;
  private readonly lifecycleSimSeconds: number;
  private readonly fullCycleRealSeconds: number;

  constructor(options: ClockOptions = {}) {
    this.nearRealRate = options.nearRealRate ?? DEFAULT_NEAR_REAL_RATE;
    this.lifecycleSimSeconds = options.lifecycleSimSeconds ?? DEFAULT_LIFECYCLE_SIM_SECONDS;
    this.fullCycleRealSeconds = options.fullCycleRealSeconds ?? DEFAULT_FULL_CYCLE_REAL_SECONDS;
    this.paceValue = clamp(options.pace ?? 0.5, 0, 1);
    this.modeValue = options.mode ?? 'adaptive';
  }

  /** How the rate is chosen: per stage (`'adaptive'`) or constant (`'fixed'`). */
  get mode(): TimeMode {
    return this.modeValue;
  }

  /** Switch between the adaptive warp and a fixed rate. */
  setMode(mode: TimeMode): void {
    this.modeValue = mode;
  }

  /**
   * Set the stage-aware rate (sim seconds per real second) used in adaptive
   * mode. Non-finite or negative values are ignored.
   */
  setAdaptiveRate(rate: number): void {
    if (Number.isFinite(rate) && rate >= 0) {
      this.adaptiveRateValue = rate;
    }
  }

  /**
   * Set a temporary rate FLOOR on top of either mode (e.g. while skipping to
   * the next stage); 0 clears it.
   */
  setBoostRate(rate: number): void {
    this.boostRateValue = Number.isFinite(rate) && rate > 0 ? rate : 0;
  }

  /** Whether a boost (skip) is currently raising the rate. */
  get boosting(): boolean {
    return this.boostRateValue > this.baseRate();
  }

  /** Current normalized pace in [0, 1]. */
  get pace(): number {
    return this.paceValue;
  }

  /** Set the normalized pace (clamped to [0, 1]). Takes effect immediately. */
  setPace(pace: number): void {
    this.paceValue = clamp(pace, 0, 1);
  }

  /** Whether the clock is paused (sim time frozen). */
  get paused(): boolean {
    return this.pausedValue;
  }

  /** Pause the clock: subsequent {@link advance} calls return 0. */
  pause(): void {
    this.pausedValue = true;
  }

  /** Resume the clock after a pause. */
  resume(): void {
    this.pausedValue = false;
  }

  /** Set the paused state explicitly (e.g. from a toggle). */
  setPaused(paused: boolean): void {
    this.pausedValue = paused;
  }

  /** Accumulated simulation time in sim seconds since construction/reset. */
  get simTime(): number {
    return this.simTimeValue;
  }

  /**
   * Current conversion factor from real seconds to sim seconds given the pace.
   * Returns 0 while paused so callers observe a frozen clock (A6).
   */
  simSecondsPerRealSecond(): number {
    if (this.pausedValue) {
      return 0;
    }
    return this.currentRate();
  }

  /**
   * The pace's sim-seconds-per-real-second rate, IGNORING pause. Useful for a
   * HUD "speed" readout that should reflect the slider setting even when the
   * simulation is momentarily paused.
   */
  currentRate(): number {
    return Math.max(this.baseRate(), this.boostRateValue);
  }

  /** The mode's own rate, before any boost. */
  private baseRate(): number {
    if (this.modeValue === 'adaptive') {
      return this.adaptiveRateValue;
    }
    return paceToRate(
      this.paceValue,
      this.nearRealRate,
      this.lifecycleSimSeconds,
      this.fullCycleRealSeconds,
    );
  }

  /**
   * Advance the clock by `realDtSeconds` of real (wall-clock) time and return
   * the corresponding sim `dt`. While paused (or for a non-positive/non-finite
   * real dt) returns 0 and does not move sim time — rendering continues (A6).
   */
  advance(realDtSeconds: number): number {
    if (this.pausedValue || !Number.isFinite(realDtSeconds) || realDtSeconds <= 0) {
      return 0;
    }
    const simDt = realDtSeconds * this.simSecondsPerRealSecond();
    this.simTimeValue += simDt;
    return simDt;
  }

  /** Reset accumulated sim time to 0 (pace and pause state are preserved). */
  reset(): void {
    this.simTimeValue = 0;
  }
}
