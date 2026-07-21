// Lifecycle stage FSM (spec §3.3, §4.2, FR-3, FR-4).
//
// A deterministic state machine that drives the visual/narrative progression of
// a star system through its life:
//
//   DustCloud → ProtostarCoalescence → FusionIgnition → MainSequence
//            → RedGiant → Death → Remnant
//
// The machine is advanced by the simulation clock (it consumes sim-time `dt`),
// keyed on the cloud's `mass` and `composition`, and emits EXACTLY ONE
// correctly-typed {@link SimulationEvent} at each stage transition via the
// injected {@link EventBus}. The death path (supernova + remnant kind) is
// selected from the centralized {@link fateModel} — the single source of truth
// for FR-4 — and carried on the death/remnant events so downstream layers do
// not re-derive it.
//
// Stage durations are illustrative, not simulation-grade (PRD A1): they use the
// real qualitative ordering (massive stars live fast and die young) rather than
// solving stellar structure. All timing knobs live in one place so they are
// auditable and adjustable.

import type { CloudComposition, SimulationConfig } from '../config/SimulationConfig';
import {
  LifecycleStage,
  fateModel as defaultFateModel,
  type FateModel,
  type FateOutcome,
} from '../config/fateModel';
import { EventBus, SimEventType, type SimulationEvent } from './events';

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

/** Options for {@link StageMachine}, all optional (sane defaults). */
export interface StageMachineOptions {
  /** Override the death-path model (defaults to the centralized `fateModel`). */
  fateModel?: FateModel;
  /**
   * Override the per-stage durations (sim seconds). Defaults to
   * {@link stageDurations} for the config's mass + composition. Primarily for
   * tests and deterministic scenarios.
   */
  durations?: Readonly<Record<LifecycleStage, number>>;
}

/**
 * Deterministic lifecycle stage machine. Construct once per simulation run with
 * the immutable {@link SimulationConfig} and the shared {@link EventBus}, then
 * call {@link update} each frame with the sim-time `dt` produced by the Clock.
 */
export class StageMachine {
  private stage: LifecycleStage = LifecycleStage.DustCloud;
  /** Sim seconds elapsed within the current stage. */
  private elapsedInStage = 0;
  /** Accumulated sim time; stamped onto emitted events. */
  private simTime = 0;

  private readonly bus: EventBus;
  private readonly durations: Readonly<Record<LifecycleStage, number>>;
  private readonly fate: FateOutcome;

  constructor(config: SimulationConfig, bus: EventBus, options: StageMachineOptions = {}) {
    this.bus = bus;
    this.durations = options.durations ?? stageDurations(config.mass, config.composition);
    const model = options.fateModel ?? defaultFateModel;
    this.fate = model.determineFate(config.mass, config.composition);
  }

  /** The stage the star system is currently in. */
  get currentStage(): LifecycleStage {
    return this.stage;
  }

  /** The pre-computed death outcome (supernova flag + remnant kind). */
  get fateOutcome(): FateOutcome {
    return this.fate;
  }

  /** Accumulated sim time consumed by the FSM (sim seconds). */
  get elapsedSimTime(): number {
    return this.simTime;
  }

  /** Whether the FSM has reached its terminal {@link LifecycleStage.Remnant}. */
  get isTerminal(): boolean {
    return this.stage === LifecycleStage.Remnant;
  }

  /**
   * Advance the FSM by `simDt` sim seconds. Crosses as many stage boundaries as
   * the elapsed time warrants (a single large `dt` at fast pace can skip through
   * several stages), emitting EXACTLY ONE correctly-typed, correctly-timed event
   * per transition, in order. Non-positive/non-finite `dt` is ignored (the Clock
   * returns 0 while paused, A6).
   */
  update(simDt: number): void {
    if (!Number.isFinite(simDt) || simDt <= 0) {
      return;
    }

    let remaining = simDt;
    while (remaining > 0 && this.stage !== LifecycleStage.Remnant) {
      const stageDuration = this.durations[this.stage];
      const remainingInStage = stageDuration - this.elapsedInStage;

      if (remaining < remainingInStage) {
        // Stay within the current stage.
        this.elapsedInStage += remaining;
        this.simTime += remaining;
        remaining = 0;
      } else {
        // Consume up to the boundary, then transition into the next stage.
        this.simTime += remainingInStage;
        remaining -= remainingInStage;
        this.elapsedInStage = 0;
        this.advanceStage();
      }
    }

    // Once terminal, absorb any leftover dt so sim time keeps tracking wall time.
    if (remaining > 0) {
      this.simTime += remaining;
    }
  }

  /** Reset to the initial {@link LifecycleStage.DustCloud} at sim time 0. */
  reset(): void {
    this.stage = LifecycleStage.DustCloud;
    this.elapsedInStage = 0;
    this.simTime = 0;
  }

  /** Move to the next ordered stage and emit its entry event. */
  private advanceStage(): void {
    const nextIndex = STAGE_ORDER.indexOf(this.stage) + 1;
    const next = STAGE_ORDER[nextIndex];
    // Guarded by the `stage !== Remnant` check in update(); Remnant is last.
    if (next === undefined) {
      return;
    }
    this.stage = next;
    this.emitEntryEvent(this.stage);
  }

  /** Emit the single event associated with entering `stage`, if any. */
  private emitEntryEvent(stage: LifecycleStage): void {
    const type = STAGE_ENTRY_EVENT[stage];
    if (type === undefined) {
      return;
    }
    const event: Omit<SimulationEvent, 'messageId'> = {
      type,
      simTime: this.simTime,
    };
    const data = this.eventData(type);
    if (data !== undefined) {
      event.data = data;
    }
    this.bus.emit(event);
  }

  /** Structured payload for events that carry the selected death path. */
  private eventData(type: SimEventType): Record<string, unknown> | undefined {
    switch (type) {
      case SimEventType.DeathEvent:
        return { supernova: this.fate.supernova };
      case SimEventType.RemnantFormed:
        return { remnant: this.fate.remnant, supernova: this.fate.supernova };
      default:
        return undefined;
    }
  }
}
