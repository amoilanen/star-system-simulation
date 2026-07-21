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
import { BODY_STRIDE, PARTICLE_STRIDE, type PhysicsKernel } from '../sim/PhysicsKernel';
import { stageDurations } from '../sim/stages';
import type { RenderState } from '../render/SceneManager';

/** Default dust-particle count requested from the kernel (kernel may cap it). */
export const DEFAULT_PARTICLE_COUNT = 4000;

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
  private readonly durations: Readonly<Record<LifecycleStage, number>>;
  private readonly remnantType: RemnantType;

  /** Currently tracked lifecycle stage (mirrors the kernel's stage). */
  private stage: LifecycleStage = LifecycleStage.DustCloud;
  /** Sim seconds elapsed within {@link stage}, for smooth visual progress. */
  private elapsedInStage = 0;

  constructor(
    config: SimulationConfig,
    kernel: PhysicsKernel,
    options: SimulationRunnerOptions = {},
  ) {
    this.config = config;
    this.kernel = kernel;
    this.particleCount = options.particleCount ?? DEFAULT_PARTICLE_COUNT;
    this.clock = options.clock ?? new Clock({ pace: config.pace, ...options.clockOptions });
    this.durations = stageDurations(config.mass, config.composition);
    const model = options.fateModel ?? defaultFateModel;
    this.remnantType = model.determineFate(config.mass, config.composition).remnant;

    this.kernel.init({ config, particleCount: this.particleCount });
  }

  /** The lifecycle stage the simulation is currently in. */
  get currentStage(): LifecycleStage {
    return this.stage;
  }

  /**
   * Advance the simulation by `realDtSeconds` of wall-clock time: scale it
   * through the {@link Clock} (0 while paused, A6), step the kernel, track the
   * lifecycle stage + progress, and return the renderable snapshot plus the
   * events emitted this step.
   */
  tick(realDtSeconds: number): RunnerTick {
    const simDt = this.clock.advance(realDtSeconds);
    const { events, stage } = this.kernel.step(simDt);
    this.trackStage(stage, simDt);
    return { state: this.buildState(stage), events };
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
    this.elapsedInStage = 0;
  }

  /** Release the underlying kernel; the runner is unusable afterwards. */
  dispose(): void {
    this.kernel.dispose();
  }

  /** Update the tracked stage + within-stage elapsed time from a step result. */
  private trackStage(stage: LifecycleStage, simDt: number): void {
    if (stage !== this.stage) {
      this.stage = stage;
      this.elapsedInStage = 0;
    } else if (Number.isFinite(simDt) && simDt > 0) {
      this.elapsedInStage += simDt;
    }
  }

  /** Normalized 0..1 progress through the current stage (1 for terminal stage). */
  private stageProgress(): number {
    const duration = this.durations[this.stage];
    if (!Number.isFinite(duration) || duration <= 0) {
      return 1;
    }
    return Math.min(1, Math.max(0, this.elapsedInStage / duration));
  }

  /** Assemble the renderer-facing snapshot from the kernel's current buffers. */
  private buildState(stage: LifecycleStage): RenderState {
    const particles = this.kernel.getParticleBuffer();
    const bodies = this.kernel.getBodyBuffer();
    return {
      particles,
      particleCount: Math.floor(particles.length / PARTICLE_STRIDE),
      bodies,
      bodyCount: Math.floor(bodies.length / BODY_STRIDE),
      stage,
      stageProgress: this.stageProgress(),
      mass: this.config.mass,
      remnant: stage === LifecycleStage.Remnant ? this.remnantType : null,
    };
  }
}
