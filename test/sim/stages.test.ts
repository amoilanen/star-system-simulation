import { describe, it, expect } from 'vitest';
import { StageMachine, STAGE_ORDER, STAGE_ENTRY_EVENT, stageDurations } from '../../src/sim/stages';
import { EventBus, SimEventType, type SimulationEvent } from '../../src/sim/events';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import { CATALOGS } from '../../src/i18n/i18n';
import type { CloudComposition, SimulationConfig } from '../../src/config/SimulationConfig';

const SOLAR_COMPOSITION: CloudComposition = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    locale: 'en',
    composition: SOLAR_COMPOSITION,
    mass: 1,
    cloudExtent: 50,
    pace: 0.5,
    showEventAnnotations: true,
    ...overrides,
  };
}

/** Run the FSM to completion by feeding one huge dt and collect emitted events. */
function runToRemnant(config: SimulationConfig): SimulationEvent[] {
  const bus = new EventBus();
  const events: SimulationEvent[] = [];
  bus.subscribe((e) => events.push(e));
  const machine = new StageMachine(config, bus);
  // A dt far larger than any lifecycle guarantees we cross every boundary.
  machine.update(1e30);
  expect(machine.isTerminal).toBe(true);
  return events;
}

describe('STAGE_ORDER', () => {
  it('walks the full lifecycle in the spec order', () => {
    expect(STAGE_ORDER).toEqual([
      LifecycleStage.DustCloud,
      LifecycleStage.ProtostarCoalescence,
      LifecycleStage.FusionIgnition,
      LifecycleStage.MainSequence,
      LifecycleStage.RedGiant,
      LifecycleStage.Death,
      LifecycleStage.Remnant,
    ]);
  });
});

describe('stageDurations', () => {
  it('gives every stage a positive duration and a terminal remnant', () => {
    const d = stageDurations(1, SOLAR_COMPOSITION);
    for (const stage of STAGE_ORDER.filter((s) => s !== LifecycleStage.Remnant)) {
      expect(d[stage]).toBeGreaterThan(0);
      expect(Number.isFinite(d[stage])).toBe(true);
    }
    expect(d[LifecycleStage.Remnant]).toBe(Infinity);
  });

  it('makes massive stars live much shorter than low-mass ones (M^-2.5)', () => {
    const low = stageDurations(0.5, SOLAR_COMPOSITION)[LifecycleStage.MainSequence];
    const sun = stageDurations(1, SOLAR_COMPOSITION)[LifecycleStage.MainSequence];
    const high = stageDurations(20, SOLAR_COMPOSITION)[LifecycleStage.MainSequence];
    expect(low).toBeGreaterThan(sun);
    expect(sun).toBeGreaterThan(high);
  });
});

describe('StageMachine transitions', () => {
  it('starts in DustCloud and reaches Remnant', () => {
    const machine = new StageMachine(makeConfig(), new EventBus());
    expect(machine.currentStage).toBe(LifecycleStage.DustCloud);
    expect(machine.isTerminal).toBe(false);
    machine.update(1e30);
    expect(machine.currentStage).toBe(LifecycleStage.Remnant);
    expect(machine.isTerminal).toBe(true);
  });

  it('emits exactly one event per transition, in stage-entry order', () => {
    const events = runToRemnant(makeConfig({ mass: 1 }));
    expect(events.map((e) => e.type)).toEqual([
      SimEventType.CollapseOnset, // → ProtostarCoalescence
      SimEventType.ProtostarFormed, // → FusionIgnition
      SimEventType.FusionIgnition, // → MainSequence
      SimEventType.RedGiantOnset, // → RedGiant
      SimEventType.DeathEvent, // → Death
      SimEventType.RemnantFormed, // → Remnant
    ]);
    // Six transitions between seven stages ⇒ six events, never duplicated.
    expect(events).toHaveLength(6);
  });

  it('maps each entry event to its stage per STAGE_ENTRY_EVENT', () => {
    const events = runToRemnant(makeConfig());
    const entryStages = STAGE_ORDER.filter((s) => s !== LifecycleStage.DustCloud);
    entryStages.forEach((stage, i) => {
      expect(events[i]?.type).toBe(STAGE_ENTRY_EVENT[stage]);
    });
  });

  it('stamps each event with a valid, translatable messageId', () => {
    const events = runToRemnant(makeConfig());
    for (const event of events) {
      expect(event.messageId).toBeTruthy();
      expect(CATALOGS.en[event.messageId], `en missing ${event.messageId}`).toBeTruthy();
      expect(CATALOGS.fi[event.messageId], `fi missing ${event.messageId}`).toBeTruthy();
    }
  });

  it('stamps events with non-decreasing sim times matching the timeline', () => {
    const config = makeConfig({ mass: 1 });
    const events = runToRemnant(config);
    const durations = stageDurations(config.mass, config.composition);

    // Cumulative sim-time at which the first two stages are entered.
    const afterDust = durations[LifecycleStage.DustCloud];
    const afterProto = afterDust + durations[LifecycleStage.ProtostarCoalescence];
    expect(events[0]?.simTime).toBeCloseTo(afterDust, 3);
    expect(events[1]?.simTime).toBeCloseTo(afterProto, 3);

    const times = events.map((e) => e.simTime);
    for (let i = 1; i < times.length; i += 1) {
      expect(times[i]).toBeGreaterThan(times[i - 1] as number);
    }
  });

  it('advances one boundary at a time when fed small dt increments', () => {
    const config = makeConfig({ mass: 1 });
    const durations = stageDurations(config.mass, config.composition);
    const bus = new EventBus();
    const machine = new StageMachine(config, bus);

    // Feed exactly the DustCloud duration ⇒ transition into ProtostarCoalescence.
    machine.update(durations[LifecycleStage.DustCloud]);
    expect(machine.currentStage).toBe(LifecycleStage.ProtostarCoalescence);
    const drained = bus.drain();
    expect(drained).toHaveLength(1);
    expect(drained[0]?.type).toBe(SimEventType.CollapseOnset);
  });

  it('ignores non-positive or non-finite dt (paused clock, A6)', () => {
    const bus = new EventBus();
    const machine = new StageMachine(makeConfig(), bus);
    machine.update(0);
    machine.update(-5);
    machine.update(Number.NaN);
    machine.update(Number.POSITIVE_INFINITY);
    expect(machine.currentStage).toBe(LifecycleStage.DustCloud);
    expect(machine.elapsedSimTime).toBe(0);
    expect(bus.pending).toBe(0);
  });

  it('reset returns to the initial stage and clears sim time', () => {
    const machine = new StageMachine(makeConfig(), new EventBus());
    machine.update(1e30);
    expect(machine.isTerminal).toBe(true);
    machine.reset();
    expect(machine.currentStage).toBe(LifecycleStage.DustCloud);
    expect(machine.elapsedSimTime).toBe(0);
    expect(machine.isTerminal).toBe(false);
  });
});

describe('death-path selection (FR-4)', () => {
  it('low/intermediate mass emits a quiet white-dwarf death', () => {
    const events = runToRemnant(makeConfig({ mass: 1 }));
    const death = events.find((e) => e.type === SimEventType.DeathEvent);
    const remnant = events.find((e) => e.type === SimEventType.RemnantFormed);
    expect(death?.data).toEqual({ supernova: false });
    expect(remnant?.data).toEqual({ remnant: RemnantType.WhiteDwarf, supernova: false });
  });

  it('high mass emits supernova → neutron star', () => {
    // ~10 M☉ effective → above supernova (8) but below pulsar (12) threshold.
    const events = runToRemnant(makeConfig({ mass: 10 }));
    const death = events.find((e) => e.type === SimEventType.DeathEvent);
    const remnant = events.find((e) => e.type === SimEventType.RemnantFormed);
    expect(death?.data).toEqual({ supernova: true });
    expect(remnant?.data).toEqual({ remnant: RemnantType.NeutronStar, supernova: true });
  });

  it('very high mass emits supernova → pulsar', () => {
    const events = runToRemnant(makeConfig({ mass: 20 }));
    const death = events.find((e) => e.type === SimEventType.DeathEvent);
    const remnant = events.find((e) => e.type === SimEventType.RemnantFormed);
    expect(death?.data).toEqual({ supernova: true });
    expect(remnant?.data).toEqual({ remnant: RemnantType.Pulsar, supernova: true });
  });

  it('exposes the pre-computed fate via fateOutcome', () => {
    const machine = new StageMachine(makeConfig({ mass: 20 }), new EventBus());
    expect(machine.fateOutcome).toEqual({ supernova: true, remnant: RemnantType.Pulsar });
  });
});
