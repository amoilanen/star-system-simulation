// Headless orchestration core (spec §2 data-flow, FR-3, FR-10, FR-12).
//
// The `SimulationRunner` owns the per-frame data flow that turns real elapsed
// time into a renderable snapshot, WITHOUT any DOM or Three.js dependency so it
// is unit-testable in a plain Node environment:
//
//   real dt → Clock (scaled sim dt, pause) → Kernel.step → drained events
//           → tracked lifecycle stage + stage progress → RenderState
//
// The renderer (SceneManager), HUD and annotation layers are wired around this
// core by the RunScreen (see `./RunScreen.ts`); the runner itself is agnostic to
// how its output is presented. The kernel is injected so tests can drive the
// deterministic pure-TypeScript fallback directly.

import type { SimulationConfig } from '../config/SimulationConfig';
import {
  LifecycleStage,
  RemnantType,
  fateModel as defaultFateModel,
  type FateModel,
} from '../config/fateModel';
import { Clock, type ClockOptions } from '../sim/Clock';
import type { SimulationEvent } from '../sim/events';
import {
  ATTRACTOR_STRIDE,
  BODY_STRIDE,
  PARTICLE_STRIDE,
  type PhysicsKernel,
} from '../sim/PhysicsKernel';
import { StateHistory } from '../sim/StateHistory';
import { stellarMassFromCloud } from '../config/starFormation';
import { stageDurations } from '../sim/stages';
import {
  adaptiveRate,
  isSkippable,
  skipRate,
  type TimeMode,
  type WarpContext,
} from '../sim/timeWarp';
import type { RenderState } from '../render/SceneManager';

/** Default dust-particle count requested from the kernel (kernel may cap it). */
export const DEFAULT_PARTICLE_COUNT = 4000;

/**
 * Real seconds between recorded history snapshots at the START of a run. The
 * interval doubles each time the history thins itself (see
 * {@link StateHistory.record}), so the recording always spans the whole run.
 */
export const HISTORY_SNAPSHOT_INTERVAL = 0.2;

/**
 * Maximum retained history frames. Even, so that thinning keeps both the very
 * first and the newest frame. Rewinding the WHOLE run therefore never takes
 * longer than `HISTORY_CAPACITY / REWIND_FRAMES_PER_SECOND` (~12 s).
 */
export const HISTORY_CAPACITY = 240;

/**
 * How fast rewind/forward-replay moves through recorded frames, in frames of
 * recording per real second. Frames are recorded every
 * {@link HISTORY_SNAPSHOT_INTERVAL} s, so a value of 4× record-rate rewinds at
 * roughly 4× the wall-clock speed at which the run was recorded.
 */
export const REWIND_FRAMES_PER_SECOND = 4 / HISTORY_SNAPSHOT_INTERVAL;

/** Options for constructing a {@link SimulationRunner}. */
export interface SimulationRunnerOptions {
  /** Pre-built clock (primarily for deterministic tests). */
  clock?: Clock;
  /** Clock construction options when {@link clock} is not supplied. */
  clockOptions?: ClockOptions;
  /** Requested dust-particle count. Default {@link DEFAULT_PARTICLE_COUNT}. */
  particleCount?: number;
  /** Override the death-path model (defaults to the centralized `fateModel`). */
  fateModel?: FateModel;
}

/** The result of advancing the simulation by one frame. */
export interface RunnerTick {
  /** The renderable snapshot for this frame (buffers + derived visual params). */
  state: RenderState;
  /** Events emitted during this step, in emission order (already drained). */
  events: SimulationEvent[];
  /**
   * Physically meaningful elapsed sim seconds for THIS frame. Equals
   * {@link SimulationRunner.elapsedSimSeconds} during live play, but reflects the
   * rewound/replayed frame's timestamp while scrubbing through history.
   */
  elapsed: number;
  /** Whether this frame came from history playback (rewind/replay) vs live. */
  fromHistory: boolean;
}

/**
 * Drives one simulation run end-to-end from real elapsed time. Construct once
 * per run with the immutable {@link SimulationConfig} and a {@link PhysicsKernel},
 * then call {@link tick} each frame. Deterministic for a given config + kernel.
 */
export class SimulationRunner {
  /** The simulation clock (pace + pause). Exposed for HUD wiring. */
  readonly clock: Clock;

  private readonly config: SimulationConfig;
  private readonly kernel: PhysicsKernel;
  private readonly particleCount: number;
  private readonly remnantType: RemnantType;
  /** Whether this star's death is a core-collapse supernova (staged visually). */
  private readonly supernova: boolean;
  /** Final mass (M☉) of the star this cloud assembles. */
  private readonly stellarMass: number;
  /** Real duration (sim seconds) of every stage of this star's life. */
  private readonly durations: Readonly<Record<LifecycleStage, number>>;
  /** The stage "skip to next stage" is fast-forwarding through, if any. */
  private skipping: LifecycleStage | null = null;
  /**
   * Rate locked in when the skip started. Recomputing "what is left ÷ 1.5 s"
   * every frame would shrink the rate as the remainder shrinks, and the skip
   * would only ever approach the end of the stage, never reach it.
   */
  private skipBoost = 0;

  /** Currently tracked lifecycle stage (mirrors the kernel's stage). */
  private stage: LifecycleStage = LifecycleStage.DustCloud;
  /** The furthest stage the LIVE run has reached (history never goes past it). */
  private liveStage: LifecycleStage = LifecycleStage.DustCloud;
  /** Latest normalized 0..1 stage progress reported by the kernel. */
  private progress = 0;
  /** Latest physically meaningful elapsed sim time reported by the kernel. */
  private elapsed = 0;
  /**
   * Latest mass of the central object (M☉) reported by the kernel — the accreted
   * core while forming, the star during its life, the remnant afterwards. Only a
   * fraction of the configured CLOUD mass ever gets here.
   */
  private starMass = 0;

  /** Recorded render snapshots for time-travel / rewind. */
  private readonly history = new StateHistory(HISTORY_CAPACITY);
  /** Whether the user is currently scrubbing backwards through history. */
  private rewinding = false;
  /** Real-time accumulator gating how often a live frame is recorded. */
  private recordAccumulator = 0;
  /** Current recording interval (real s); doubles whenever the history thins. */
  private recordInterval = HISTORY_SNAPSHOT_INTERVAL;
  /** Stage of the last recorded frame, so every stage onset gets a keyframe. */
  private lastRecordedStage: LifecycleStage | null = null;

  constructor(
    config: SimulationConfig,
    kernel: PhysicsKernel,
    options: SimulationRunnerOptions = {},
  ) {
    this.config = config;
    this.kernel = kernel;
    this.particleCount = options.particleCount ?? DEFAULT_PARTICLE_COUNT;
    this.clock = options.clock ?? new Clock({ pace: config.pace, ...options.clockOptions });
    const model = options.fateModel ?? defaultFateModel;
    // The death path follows the STAR's mass, which is only a fraction of the
    // cloud the user configured (see `config/starFormation.ts`).
    this.stellarMass = stellarMassFromCloud(config.mass, config.composition.metals);
    const fate = model.determineFate(this.stellarMass, config.composition);
    this.remnantType = fate.remnant;
    this.supernova = fate.supernova;
    this.starMass = this.stellarMass;
    this.durations = stageDurations(this.stellarMass, config.composition);

    this.kernel.init({ config, particleCount: this.particleCount });
  }

  /** The lifecycle stage the simulation is currently in. */
  get currentStage(): LifecycleStage {
    return this.stage;
  }

  /**
   * Physically meaningful elapsed time for the star system, in sim seconds.
   * Use this (not `clock.simTime`) for any user-facing "elapsed" readout: it
   * accounts for the accretion-driven formation phase being mapped onto real
   * formation timescales.
   */
  get elapsedSimSeconds(): number {
    return this.elapsed;
  }

  /**
   * Advance the simulation by `realDtSeconds` of wall-clock time: scale it
   * through the {@link Clock} (0 while paused, A6), step the kernel, track the
   * lifecycle stage + progress, and return the renderable snapshot plus the
   * events emitted this step.
   */
  tick(realDtSeconds: number): RunnerTick {
    const dt = Number.isFinite(realDtSeconds) && realDtSeconds > 0 ? realDtSeconds : 0;

    // In the past: rewinding scrubs backwards through recorded snapshots
    // WITHOUT stepping the kernel (the physics is not reversible; we restore
    // the nearest state), and playing forward from there replays recorded
    // frames until it catches the live frontier. Paused, the frame simply
    // holds — pause freezes the past exactly as it freezes the present.
    if (this.rewinding || !this.history.isLive) {
      const direction = this.rewinding ? -1 : 1;
      const delta = this.clock.paused ? 0 : direction * REWIND_FRAMES_PER_SECOND * dt;
      const replayed = this.replay(delta);
      if (replayed !== null) {
        if (this.rewinding && this.history.atStart) {
          // Nothing earlier was recorded: stop on the first frame, paused, so
          // the run does not sit in "rewind" with nothing left to rewind.
          this.rewinding = false;
          this.clock.setPaused(true);
        }
        return replayed;
      }
    }

    // Live stepping, at the rate the time warp picks for where we are now.
    this.updateWarp();
    const simDt = this.clock.advance(realDtSeconds);
    const { events, stage, stageProgress, elapsedSimSeconds, starMassSolar } =
      this.kernel.step(simDt);
    this.stage = stage;
    this.liveStage = stage;
    this.progress = stageProgress;
    this.elapsed = elapsedSimSeconds;
    this.starMass = Number.isFinite(starMassSolar) ? starMassSolar : this.stellarMass;
    const state = this.buildState(stage);
    // Attach the sim-time delta to the render state so the body renderer can
    // drive moon orbital motion and axial spin from sim time (spec §3.4).
    // 0 when paused (clock.advance returns 0); absent on history-replay frames.
    state.simDt = simDt;
    this.maybeRecord(dt, simDt, state);
    return { state, events, elapsed: this.elapsed, fromHistory: false };
  }

  /**
   * Advance the history cursor and return the frame it lands on, or null if no
   * history exists yet (so the caller falls through to live stepping).
   */
  private replay(deltaFrames: number): RunnerTick | null {
    const frame = this.history.seek(deltaFrames);
    if (frame === null) {
      return null;
    }
    this.stage = frame.state.stage;
    this.progress = frame.state.stageProgress;
    this.elapsed = frame.elapsed;
    this.starMass = frame.state.mass;
    return { state: frame.state, events: [], elapsed: frame.elapsed, fromHistory: true };
  }

  /**
   * Record a deep-copied snapshot once per recording interval, plus a pinned
   * keyframe at every stage onset. Nothing is recorded while paused: a frozen
   * frame repeated would only crowd the real past out of the history.
   */
  private maybeRecord(realDt: number, simDt: number, state: RenderState): void {
    const stageChanged = state.stage !== this.lastRecordedStage;
    if (simDt <= 0 && !stageChanged && this.history.size > 0) {
      return;
    }
    this.recordAccumulator += realDt;
    if (this.history.size === 0 || stageChanged || this.recordAccumulator >= this.recordInterval) {
      this.recordAccumulator = 0;
      this.lastRecordedStage = state.stage;
      const thinned = this.history.record({
        state: cloneRenderState(state),
        elapsed: this.elapsed,
        pinned: stageChanged,
      });
      if (thinned) {
        // Half the frames are gone, so record half as often to stay even.
        this.recordInterval *= 2;
      }
    }
  }

  /**
   * Jump back to the first recorded moment of `stage` (clicking a past phase
   * on the timeline). Leaves rewind mode; if the clock is running, playback
   * then continues forward from there. Returns whether such a moment exists.
   */
  seekToStage(stage: LifecycleStage): boolean {
    const frame = this.history.seekToFirst((f) => f.state.stage === stage);
    if (frame === null) {
      return false;
    }
    this.rewinding = false;
    this.stage = frame.state.stage;
    this.progress = frame.state.stageProgress;
    this.elapsed = frame.elapsed;
    this.starMass = frame.state.mass;
    return true;
  }

  /** The furthest stage the live run has reached — every phase up to it can be revisited. */
  get reachedStage(): LifecycleStage {
    return this.liveStage;
  }

  /** Whether the frame on screen is from the recorded past (not live). */
  get isReplaying(): boolean {
    return this.rewinding || !this.history.isLive;
  }

  /** Enter or leave rewind (backwards playback) mode (HUD rewind toggle). */
  setRewinding(rewinding: boolean): void {
    this.rewinding = rewinding;
  }

  /** Whether the runner is currently scrubbing backwards through history. */
  get isRewinding(): boolean {
    return this.rewinding;
  }

  /** Real duration (sim seconds) of every stage of this star's life. */
  get stageDurations(): Readonly<Record<LifecycleStage, number>> {
    return this.durations;
  }

  /** The remnant this system ends as (a brown dwarf for a substellar cloud). */
  get finalRemnant(): RemnantType {
    return this.remnantType;
  }

  /** Normalized 0..1 progress through the current stage. */
  get stageProgress(): number {
    return this.progress;
  }

  /** How the clock rate is chosen (adaptive per-stage warp, or fixed). */
  get timeMode(): TimeMode {
    return this.clock.mode;
  }

  /** Switch between the adaptive warp and a fixed rate (HUD toggle). */
  setTimeMode(mode: TimeMode): void {
    this.clock.setMode(mode);
  }

  /** Whether the current stage can be fast-forwarded right now. */
  get canSkipStage(): boolean {
    return isSkippable(this.stage) && this.history.isLive && !this.rewinding;
  }

  /** Whether a skip to the next stage is in progress. */
  get isSkipping(): boolean {
    return this.skipping !== null;
  }

  /**
   * Fast-forward through what is left of the current stage (main sequence or
   * giant) in a second or two, then drop back to the normal rate. Returns
   * whether a skip was started.
   */
  skipStage(): boolean {
    if (!this.canSkipStage) {
      return false;
    }
    this.skipping = this.stage;
    this.skipBoost = skipRate(this.warpContext());
    return true;
  }

  /** Push the time warp's rate (and any skip boost) for the current state. */
  private updateWarp(): void {
    this.clock.setAdaptiveRate(adaptiveRate(this.warpContext(), this.clock.pace));
    if (this.skipping !== null && this.skipping !== this.stage) {
      // The skipped stage is over; resume the ordinary rate.
      this.skipping = null;
      this.skipBoost = 0;
    }
    this.clock.setBoostRate(this.skipBoost);
  }

  /** Where the system is, as the time warp needs to know it. */
  private warpContext(): WarpContext {
    return {
      stage: this.stage,
      stageProgress: this.progress,
      durations: this.durations,
      remnant: this.remnantType,
      supernova: this.supernova,
    };
  }

  /** Set the normalized pace 0..1 (HUD time-scale slider, FR-5). */
  setPace(pace: number): void {
    this.clock.setPace(pace);
  }

  /** Toggle pause; returns the new paused state (HUD pause/resume, FR-5). */
  togglePause(): boolean {
    const paused = !this.clock.paused;
    this.clock.setPaused(paused);
    return paused;
  }

  /** Whether the simulation is currently paused. */
  get paused(): boolean {
    return this.clock.paused;
  }

  /**
   * Restart the run from the beginning with the same config: re-seed the kernel,
   * reset the clock's accumulated time (pace/pause preserved), and return to the
   * initial dust-cloud stage.
   */
  reset(): void {
    this.kernel.init({ config: this.config, particleCount: this.particleCount });
    this.clock.reset();
    this.stage = LifecycleStage.DustCloud;
    this.liveStage = LifecycleStage.DustCloud;
    this.progress = 0;
    this.elapsed = 0;
    this.starMass = 0;
    this.history.clear();
    this.rewinding = false;
    this.recordInterval = HISTORY_SNAPSHOT_INTERVAL;
    this.lastRecordedStage = null;
    this.skipping = null;
    this.skipBoost = 0;
    this.clock.setBoostRate(0);
    this.recordAccumulator = 0;
  }

  /** Release the underlying kernel; the runner is unusable afterwards. */
  dispose(): void {
    this.kernel.dispose();
  }

  /** Assemble the renderer-facing snapshot from the kernel's current buffers. */
  private buildState(stage: LifecycleStage): RenderState {
    const particles = this.kernel.getParticleBuffer();
    const bodies = this.kernel.getBodyBuffer();
    const attractors = this.kernel.getAttractorBuffer();
    return {
      particles,
      particleCount: Math.floor(particles.length / PARTICLE_STRIDE),
      bodies,
      bodyCount: Math.floor(bodies.length / BODY_STRIDE),
      attractors,
      attractorCount: this.kernel.attractorCount(),
      stage,
      stageProgress: this.progress,
      // The STAR's mass, not the cloud's — the renderer and every label describe
      // the object at the centre, which only ever assembles part of the cloud.
      mass: this.starMass,
      cloudMass: this.config.mass,
      cloudExtent: this.config.cloudExtent,
      // Let the renderer freeze its time-driven effects in step with the sim.
      paused: this.clock.paused,
      composition: this.config.composition,
      // Read from the kernel, which owns the constant — the host deliberately
      // keeps no copy of the simulation's gravitational parameter.
      mu: this.kernel.orbitalMu(),
      remnant: stage === LifecycleStage.Remnant ? this.remnantType : null,
      supernova: this.supernova,
    };
  }
}

/**
 * Deep-copy a {@link RenderState} for history recording. The particle/body/
 * attractor buffers are (for the WASM kernel) live views into linear memory that
 * mutate every step, so they MUST be copied out; the scalar fields are copied by
 * value.
 *
 * `simDt` is a per-frame delta (not a state snapshot) and must NOT be copied
 * into history so that replay frames always expose `simDt` as *absent* (not
 * even `undefined`), which the renderer treats as 0 — moons and spin stay
 * frozen while scrubbing (§3.4).
 *
 * Under `exactOptionalPropertyTypes` the only way to guarantee absence is to
 * destructure `simDt` out before spreading the rest.
 */
function cloneRenderState(state: RenderState): RenderState {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { simDt: _simDt, ...rest } = state;
  return {
    ...rest,
    particles: state.particles.slice(0, state.particleCount * PARTICLE_STRIDE),
    bodies: state.bodies.slice(0, state.bodyCount * BODY_STRIDE),
    attractors: state.attractors.slice(0, state.attractorCount * ATTRACTOR_STRIDE),
    composition: { ...state.composition },
    // simDt intentionally absent — never persisted in history snapshots
  };
}
