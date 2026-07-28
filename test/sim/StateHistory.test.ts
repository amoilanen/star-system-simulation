import { describe, expect, it } from 'vitest';
import { StateHistory, type HistoryFrame } from '../../src/sim/StateHistory';
import { LifecycleStage } from '../../src/config/fateModel';
import type { RenderState } from '../../src/render/SceneManager';

/** A minimal RenderState stand-in carrying a marker in `stageProgress`. */
function fakeState(marker: number): RenderState {
  return {
    particles: new Float32Array(0),
    particleCount: 0,
    bodies: new Float32Array(0),
    bodyCount: 0,
    stage: LifecycleStage.MainSequence,
    stageProgress: marker,
    cloudMass: 3.2,
    mass: 1,
    composition: { hydrogen: 0.74, helium: 0.24, metals: 0.02 },
    mu: 1,
    remnant: null,
  };
}

function frame(marker: number, elapsed: number): HistoryFrame {
  return { state: fakeState(marker), elapsed };
}

describe('StateHistory (DVR playback)', () => {
  it('starts empty and reports live', () => {
    const h = new StateHistory(10);
    expect(h.size).toBe(0);
    expect(h.isLive).toBe(true);
    expect(h.currentFrame()).toBeNull();
    expect(h.seek(-5)).toBeNull();
  });

  it('records frames and keeps the cursor at the live frontier', () => {
    const h = new StateHistory(10);
    h.record(frame(0, 0));
    h.record(frame(1, 100));
    h.record(frame(2, 200));
    expect(h.size).toBe(3);
    expect(h.isLive).toBe(true);
    expect(h.currentFrame()?.elapsed).toBe(200);
  });

  it('seeks backward to a previous state and forward again', () => {
    const h = new StateHistory(10);
    for (let i = 0; i < 5; i += 1) {
      h.record(frame(i, i * 100));
    }
    // Rewind two frames.
    const back = h.seek(-2);
    expect(back?.elapsed).toBe(200);
    expect(h.isLive).toBe(false);
    // Forward one frame.
    const fwd = h.seek(1);
    expect(fwd?.elapsed).toBe(300);
    // Forward past the frontier lands (and stays) at the newest frame.
    h.seek(10);
    expect(h.isLive).toBe(true);
    expect(h.currentFrame()?.elapsed).toBe(400);
  });

  it('clamps at the oldest retained frame', () => {
    const h = new StateHistory(10);
    for (let i = 0; i < 3; i += 1) {
      h.record(frame(i, i * 100));
    }
    h.seek(-100);
    expect(h.atStart).toBe(true);
    expect(h.currentFrame()?.elapsed).toBe(0);
  });

  it('drops the oldest frame past capacity (bounded ring)', () => {
    const h = new StateHistory(3);
    for (let i = 0; i < 6; i += 1) {
      h.record(frame(i, i * 100));
    }
    expect(h.size).toBe(3);
    // Only the three newest survive (300, 400, 500).
    const oldest = h.seek(-100);
    expect(oldest?.elapsed).toBe(300);
  });

  it('clear() empties the history and resets to live', () => {
    const h = new StateHistory(10);
    h.record(frame(0, 0));
    h.record(frame(1, 100));
    h.clear();
    expect(h.size).toBe(0);
    expect(h.isLive).toBe(true);
    expect(h.currentFrame()).toBeNull();
  });
});
