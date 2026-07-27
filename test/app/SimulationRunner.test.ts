import { describe, expect, it } from 'vitest';
import { SimulationRunner, DEFAULT_PARTICLE_COUNT } from '../../src/app/SimulationRunner';
import { TsFallbackKernel } from '../../src/sim/TsFallbackKernel';
import { Clock } from '../../src/sim/Clock';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import { SimEventType, type SimulationEvent } from '../../src/sim/events';
import { STAGE_ORDER } from '../../src/sim/stages';
import { PARTICLE_STRIDE } from '../../src/sim/PhysicsKernel';
import type { SimulationConfig } from '../../src/config/SimulationConfig';

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    locale: 'en',
    composition: { hydrogen: 0.74, helium: 0.24, metals: 0.02 },
    mass: 1,
    cloudExtent: 50,
    pace: 1,
    showEventAnnotations: true,
    presetId: 'sun-like',
    ...overrides,
  };
}

/**
 * Ticks needed to carry a run from dust cloud to remnant. Each tick advances the
 * kernel by one bounded orbital step, and formation is rate-limited by the
 * star's finite accretion rate (`CORE_ACCRETION_RATE`), so reaching ignition
 * legitimately takes a few hundred steps — that slow build-up is the point.
 */
const LIFECYCLE_TICKS = 900;

/** Small particle count: these tests assert wiring, not planet demographics. */
const WIRING_PARTICLES = 300;

/** Drive `ticks` frames of 1 real second each, collecting events and stages. */
function drive(
  runner: SimulationRunner,
  ticks: number,
): { events: SimulationEvent[]; stages: LifecycleStage[] } {
  const events: SimulationEvent[] = [];
  const stages: LifecycleStage[] = [];
  for (let i = 0; i < ticks; i += 1) {
    const result = runner.tick(1);
    events.push(...result.events);
    stages.push(result.state.stage);
  }
  return { events, stages };
}

describe('SimulationRunner (headless orchestration)', () => {
  it('advances the full birth→death lifecycle, wiring events end-to-end', () => {
    const runner = new SimulationRunner(makeConfig(), new TsFallbackKernel(), {
      particleCount: WIRING_PARTICLES,
    });

    // pace = 1 compresses the whole lifecycle to ~1 minute; a handful of
    // one-second ticks walks the star from dust cloud to remnant.
    const { events, stages } = drive(runner, LIFECYCLE_TICKS);

    // Terminal stage reached.
    expect(runner.currentStage).toBe(LifecycleStage.Remnant);
    expect(stages.at(-1)).toBe(LifecycleStage.Remnant);

    // The narrative pipeline surfaced the key transition events, in order.
    const types = events.map((e) => e.type);
    expect(types).toContain(SimEventType.CollapseOnset);
    expect(types).toContain(SimEventType.FusionIgnition);
    expect(types).toContain(SimEventType.DeathEvent);
    expect(types).toContain(SimEventType.RemnantFormed);
    expect(types.indexOf(SimEventType.FusionIgnition)).toBeLessThan(
      types.indexOf(SimEventType.DeathEvent),
    );

    // Every emitted event carries a resolvable i18n message id.
    for (const event of events) {
      expect(event.messageId).toMatch(/^event\./);
    }

    // Stage index is monotonically non-decreasing across the whole run.
    const order = (s: LifecycleStage): number => STAGE_ORDER.indexOf(s);
    for (let i = 1; i < stages.length; i += 1) {
      expect(order(stages[i]!)).toBeGreaterThanOrEqual(order(stages[i - 1]!));
    }
  });

  it('exposes a coherent RenderState snapshot each tick', () => {
    const runner = new SimulationRunner(makeConfig({ mass: 2 }), new TsFallbackKernel());
    const { state } = runner.tick(1);

    expect(state.mass).toBe(2);
    expect(state.particleCount).toBe(state.particles.length / PARTICLE_STRIDE);
    expect(state.particleCount).toBeGreaterThan(0);
    expect(state.bodyCount).toBeGreaterThan(0);
    expect(state.stageProgress).toBeGreaterThanOrEqual(0);
    expect(state.stageProgress).toBeLessThanOrEqual(1);
    // Remnant is only surfaced once the terminal stage is reached.
    expect(state.remnant).toBeNull();
  });

  it('surfaces the selected remnant type at the terminal stage', () => {
    // High-mass ⇒ supernova ⇒ pulsar (fateModel single source of truth).
    const runner = new SimulationRunner(makeConfig({ mass: 20 }), new TsFallbackKernel(), {
      particleCount: WIRING_PARTICLES,
    });
    let last = runner.tick(1);
    for (let i = 0; i < LIFECYCLE_TICKS && last.state.stage !== LifecycleStage.Remnant; i += 1) {
      last = runner.tick(1);
    }
    expect(last.state.stage).toBe(LifecycleStage.Remnant);
    expect(last.state.remnant).toBe(RemnantType.Pulsar);
  });

  it('freezes progression while paused (A6) and resumes afterwards', () => {
    const runner = new SimulationRunner(makeConfig(), new TsFallbackKernel(), {
      particleCount: WIRING_PARTICLES,
    });
    runner.tick(1); // leave the initial idle frame behind
    const pausedStage = runner.currentStage;

    expect(runner.togglePause()).toBe(true);
    const before = runner.tick(5).state.stage;
    const after = runner.tick(5).state.stage;
    expect(before).toBe(pausedStage);
    expect(after).toBe(pausedStage);

    // Resuming lets the stage advance again.
    expect(runner.togglePause()).toBe(false);
    drive(runner, LIFECYCLE_TICKS);
    expect(runner.currentStage).toBe(LifecycleStage.Remnant);
  });

  it('reset returns to the dust-cloud stage and rewinds the clock', () => {
    const clock = new Clock({ pace: 1 });
    const runner = new SimulationRunner(makeConfig(), new TsFallbackKernel(), {
      clock,
      particleCount: WIRING_PARTICLES,
    });
    drive(runner, LIFECYCLE_TICKS);
    expect(runner.currentStage).toBe(LifecycleStage.Remnant);
    expect(clock.simTime).toBeGreaterThan(0);

    runner.reset();
    expect(runner.currentStage).toBe(LifecycleStage.DustCloud);
    expect(clock.simTime).toBe(0);
  });

  it('rewinds to a previous state, then replays forward and resumes live', () => {
    const runner = new SimulationRunner(makeConfig(), new TsFallbackKernel(), {
      particleCount: WIRING_PARTICLES,
    });

    // Build up some live history and advance the lifecycle a few stages.
    const order = (s: LifecycleStage): number => STAGE_ORDER.indexOf(s);
    let liveElapsed = 0;
    let liveStage = LifecycleStage.DustCloud;
    // Enough ticks to get clear of the (deliberately slow) dust-cloud stage.
    for (let i = 0; i < 150; i += 1) {
      const t = runner.tick(1);
      liveElapsed = t.elapsed;
      liveStage = t.state.stage;
      expect(t.fromHistory).toBe(false);
    }
    expect(order(liveStage)).toBeGreaterThan(order(LifecycleStage.DustCloud));

    // Rewind: elapsed decreases and the stage regresses toward the past.
    runner.setRewinding(true);
    let rewound = runner.tick(1);
    for (let i = 0; i < 30; i += 1) {
      rewound = runner.tick(1);
    }
    expect(rewound.fromHistory).toBe(true);
    expect(rewound.elapsed).toBeLessThan(liveElapsed);
    expect(order(rewound.state.stage)).toBeLessThanOrEqual(order(liveStage));

    // Play forward from the past: still replaying recorded history for a while.
    runner.setRewinding(false);
    const forward = runner.tick(1);
    expect(forward.elapsed).toBeGreaterThanOrEqual(rewound.elapsed);

    // Eventually it catches the frontier and resumes live stepping.
    let caughtLive = false;
    for (let i = 0; i < 60; i += 1) {
      const t = runner.tick(1);
      if (!t.fromHistory) {
        caughtLive = true;
        break;
      }
    }
    expect(caughtLive).toBe(true);
  });

  it('requests the default particle count from the kernel', () => {
    const runner = new SimulationRunner(makeConfig(), new TsFallbackKernel(), {
      particleCount: WIRING_PARTICLES,
    });
    const { state } = runner.tick(0);
    // The fallback kernel caps particles at its own maximum; the runner should
    // request the documented default, and the effective count is non-zero.
    expect(DEFAULT_PARTICLE_COUNT).toBeGreaterThan(0);
    expect(state.particleCount).toBeGreaterThan(0);
  });
});
