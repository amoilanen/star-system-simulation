import { describe, it, expect } from 'vitest';
import {
  Clock,
  paceToRate,
  DEFAULT_NEAR_REAL_RATE,
  DEFAULT_LIFECYCLE_SIM_SECONDS,
  DEFAULT_FULL_CYCLE_REAL_SECONDS,
} from '../../src/sim/Clock';

describe('paceToRate', () => {
  const near = 1;
  const lifecycle = 6000;
  const fullCycle = 60;
  const fast = lifecycle / fullCycle; // 100

  it('maps pace=0 to the near-real rate', () => {
    expect(paceToRate(0, near, lifecycle, fullCycle)).toBeCloseTo(near, 10);
  });

  it('maps pace=1 to the full-cycle-in-~1-minute rate', () => {
    expect(paceToRate(1, near, lifecycle, fullCycle)).toBeCloseTo(fast, 6);
  });

  it('interpolates geometrically (monotonic increasing across the range)', () => {
    const mid = paceToRate(0.5, near, lifecycle, fullCycle);
    expect(mid).toBeGreaterThan(near);
    expect(mid).toBeLessThan(fast);
    // Geometric midpoint is sqrt(near*fast), not the arithmetic mean.
    expect(mid).toBeCloseTo(Math.sqrt(near * fast), 6);
  });

  it('clamps out-of-range pace to the endpoints', () => {
    expect(paceToRate(-1, near, lifecycle, fullCycle)).toBeCloseTo(near, 10);
    expect(paceToRate(2, near, lifecycle, fullCycle)).toBeCloseTo(fast, 6);
  });
});

describe('Clock pace endpoints', () => {
  it('pace=0 yields the near-real rate with defaults', () => {
    const clock = new Clock({ pace: 0 });
    expect(clock.simSecondsPerRealSecond()).toBeCloseTo(DEFAULT_NEAR_REAL_RATE, 6);
  });

  it('pace=1 compresses a full lifecycle into ~1 minute', () => {
    const clock = new Clock({ pace: 1 });
    const expectedRate = DEFAULT_LIFECYCLE_SIM_SECONDS / DEFAULT_FULL_CYCLE_REAL_SECONDS;
    expect(clock.simSecondsPerRealSecond()).toBeCloseTo(expectedRate, 0);

    // Advancing over the full-cycle real duration elapses ~one lifecycle.
    const simDt = clock.advance(DEFAULT_FULL_CYCLE_REAL_SECONDS);
    expect(simDt).toBeCloseTo(DEFAULT_LIFECYCLE_SIM_SECONDS, 0);
  });
});

describe('Clock pause', () => {
  it('yields dt=0 and a frozen rate while paused, without losing sim time', () => {
    const clock = new Clock({ pace: 1 });
    clock.advance(1); // accumulate some sim time
    const before = clock.simTime;
    expect(before).toBeGreaterThan(0);

    clock.pause();
    expect(clock.paused).toBe(true);
    expect(clock.simSecondsPerRealSecond()).toBe(0);
    expect(clock.advance(10)).toBe(0);
    expect(clock.simTime).toBe(before);

    clock.resume();
    expect(clock.paused).toBe(false);
    expect(clock.advance(1)).toBeGreaterThan(0);
    expect(clock.simTime).toBeGreaterThan(before);
  });
});

describe('Clock live pace change', () => {
  it('applies a new pace immediately', () => {
    const clock = new Clock({ pace: 0 });
    const slowDt = clock.advance(1);

    clock.setPace(1);
    const fastDt = clock.advance(1);

    expect(fastDt).toBeGreaterThan(slowDt);
    expect(clock.pace).toBe(1);
  });

  it('clamps pace assignments to [0, 1]', () => {
    const clock = new Clock();
    clock.setPace(5);
    expect(clock.pace).toBe(1);
    clock.setPace(-3);
    expect(clock.pace).toBe(0);
  });
});

describe('Clock advance guards', () => {
  it('ignores non-positive and non-finite real dt', () => {
    const clock = new Clock({ pace: 1 });
    expect(clock.advance(0)).toBe(0);
    expect(clock.advance(-5)).toBe(0);
    expect(clock.advance(Number.NaN)).toBe(0);
    expect(clock.advance(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clock.simTime).toBe(0);
  });

  it('reset returns sim time to 0 but preserves pace', () => {
    const clock = new Clock({ pace: 1 });
    clock.advance(1);
    expect(clock.simTime).toBeGreaterThan(0);
    clock.reset();
    expect(clock.simTime).toBe(0);
    expect(clock.pace).toBe(1);
  });
});
