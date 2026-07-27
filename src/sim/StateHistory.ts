// DVR-style playback history for the simulation (time-travel / rewind, FR-5+).
//
// The emergent accretion model is order-dependent and not reversible, so instead
// of re-integrating the physics backwards we record periodic SNAPSHOTS of the
// renderable state during live play and scrub through them. Rewinding therefore
// restores the nearest recorded state ("not an exact replay, but to a previous
// state"), while playing forward from the past replays recorded frames until it
// catches the live frontier, after which live stepping resumes.
//
// This module is pure/DOM-free so the cursor logic is unit-testable; the runner
// owns the copies and drives it each frame.

import type { RenderState } from '../render/SceneManager';

/** A single recorded frame: a deep-copied render snapshot + its elapsed time. */
export interface HistoryFrame {
  /** Deep-copied render state (buffers already copied out of kernel memory). */
  state: RenderState;
  /** Physically meaningful elapsed sim seconds at capture (for the HUD). */
  elapsed: number;
}

/** Clamp a value into the inclusive `[min, max]` range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * A bounded ring of recorded frames with a floating playback cursor. The cursor
 * indexes {@link frames} (0 = oldest retained, length−1 = live frontier). New
 * frames are only appended while playing live; seeking never mutates the frames.
 */
export class StateHistory {
  private frames: HistoryFrame[] = [];
  private cursorValue = 0;

  constructor(private readonly capacity: number) {}

  /** Number of retained frames. */
  get size(): number {
    return this.frames.length;
  }

  /** Current (possibly fractional) cursor position in frame-index space. */
  get cursor(): number {
    return this.cursorValue;
  }

  /** Whether the cursor is at (or past) the live frontier. */
  get isLive(): boolean {
    return this.frames.length === 0 || this.cursorValue >= this.frames.length - 1 - 1e-9;
  }

  /** Whether the cursor has reached the oldest retained frame. */
  get atStart(): boolean {
    return this.frames.length > 0 && this.cursorValue <= 1e-9;
  }

  /**
   * Append a new frontier frame (during live play) and snap the cursor to it.
   * Drops the oldest frame when over capacity, shifting the cursor to match.
   */
  record(frame: HistoryFrame): void {
    this.frames.push(frame);
    if (this.frames.length > this.capacity) {
      this.frames.shift();
    }
    this.cursorValue = this.frames.length - 1;
  }

  /**
   * Move the cursor by `delta` frames (negative = back in time), clamped to the
   * retained range, and return the frame it now points at (or null if empty).
   */
  seek(delta: number): HistoryFrame | null {
    if (this.frames.length === 0) {
      return null;
    }
    this.cursorValue = clamp(this.cursorValue + delta, 0, this.frames.length - 1);
    return this.currentFrame();
  }

  /** The frame under the cursor (nearest recorded state), or null if empty. */
  currentFrame(): HistoryFrame | null {
    if (this.frames.length === 0) {
      return null;
    }
    const idx = Math.round(clamp(this.cursorValue, 0, this.frames.length - 1));
    return this.frames[idx] ?? null;
  }

  /** Discard all history and reset the cursor. */
  clear(): void {
    this.frames = [];
    this.cursorValue = 0;
  }
}
