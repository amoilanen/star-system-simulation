import { describe, it, expect } from 'vitest';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import { stageDurations } from '../../src/sim/stages';
import {
  TIME_WARP,
  adaptiveRate,
  isSkippable,
  remnantSpanYears,
  skipRate,
  speedMultiplier,
  type WarpContext,
} from '../../src/sim/timeWarp';
import { SECONDS_PER_YEAR } from '../../src/sim/timeFormat';

const SOLAR = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };

function context(mass: number, stage: LifecycleStage, stageProgress = 0): WarpContext {
  return {
    stage,
    stageProgress,
    durations: stageDurations(mass, SOLAR),
    remnant: mass >= 8 ? RemnantType.NeutronStar : RemnantType.WhiteDwarf,
    supernova: mass >= 8,
  };
}

describe('speedMultiplier', () => {
  it('spans ÷8 … 1× … ×8 geometrically', () => {
    expect(speedMultiplier(0)).toBeCloseTo(1 / 8, 10);
    expect(speedMultiplier(0.5)).toBeCloseTo(1, 10);
    expect(speedMultiplier(1)).toBeCloseTo(8, 10);
    expect(speedMultiplier(Number.NaN)).toBeCloseTo(1, 10);
  });
});

describe('adaptiveRate', () => {
  it('fits any star’s main sequence into the same wall-clock budget', () => {
    for (const mass of [0.2, 1, 3, 20, 60]) {
      const ctx = context(mass, LifecycleStage.MainSequence);
      const wall = ctx.durations[LifecycleStage.MainSequence] / adaptiveRate(ctx, 0.5);
      expect(wall, `${mass} M☉`).toBeCloseTo(TIME_WARP.mainSequenceSeconds, 6);
    }
  });

  it('scales the long stages with the speed setting', () => {
    const ctx = context(1, LifecycleStage.RedGiant);
    expect(adaptiveRate(ctx, 1) / adaptiveRate(ctx, 0.5)).toBeCloseTo(8, 6);
  });

  it('never runs slower than the floor that keeps the orbital clock saturated', () => {
    const floor = TIME_WARP.minYearsPerSecond * SECONDS_PER_YEAR;
    for (const stage of [
      LifecycleStage.DustCloud,
      LifecycleStage.FusionIgnition,
      LifecycleStage.Death,
      LifecycleStage.Remnant,
    ]) {
      expect(adaptiveRate(context(20, stage), 0)).toBeGreaterThanOrEqual(floor);
    }
  });

  it('leaves the death to the kernel: fast enough for its step cap to engage, at any speed', () => {
    for (const mass of [1, 20]) {
      const ctx = context(mass, LifecycleStage.Death);
      const duration = ctx.durations[LifecycleStage.Death];
      // One 60 fps frame must cover more than 1/240th of the death.
      expect(adaptiveRate(ctx, 0) / 60).toBeGreaterThan(duration / 240);
      expect(adaptiveRate(ctx, 0)).toBe(adaptiveRate(ctx, 1));
    }
  });

  it('plays a remnant’s surroundings over their real timescale', () => {
    expect(remnantSpanYears(RemnantType.WhiteDwarf, false)).toBeLessThan(
      remnantSpanYears(RemnantType.NeutronStar, true),
    );
    expect(remnantSpanYears(RemnantType.BrownDwarf, false)).toBeGreaterThan(1e8);
  });
});

describe('skipRate', () => {
  it('crosses what is left of the stage in ~1.5 s', () => {
    const ctx = context(1, LifecycleStage.MainSequence, 0.25);
    const remaining = ctx.durations[LifecycleStage.MainSequence] * 0.75;
    expect(remaining / skipRate(ctx)).toBeCloseTo(TIME_WARP.skipSeconds, 6);
  });

  it('only applies to the long stellar stages', () => {
    expect(isSkippable(LifecycleStage.MainSequence)).toBe(true);
    expect(isSkippable(LifecycleStage.RedGiant)).toBe(true);
    for (const stage of [
      LifecycleStage.DustCloud,
      LifecycleStage.ProtostarCoalescence,
      LifecycleStage.FusionIgnition,
      LifecycleStage.Death,
      LifecycleStage.Remnant,
    ]) {
      expect(isSkippable(stage)).toBe(false);
      expect(skipRate(context(1, stage))).toBe(0);
    }
  });
});
