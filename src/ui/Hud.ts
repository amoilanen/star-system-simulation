// Runtime HUD overlay (spec §3.1, FR-5, FR-8, FR-12).
//
// The overlay shown on the run screen: a time-scale (pace) slider, pause/resume
// and reset buttons, zoom in/out controls, and a body-focus selector. It also
// displays the current lifecycle stage and orbiting-body count. Every label is
// resolved from the i18n catalog by stable message id (D5, FR-2) and can be
// re-translated live via {@link Hud.setLocale}.
//
// The HUD is intentionally decoupled from the simulation: it exposes callbacks
// (onPaceChange, onTogglePause, ...) and setters (setStage, setBodyCount,
// setFocusOptions) that the application shell wires to the Clock, camera, and
// kernel in a later step.

import { LifecycleStage } from '../config/fateModel';
import type { Locale } from '../config/SimulationConfig';
import { i18n as sharedI18n, type I18n, type MessageParams } from '../i18n/i18n';
import { formatYears } from '../sim/timeFormat';
import { UNIVERSE_AGE_YEARS } from '../sim/stages';
import type { TimelineView } from './timeline';

/**
 * Single source of truth mapping each {@link LifecycleStage} to its i18n message
 * key. Exhaustive `Record` so a new stage fails to compile until it has a label.
 */
export const STAGE_MESSAGE_IDS: Readonly<Record<LifecycleStage, string>> = {
  [LifecycleStage.DustCloud]: 'stage.dustCloud',
  [LifecycleStage.ProtostarCoalescence]: 'stage.protostarCoalescence',
  [LifecycleStage.FusionIgnition]: 'stage.fusionIgnition',
  [LifecycleStage.MainSequence]: 'stage.mainSequence',
  [LifecycleStage.RedGiant]: 'stage.redGiant',
  [LifecycleStage.Death]: 'stage.death',
  [LifecycleStage.Remnant]: 'stage.remnant',
};

/** One-line explanation of each stage, shown in the timeline's hover legend. */
export const STAGE_LEGEND_IDS: Readonly<Record<LifecycleStage, string>> = {
  [LifecycleStage.DustCloud]: 'stage.legend.dustCloud',
  [LifecycleStage.ProtostarCoalescence]: 'stage.legend.protostarCoalescence',
  [LifecycleStage.FusionIgnition]: 'stage.legend.fusionIgnition',
  [LifecycleStage.MainSequence]: 'stage.legend.mainSequence',
  [LifecycleStage.RedGiant]: 'stage.legend.redGiant',
  [LifecycleStage.Death]: 'stage.legend.death',
  [LifecycleStage.Remnant]: 'stage.legend.remnant',
};

/** A selectable camera-focus target for the HUD dropdown. */
export interface FocusOption {
  /** Stable value passed back to {@link HudOptions.onFocusChange}. */
  value: string;
  /** i18n message id for the option label. */
  labelMessageId: string;
  /** Optional interpolation params for the label (e.g. body id). */
  params?: MessageParams;
}

/** Options for constructing a {@link Hud}. */
export interface HudOptions {
  container: HTMLElement;
  i18n?: I18n;
  locale: Locale;
  /** Initial pace slider value 0..1. Default 0.5. */
  initialPace?: number;
  onPaceChange: (pace: number) => void;
  onTogglePause: () => void;
  /** Toggle rewind (backwards playback); receives the NEW rewinding state. */
  onToggleRewind?: (rewinding: boolean) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFocusChange: (value: string) => void;
  /** Toggle the on-screen body labels; receives the NEW enabled state. */
  onToggleLabels?: (enabled: boolean) => void;
  /** Toggle the orbital-path overlay; receives the NEW enabled state. */
  onToggleOrbits?: (enabled: boolean) => void;
  /** Initial state of the labels checkbox. Default false (uncluttered sky). */
  initialLabels?: boolean;
  /** Initial state of the orbits checkbox. Default false. */
  initialOrbits?: boolean;
  /** Fast-forward through the rest of the current stage. */
  onSkipStage?: () => void;
  /** Toggle the adaptive time warp; receives the NEW enabled state. */
  onToggleAutoWarp?: (enabled: boolean) => void;
  /** Initial state of the auto-warp checkbox. Default true. */
  initialAutoWarp?: boolean;
  /**
   * Jump back to the start of a stage the run has already been through
   * (clicking a past timeline segment). Omit to make the strip read-only.
   */
  onSeekStage?: (stage: LifecycleStage) => void;
}

/** Focus values always present regardless of the current bodies. */
export const FOCUS_STAR = 'star';
export const FOCUS_NONE = 'none';

const BASE_FOCUS_OPTIONS: readonly FocusOption[] = [
  { value: FOCUS_STAR, labelMessageId: 'hud.focus.star' },
  { value: FOCUS_NONE, labelMessageId: 'hud.focus.none' },
];

/** The runtime HUD overlay component. Owns its DOM subtree. */
export class Hud {
  private readonly i18n: I18n;
  private locale: Locale;
  private readonly root: HTMLDivElement;

  private readonly pauseButton: HTMLButtonElement;
  /** Big, unmissable "PAUSED" badge shown while the simulation is frozen. */
  private readonly pausedBadge: HTMLDivElement;
  /** Floating transparent +/− zoom buttons over the scene. */
  private readonly zoomControls: HTMLDivElement;
  /** Whether the frame on screen comes from the recorded past. */
  private replaying = false;
  private rewindButton: HTMLButtonElement | null = null;
  private rewinding = false;
  private labelsInput: HTMLInputElement | null = null;
  private orbitsInput: HTMLInputElement | null = null;
  private readonly paceInput: HTMLInputElement;
  private readonly focusSelect: HTMLSelectElement;
  private readonly stageLabel: HTMLElement;
  private readonly bodyCountLabel: HTMLElement;
  private readonly elapsedLabel: HTMLElement;
  private readonly speedLabel: HTMLElement;
  /** Life-of-the-system strip: one segment per stage, current one filling. */
  private readonly timelineStrip: HTMLDivElement;
  private readonly timelineSegments = new Map<LifecycleStage, HTMLSpanElement>();
  private readonly timelineCaption: HTMLDivElement;
  private skipButton: HTMLButtonElement | null = null;
  private autoWarpInput: HTMLInputElement | null = null;
  private timeline: TimelineView | null = null;
  /** Hover/focus legend describing one timeline segment. */
  private readonly legend: HTMLDivElement;
  /** The stage the legend is currently describing, if it is open. */
  private legendStage: LifecycleStage | null = null;
  private readonly seekable: boolean;
  /** Furthest stage the live run has reached; every phase up to it is recorded. */
  private reachedStage: LifecycleStage = LifecycleStage.DustCloud;

  /** static label element → message id, re-translated on locale change. */
  private readonly translatables = new Map<HTMLElement, string>();
  /** element → message id for its tooltip (`title`), re-translated likewise. */
  private readonly titles = new Map<HTMLElement, string>();
  /** element → message id for its `aria-label`, re-translated likewise. */
  private readonly ariaLabels = new Map<HTMLElement, string>();

  private paused = false;
  private stage: LifecycleStage = LifecycleStage.DustCloud;
  private bodyCount = 0;
  private elapsedYears = 0;
  private speedYearsPerSecond = 0;
  private focusOptions: FocusOption[] = [...BASE_FOCUS_OPTIONS];

  constructor(options: HudOptions) {
    this.i18n = options.i18n ?? sharedI18n;
    this.locale = options.locale;

    this.root = document.createElement('div');
    this.root.className = 'hud';

    // Pause indicator. The pause CONTROL existed before, but nothing on screen
    // confirmed the state, so a paused run was indistinguishable from a stalled
    // one — this badge (plus the active button styling) makes it obvious.
    this.pausedBadge = document.createElement('div');
    this.pausedBadge.className = 'hud-paused';
    this.pausedBadge.hidden = true;
    options.container.appendChild(this.pausedBadge);

    // Zoom: a pair of transparent round +/− buttons floating over the scene
    // (map-style), rather than two more text buttons in the panel.
    this.zoomControls = document.createElement('div');
    this.zoomControls.className = 'zoom-controls';
    this.zoomControls.style.pointerEvents = 'auto';
    for (const [glyph, labelId, onClick] of [
      ['+', 'hud.zoomIn', options.onZoomIn],
      ['−', 'hud.zoomOut', options.onZoomOut],
    ] as const) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'zoom-controls__button';
      button.textContent = glyph;
      button.addEventListener('click', onClick);
      this.titles.set(button, labelId);
      this.ariaLabels.set(button, labelId);
      this.zoomControls.appendChild(button);
    }
    options.container.appendChild(this.zoomControls);

    // Status readouts.
    this.stageLabel = document.createElement('div');
    this.stageLabel.className = 'hud-stage';
    this.bodyCountLabel = document.createElement('div');
    this.bodyCountLabel.className = 'hud-body-count';
    this.elapsedLabel = document.createElement('div');
    this.elapsedLabel.className = 'hud-elapsed';
    this.root.append(this.stageLabel, this.bodyCountLabel, this.elapsedLabel);

    // Timeline: where the system is in its whole life, and how long the stage
    // it is in REALLY lasts (the on-screen time is compressed; this says by how
    // much). Segments are sized by their share of the run as it is shown.
    const timeline = document.createElement('div');
    timeline.className = 'hud-timeline';
    this.timelineStrip = document.createElement('div');
    this.timelineStrip.className = 'hud-timeline__strip';
    // The legend: what each phase IS, how long it really lasts and whether it
    // is behind, under way or ahead — revealed by hovering (or focusing) it.
    this.legend = document.createElement('div');
    this.legend.className = 'hud-legend';
    this.legend.id = `hud-legend-${Math.random().toString(36).slice(2, 9)}`;
    this.legend.setAttribute('role', 'tooltip');
    this.legend.hidden = true;
    const onSeekStage = options.onSeekStage;
    this.seekable = onSeekStage !== undefined;
    for (const stage of Object.keys(STAGE_MESSAGE_IDS).map(Number) as LifecycleStage[]) {
      const segment = document.createElement('span');
      segment.className = 'hud-timeline__seg';
      segment.tabIndex = 0;
      segment.setAttribute('aria-describedby', this.legend.id);
      const fill = document.createElement('span');
      fill.className = 'hud-timeline__fill';
      segment.appendChild(fill);
      const show = (): void => this.showLegend(stage);
      const hide = (): void => this.hideLegend(stage);
      segment.addEventListener('mouseenter', show);
      segment.addEventListener('focus', show);
      segment.addEventListener('mouseleave', hide);
      segment.addEventListener('blur', hide);
      if (onSeekStage !== undefined) {
        segment.addEventListener('click', () => {
          if (this.isSeekTarget(stage)) {
            onSeekStage(stage);
          }
        });
      }
      this.timelineStrip.appendChild(segment);
      this.timelineSegments.set(stage, segment);
    }
    this.timelineCaption = document.createElement('div');
    this.timelineCaption.className = 'hud-timeline__caption';
    const orbitNote = document.createElement('div');
    orbitNote.className = 'hud-timeline__note';
    this.translatables.set(orbitNote, 'hud.orbitNote');
    timeline.append(this.timelineStrip, this.legend, this.timelineCaption, orbitNote);
    this.root.appendChild(timeline);

    // Time-scale slider.
    const paceField = this.field('hud.timeScale');
    this.paceInput = document.createElement('input');
    this.paceInput.type = 'range';
    this.paceInput.min = '0';
    this.paceInput.max = '1';
    this.paceInput.step = '0.01';
    this.paceInput.value = String(options.initialPace ?? 0.5);
    this.paceInput.addEventListener('input', () => {
      options.onPaceChange(Number(this.paceInput.value));
    });
    paceField.appendChild(this.paceInput);

    // Current-speed readout (years of sim time per real second).
    this.speedLabel = document.createElement('span');
    this.speedLabel.className = 'hud-speed';
    paceField.appendChild(this.speedLabel);

    // Adaptive time warp: every stage compressed to a watchable length, the
    // slider then scaling that up or down. Off = one fixed rate for the run.
    const onToggleAutoWarp = options.onToggleAutoWarp;
    if (onToggleAutoWarp !== undefined) {
      this.autoWarpInput = this.checkbox('hud.autoWarp', options.initialAutoWarp ?? true, (on) =>
        onToggleAutoWarp(on),
      );
      const wrapper = this.autoWarpInput.parentElement;
      if (wrapper !== null) {
        this.titles.set(wrapper, 'hud.autoWarpHint');
      }
    }
    const onSkipStage = options.onSkipStage;
    if (onSkipStage !== undefined) {
      this.skipButton = this.button('hud.skip', onSkipStage);
      this.skipButton.className = 'hud-skip';
      this.skipButton.disabled = true;
      this.titles.set(this.skipButton, 'hud.skipHint');
    }

    // Transport + zoom buttons. The pause button also advertises its shortcut.
    this.pauseButton = this.button('hud.pause', options.onTogglePause);
    this.pauseButton.title = this.t('hud.pauseHint');
    // Rewind toggle: scrub backwards through recorded history, then resume.
    const onToggleRewind = options.onToggleRewind;
    if (onToggleRewind !== undefined) {
      this.rewindButton = this.button('hud.rewind', () => {
        this.setRewinding(!this.rewinding);
        onToggleRewind(this.rewinding);
      });
      this.titles.set(this.rewindButton, 'hud.rewindHint');
    }
    this.button('hud.reset', options.onReset);

    // Orbit-path overlay toggle (planets, asteroids and comets).
    const onToggleOrbits = options.onToggleOrbits;
    if (onToggleOrbits !== undefined) {
      this.orbitsInput = this.checkbox('hud.orbits', options.initialOrbits ?? false, (on) =>
        onToggleOrbits(on),
      );
    }

    // Labels toggle (bodies are drawn at realistic — small — sizes, so the
    // labels are the primary way to find and identify them — but they start
    // OFF so the simulation opens on an uncluttered sky).
    const onToggleLabels = options.onToggleLabels;
    if (onToggleLabels !== undefined) {
      this.labelsInput = this.checkbox('hud.labels', options.initialLabels ?? false, (on) =>
        onToggleLabels(on),
      );
    }

    // Focus selector.
    const focusField = this.field('hud.focus');
    this.focusSelect = document.createElement('select');
    this.focusSelect.className = 'hud-focus';
    this.focusSelect.addEventListener('change', () => {
      options.onFocusChange(this.focusSelect.value);
    });
    focusField.appendChild(this.focusSelect);

    this.renderFocusOptions();
    this.applyTranslations();
    options.container.appendChild(this.root);
  }

  /** The HUD root element (for testing / manual mounting). */
  get element(): HTMLDivElement {
    return this.root;
  }

  /** Whether the "show orbits" checkbox is currently checked. */
  get orbitsChecked(): boolean {
    return this.orbitsInput?.checked ?? false;
  }

  /** Whether the "show labels" checkbox is currently checked. */
  get labelsChecked(): boolean {
    return this.labelsInput?.checked ?? false;
  }

  /**
   * Reflect the paused state: swap the button label, highlight the button and
   * show/hide the on-screen PAUSED badge.
   */
  setPaused(paused: boolean): void {
    this.paused = paused;
    this.translatables.set(this.pauseButton, paused ? 'hud.resume' : 'hud.pause');
    this.pauseButton.textContent = this.t(paused ? 'hud.resume' : 'hud.pause');
    this.pauseButton.classList.toggle('hud-button--active', paused);
    this.renderBadge();
  }

  /** Reflect whether the frame on screen is from the recorded past. */
  setReplaying(replaying: boolean): void {
    if (this.replaying !== replaying) {
      this.replaying = replaying;
      this.renderBadge();
    }
  }

  /**
   * The playback badge: PAUSED, REWINDING, or REPLAY while playing back the
   * recorded past towards the present — so it is always clear whether what is
   * on screen is live, and why it is (not) moving.
   */
  private renderBadge(): void {
    let id: string | null = null;
    if (this.paused) {
      id = this.replaying ? 'hud.pausedPast' : 'hud.paused';
    } else if (this.rewinding) {
      id = 'hud.rewinding';
    } else if (this.replaying) {
      id = 'hud.replaying';
    }
    this.pausedBadge.hidden = id === null;
    this.pausedBadge.dataset.mode = this.paused
      ? 'paused'
      : this.rewinding
        ? 'rewinding'
        : 'replay';
    if (id !== null) {
      this.pausedBadge.textContent = this.t(id);
    }
  }

  /** Reflect the rewinding state (updates the rewind button label + active style). */
  setRewinding(rewinding: boolean): void {
    this.rewinding = rewinding;
    const button = this.rewindButton;
    if (button === null) {
      this.renderBadge();
      return;
    }
    const id = rewinding ? 'hud.rewindStop' : 'hud.rewind';
    this.translatables.set(button, id);
    button.textContent = this.t(id);
    button.classList.toggle('hud-button--active', rewinding);
    this.renderBadge();
  }

  /** Whether the HUD currently shows the rewinding state. */
  get isRewinding(): boolean {
    return this.rewinding;
  }

  /** Update the displayed lifecycle stage. */
  setStage(stage: LifecycleStage): void {
    this.stage = stage;
    this.stageLabel.textContent = this.t('hud.stage', {
      stage: this.t(STAGE_MESSAGE_IDS[stage]),
    });
  }

  /** Update the displayed orbiting-body count (pluralized). */
  setBodyCount(count: number): void {
    this.bodyCount = count;
    this.bodyCountLabel.textContent = this.t('hud.bodyCount', { count });
  }

  /** Update the elapsed simulation time (in years), formatted for scale. */
  setElapsedYears(years: number): void {
    this.elapsedYears = years;
    this.elapsedLabel.textContent = this.t('hud.elapsed', {
      time: formatYears(years, this.i18n, this.locale),
    });
  }

  /** Update the current speed readout (sim years per real second). */
  setSpeedYearsPerSecond(yearsPerSecond: number): void {
    this.speedYearsPerSecond = yearsPerSecond;
    this.speedLabel.textContent = this.t('hud.speed', {
      value: formatYears(yearsPerSecond, this.i18n, this.locale),
    });
  }

  /** Whether the auto-warp checkbox is currently checked. */
  get autoWarpChecked(): boolean {
    return this.autoWarpInput?.checked ?? true;
  }

  /** Enable/disable the skip button and reflect a skip in progress. */
  setSkip(available: boolean, active: boolean): void {
    const button = this.skipButton;
    if (button === null) {
      return;
    }
    button.disabled = !available || active;
    button.classList.toggle('hud-button--active', active);
  }

  /** Update the life-of-the-system strip and its caption. */
  setTimeline(view: TimelineView): void {
    this.timeline = view;
    for (const segment of view.segments) {
      const el = this.timelineSegments.get(segment.stage);
      if (el === undefined) {
        continue;
      }
      el.hidden = segment.state === 'absent';
      el.style.flexGrow = String(segment.weight);
      el.dataset.state = segment.state;
      const fill = el.firstElementChild as HTMLElement | null;
      if (fill !== null) {
        fill.style.width = `${(segment.fill * 100).toFixed(1)}%`;
      }
      const label = this.segmentTitle(segment.stage, segment.years);
      if (el.getAttribute('aria-label') !== label) {
        el.setAttribute('aria-label', label);
      }
      el.classList.toggle('hud-timeline__seg--seekable', this.isSeekTarget(segment.stage));
    }
    if (this.legendStage !== null) {
      this.renderLegend(this.legendStage);
    }
    const caption = this.timelineCaptionText(view);
    if (this.timelineCaption.textContent !== caption) {
      this.timelineCaption.textContent = caption;
    }
  }

  /**
   * Whether clicking this segment jumps to it: any phase the live run has
   * reached, so from the past you can also jump forward again.
   */
  private isSeekTarget(stage: LifecycleStage): boolean {
    if (!this.seekable || this.timeline === null) {
      return false;
    }
    const segment = this.timeline.segments.find((s) => s.stage === stage);
    if (segment === undefined || segment.state === 'absent') {
      return false;
    }
    return segment.state !== 'future' || stage <= this.reachedStage;
  }

  /** Tell the HUD how far the live run has got (bounds timeline seeking). */
  setReachedStage(stage: LifecycleStage): void {
    this.reachedStage = stage;
  }

  /** Open the legend for `stage`, positioned under its segment. */
  private showLegend(stage: LifecycleStage): void {
    this.legendStage = stage;
    this.renderLegend(stage);
    this.legend.hidden = false;
    const segment = this.timelineSegments.get(stage);
    if (segment !== undefined) {
      // Centre under the segment, but never past either end of the strip.
      const width = this.timelineStrip.offsetWidth;
      const legendWidth = this.legend.offsetWidth;
      const centre = segment.offsetLeft + segment.offsetWidth / 2;
      const left = Math.min(
        Math.max(0, centre - legendWidth / 2),
        Math.max(0, width - legendWidth),
      );
      this.legend.style.left = `${left}px`;
    }
  }

  /** Close the legend if it is showing `stage`. */
  private hideLegend(stage: LifecycleStage): void {
    if (this.legendStage === stage) {
      this.legendStage = null;
      this.legend.hidden = true;
    }
  }

  /** Fill the legend: name, real duration, status, explanation. */
  private renderLegend(stage: LifecycleStage): void {
    const segment = this.timeline?.segments.find((s) => s.stage === stage);
    const years = segment?.years ?? NaN;
    const duration = Number.isFinite(years)
      ? this.t('hud.legend.lasts', { time: formatYears(years, this.i18n, this.locale) })
      : years === Infinity
        ? this.t('hud.legend.forever')
        : '';
    let status = '';
    if (segment?.state === 'done') {
      status = this.t('hud.legend.done');
    } else if (segment?.state === 'current') {
      status = this.t('hud.legend.current', { percent: Math.round(segment.fill * 100) });
    } else if (segment?.state === 'future') {
      status = this.t('hud.legend.future');
    }
    const parts: Array<[string, string]> = [
      ['hud-legend__title', this.t(STAGE_MESSAGE_IDS[stage])],
      ['hud-legend__meta', [duration, status].filter((x) => x !== '').join(' · ')],
      ['hud-legend__desc', this.t(STAGE_LEGEND_IDS[stage])],
    ];
    if (this.isSeekTarget(stage)) {
      parts.push(['hud-legend__hint', this.t('hud.legend.rewind')]);
    }
    const signature = parts.map((p) => p[1]).join('|');
    if (this.legend.dataset.signature === signature) {
      return;
    }
    this.legend.dataset.signature = signature;
    this.legend.replaceChildren(
      ...parts.map(([className, text]) => {
        const line = document.createElement('div');
        line.className = className;
        line.textContent = text;
        return line;
      }),
    );
  }

  private segmentTitle(stage: LifecycleStage, years: number): string {
    const name = this.t(STAGE_MESSAGE_IDS[stage]);
    return Number.isFinite(years)
      ? this.t('hud.timeline.lasts', {
          stage: name,
          time: formatYears(years, this.i18n, this.locale),
        })
      : this.t('hud.timeline.forever', { stage: name });
  }

  private timelineCaptionText(view: TimelineView): string {
    const current = view.segments.find((s) => s.state === 'current');
    if (current === undefined) {
      return '';
    }
    const text = this.segmentTitle(current.stage, view.currentYears);
    if (!view.beyondUniverseAge) {
      return text;
    }
    return `${text} ${this.t('hud.timeline.beyondUniverse', {
      age: formatYears(UNIVERSE_AGE_YEARS, this.i18n, this.locale),
    })}`;
  }

  /** Replace the body-focus options (star + free camera are always kept). */
  setFocusOptions(bodyOptions: readonly FocusOption[]): void {
    this.focusOptions = [...BASE_FOCUS_OPTIONS, ...bodyOptions];
    this.renderFocusOptions();
  }

  /** Reflect an externally-chosen focus (e.g. right-click "center on") in the selector. */
  setFocusValue(value: string): void {
    if (this.focusOptions.some((o) => o.value === value)) {
      this.focusSelect.value = value;
    }
  }

  /** Switch the active locale and re-translate every label. */
  setLocale(locale: Locale): void {
    this.locale = locale;
    this.applyTranslations();
  }

  private renderFocusOptions(): void {
    const previous = this.focusSelect.value;
    this.focusSelect.replaceChildren();
    for (const option of this.focusOptions) {
      const el = document.createElement('option');
      el.value = option.value;
      el.textContent = this.t(option.labelMessageId, option.params);
      this.focusSelect.appendChild(el);
    }
    // Preserve the selection when the option still exists.
    if (this.focusOptions.some((o) => o.value === previous)) {
      this.focusSelect.value = previous;
    }
  }

  private applyTranslations(): void {
    for (const [element, messageId] of this.translatables) {
      element.textContent = this.t(messageId);
    }
    for (const [element, messageId] of this.titles) {
      element.title = this.t(messageId);
    }
    for (const [element, messageId] of this.ariaLabels) {
      element.setAttribute('aria-label', this.t(messageId));
    }
    if (this.timeline !== null) {
      this.setTimeline(this.timeline);
    }
    this.pauseButton.title = this.t('hud.pauseHint');
    this.setPaused(this.paused);
    this.setStage(this.stage);
    this.setBodyCount(this.bodyCount);
    this.setElapsedYears(this.elapsedYears);
    this.setSpeedYearsPerSecond(this.speedYearsPerSecond);
    this.renderFocusOptions();
  }

  private t(messageId: string, params?: MessageParams): string {
    return this.i18n.translate(this.locale, messageId, params ?? {});
  }

  private field(labelId: string): HTMLElement {
    const wrapper = document.createElement('label');
    wrapper.className = 'hud-field';
    const label = document.createElement('span');
    label.className = 'hud-field__label';
    this.translatables.set(label, labelId);
    wrapper.appendChild(label);
    this.root.appendChild(wrapper);
    return wrapper;
  }

  /**
   * Build a labelled checkbox control. `onChange` receives the new checked
   * state; the caption is registered for translation like every other label.
   */
  private checkbox(
    labelId: string,
    initial: boolean,
    onChange: (checked: boolean) => void,
  ): HTMLInputElement {
    const wrapper = document.createElement('label');
    wrapper.className = 'hud-field hud-toggle';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'hud-toggle__input';
    input.checked = initial;
    input.addEventListener('change', () => onChange(input.checked));
    const caption = document.createElement('span');
    caption.className = 'hud-field__label';
    this.translatables.set(caption, labelId);
    wrapper.append(input, caption);
    this.root.appendChild(wrapper);
    return input;
  }

  private button(labelId: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    this.translatables.set(button, labelId);
    button.addEventListener('click', onClick);
    this.root.appendChild(button);
    return button;
  }

  /** Whether the HUD currently shows the paused state. */
  get isPaused(): boolean {
    return this.paused;
  }

  /** Remove the HUD from the DOM. */
  destroy(): void {
    this.root.remove();
    this.pausedBadge.remove();
    this.zoomControls.remove();
  }
}
