import { describe, it, expect } from 'vitest';
import { LifecycleStage } from '../../src/config/fateModel';
import { stageDurations } from '../../src/sim/stages';
import { timelineView } from '../../src/ui/timeline';

const SOLAR = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };

describe('timelineView', () => {
  it('marks past stages done, fills the current one and leaves the rest ahead', () => {
    const view = timelineView(LifecycleStage.MainSequence, 0.4, stageDurations(1, SOLAR), false);
    const byStage = new Map(view.segments.map((s) => [s.stage, s]));
    expect(byStage.get(LifecycleStage.FusionIgnition)!.state).toBe('done');
    expect(byStage.get(LifecycleStage.FusionIgnition)!.fill).toBe(1);
    expect(byStage.get(LifecycleStage.MainSequence)!.state).toBe('current');
    expect(byStage.get(LifecycleStage.MainSequence)!.fill).toBeCloseTo(0.4, 10);
    expect(byStage.get(LifecycleStage.RedGiant)!.state).toBe('future');
    // The Sun's main sequence: ~11 Gyr, shorter than the universe's age.
    expect(view.currentYears / 1e9).toBeGreaterThan(9);
    expect(view.beyondUniverseAge).toBe(false);
  });

  it('flags a red dwarf whose main sequence outlasts the universe so far', () => {
    const view = timelineView(LifecycleStage.MainSequence, 0, stageDurations(0.2, SOLAR), false);
    expect(view.beyondUniverseAge).toBe(true);
  });

  it('drops the stages a brown dwarf never has, and calls its remnant forever', () => {
    const view = timelineView(LifecycleStage.Remnant, 0.5, stageDurations(0.04, SOLAR), true);
    const absent = view.segments.filter((s) => s.state === 'absent').map((s) => s.stage);
    expect(absent).toEqual([
      LifecycleStage.MainSequence,
      LifecycleStage.RedGiant,
      LifecycleStage.Death,
    ]);
    expect(view.currentYears).toBe(Infinity);
    expect(view.beyondUniverseAge).toBe(false);
  });
});
