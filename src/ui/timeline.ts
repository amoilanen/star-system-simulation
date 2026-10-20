// HUD timeline model: where the system is in its life, and how long the
// current stage REALLY lasts. Pure and DOM-free; the Hud renders it.
//
// The strip's segments are sized by how long each stage takes ON SCREEN under
// the adaptive warp (that is what the viewer experiences), while the caption
// states the stage's TRUE duration — so the compression is never hidden.

import { LifecycleStage } from '../config/fateModel';
import { STAGE_ORDER, UNIVERSE_AGE_YEARS } from '../sim/stages';
import { simSecondsToYears } from '../sim/timeFormat';

/** Relative strip width of each stage (≈ its on-screen share of the run). */
export const TIMELINE_WEIGHTS: Readonly<Record<LifecycleStage, number>> = {
  [LifecycleStage.DustCloud]: 1,
  [LifecycleStage.ProtostarCoalescence]: 1,
  [LifecycleStage.FusionIgnition]: 1,
  [LifecycleStage.MainSequence]: 6,
  [LifecycleStage.RedGiant]: 3,
  [LifecycleStage.Death]: 1,
  [LifecycleStage.Remnant]: 2,
};

/** Display state of one strip segment. */
export type SegmentState = 'done' | 'current' | 'future' | 'absent';

export interface TimelineSegment {
  stage: LifecycleStage;
  state: SegmentState;
  /** 0..1 fill of the segment (1 for done, progress for current). */
  fill: number;
  /** Relative width. */
  weight: number;
  /** True duration of the stage in years (Infinity for the remnant). */
  years: number;
}

export interface TimelineView {
  segments: TimelineSegment[];
  /** True duration of the current stage, in years (Infinity = forever). */
  currentYears: number;
  /** Whether the current stage outlasts the present age of the universe. */
  beyondUniverseAge: boolean;
}

/** The stages a substellar object never has. */
const STELLAR_ONLY: ReadonlySet<LifecycleStage> = new Set([
  LifecycleStage.MainSequence,
  LifecycleStage.RedGiant,
  LifecycleStage.Death,
]);

/** Sim seconds → years, keeping an endless stage endless. */
function toYears(seconds: number): number {
  return seconds === Infinity ? Infinity : simSecondsToYears(seconds);
}

/** Build the timeline view for the current state. Pure. */
export function timelineView(
  stage: LifecycleStage,
  progress: number,
  durations: Readonly<Record<LifecycleStage, number>>,
  substellar: boolean,
): TimelineView {
  const p = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const segments = STAGE_ORDER.map((s): TimelineSegment => {
    const years = toYears(durations[s]);
    let state: SegmentState;
    if (substellar && STELLAR_ONLY.has(s)) {
      state = 'absent';
    } else if (s < stage) {
      state = 'done';
    } else if (s === stage) {
      state = 'current';
    } else {
      state = 'future';
    }
    const fill = state === 'done' ? 1 : state === 'current' ? p : 0;
    return { stage: s, state, fill, weight: TIMELINE_WEIGHTS[s], years };
  });
  const currentYears = toYears(durations[stage]);
  return {
    segments,
    currentYears,
    beyondUniverseAge: Number.isFinite(currentYears) && currentYears > UNIVERSE_AGE_YEARS,
  };
}
