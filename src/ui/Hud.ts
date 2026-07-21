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
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFocusChange: (value: string) => void;
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
  private readonly paceInput: HTMLInputElement;
  private readonly focusSelect: HTMLSelectElement;
  private readonly stageLabel: HTMLElement;
  private readonly bodyCountLabel: HTMLElement;
  private readonly elapsedLabel: HTMLElement;
  private readonly speedLabel: HTMLElement;

  /** static label element → message id, re-translated on locale change. */
  private readonly translatables = new Map<HTMLElement, string>();

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

    // Status readouts.
    this.stageLabel = document.createElement('div');
    this.stageLabel.className = 'hud-stage';
    this.bodyCountLabel = document.createElement('div');
    this.bodyCountLabel.className = 'hud-body-count';
    this.elapsedLabel = document.createElement('div');
    this.elapsedLabel.className = 'hud-elapsed';
    this.root.append(this.stageLabel, this.bodyCountLabel, this.elapsedLabel);

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

    // Transport + zoom buttons.
    this.pauseButton = this.button('hud.pause', options.onTogglePause);
    this.button('hud.reset', options.onReset);
    this.button('hud.zoomIn', options.onZoomIn);
    this.button('hud.zoomOut', options.onZoomOut);

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

  /** Reflect the paused state (updates the pause/resume button label). */
  setPaused(paused: boolean): void {
    this.paused = paused;
    this.translatables.set(this.pauseButton, paused ? 'hud.resume' : 'hud.pause');
    this.pauseButton.textContent = this.t(paused ? 'hud.resume' : 'hud.pause');
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
  }
}
