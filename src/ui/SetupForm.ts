// Setup screen form (spec §3.1, FR-1, FR-2, FR-11).
//
// Renders the configuration form for a new run: language, preset, cloud mass,
// cloud extent, composition (H / He / metals), simulation pace, and the
// "show information about star system events" toggle. On submit it produces an
// immutable {@link SimulationConfig}.
//
// Every visible string is looked up from the i18n catalog by stable message id
// (D5, FR-2) — nothing is hard-coded — and the whole form re-translates live
// when the language select changes. The pure config assembly lives in
// {@link buildSimulationConfig} so it is unit-testable without a DOM.

import {
  normalizeComposition,
  type CloudComposition,
  type Locale,
  type SimulationConfig,
} from '../config/SimulationConfig';
import { DEFAULT_PRESET_ID, PRESETS, type SimulationPreset } from '../config/presets';
import { i18n as sharedI18n, type I18n } from '../i18n/i18n';

/** Raw, un-normalized state gathered from the form controls. */
export interface SetupFormState {
  locale: Locale;
  presetId: string;
  /** Cloud mass in solar masses (M☉). */
  mass: number;
  /** Initial cloud radius in scene/AU units. */
  cloudExtent: number;
  /** Normalized pace 0..1. */
  pace: number;
  /** Raw composition fractions (need not sum to 1 — normalized on build). */
  composition: CloudComposition;
  showEventAnnotations: boolean;
}

/**
 * Assemble an immutable {@link SimulationConfig} from raw form state. Composition
 * is normalized to sum to 1 and pace is clamped to [0, 1]. Pure and DOM-free so
 * it can be unit-tested directly. The returned object is frozen so downstream
 * consumers cannot mutate configuration.
 */
export function buildSimulationConfig(state: SetupFormState): SimulationConfig {
  const config: SimulationConfig = {
    locale: state.locale,
    composition: normalizeComposition(state.composition),
    mass: state.mass,
    cloudExtent: state.cloudExtent,
    pace: Math.min(1, Math.max(0, state.pace)),
    showEventAnnotations: state.showEventAnnotations,
    presetId: state.presetId,
  };
  return Object.freeze(config);
}

/** Options for constructing a {@link SetupForm}. */
export interface SetupFormOptions {
  /** Element the form is rendered into. */
  container: HTMLElement;
  /** i18n registry; defaults to the shared app instance. */
  i18n?: I18n;
  /** Initially selected locale. Default 'en'. */
  initialLocale?: Locale;
  /** Initially selected preset id. Default {@link DEFAULT_PRESET_ID}. */
  initialPresetId?: string;
  /** Called with the immutable config when the user starts the simulation. */
  onSubmit: (config: SimulationConfig) => void;
}

/** Locales offered by the language select (data-only extension point). */
const OFFERED_LOCALES: readonly Locale[] = ['en', 'fi'];

/**
 * The setup form component. Owns its DOM subtree, translates every label from
 * the catalog, applies presets, and emits an immutable {@link SimulationConfig}
 * on submit.
 */
export class SetupForm {
  private readonly i18n: I18n;
  private readonly onSubmit: (config: SimulationConfig) => void;
  private readonly root: HTMLFormElement;

  private locale: Locale;
  private presetId: string;

  // Controls kept for reading values + live re-translation.
  private readonly localeSelect: HTMLSelectElement;
  private readonly presetSelect: HTMLSelectElement;
  private readonly massInput: HTMLInputElement;
  private readonly extentInput: HTMLInputElement;
  private readonly hydrogenInput: HTMLInputElement;
  private readonly heliumInput: HTMLInputElement;
  private readonly metalsInput: HTMLInputElement;
  private readonly paceInput: HTMLInputElement;
  private readonly showEventsInput: HTMLInputElement;

  /** message id → label element, re-translated whenever the locale changes. */
  private readonly translatables = new Map<HTMLElement, string>();

  /** Live slider read-out updaters, re-run on input and on preset changes. */
  private readonly valueUpdaters: Array<() => void> = [];

  constructor(options: SetupFormOptions) {
    this.i18n = options.i18n ?? sharedI18n;
    this.onSubmit = options.onSubmit;
    this.locale = options.initialLocale ?? 'en';
    this.presetId = options.initialPresetId ?? DEFAULT_PRESET_ID;

    const preset = PRESETS[this.presetId] ?? PRESETS[DEFAULT_PRESET_ID];
    if (!preset) {
      throw new Error('No presets are registered.');
    }

    this.root = document.createElement('form');
    this.root.className = 'setup-form';

    this.appendHeading('setup.heading', 'h1');
    this.appendSubtitle('app.subtitle');

    this.localeSelect = this.appendSelect(
      'setup.language',
      OFFERED_LOCALES.map((loc) => ({ value: loc, labelId: `setup.language.${loc}` })),
      this.locale,
    );
    this.presetSelect = this.appendSelect(
      'setup.preset',
      Object.values(PRESETS).map((p) => ({ value: p.id, labelId: p.nameMessageId })),
      this.presetId,
    );

    const massFmt = (v: number): string => `${v.toFixed(1)} M☉`;
    const extentFmt = (v: number): string => `${Math.round(v)} AU`;
    const pctFmt = (v: number): string => `${Math.round(v * 100)}%`;

    this.massInput = this.appendRange('setup.mass', 0.1, 40, 0.1, preset.mass, { format: massFmt });
    this.extentInput = this.appendRange('setup.cloudExtent', 10, 150, 1, preset.cloudExtent, {
      format: extentFmt,
    });

    this.appendHeading('setup.composition', 'h2');
    this.hydrogenInput = this.appendRange(
      'setup.composition.hydrogen',
      0,
      1,
      0.01,
      preset.composition.hydrogen,
      { format: pctFmt },
    );
    this.heliumInput = this.appendRange(
      'setup.composition.helium',
      0,
      1,
      0.01,
      preset.composition.helium,
      { format: pctFmt },
    );
    this.metalsInput = this.appendRange(
      'setup.composition.metals',
      0,
      0.2,
      0.005,
      preset.composition.metals,
      { format: pctFmt },
    );
    this.appendHint('setup.composition.hint');

    this.paceInput = this.appendRange('setup.pace', 0, 1, 0.01, preset.pace, {
      minLabelId: 'setup.pace.slow',
      maxLabelId: 'setup.pace.fast',
    });

    this.showEventsInput = this.appendCheckbox('setup.showEvents', false);

    this.appendSubmit('setup.start');

    this.localeSelect.addEventListener('change', () => {
      this.locale = this.localeSelect.value as Locale;
      this.applyTranslations();
    });
    this.presetSelect.addEventListener('change', () => {
      this.applyPreset(this.presetSelect.value);
    });
    this.root.addEventListener('submit', (e) => {
      e.preventDefault();
      this.onSubmit(this.readConfig());
    });

    this.applyTranslations();
    options.container.appendChild(this.root);
  }

  /** The form's root element (for testing / manual mounting). */
  get element(): HTMLFormElement {
    return this.root;
  }

  /** Read the current control values into an immutable {@link SimulationConfig}. */
  readConfig(): SimulationConfig {
    return buildSimulationConfig(this.readState());
  }

  /** Gather raw (un-normalized) form state. */
  readState(): SetupFormState {
    return {
      locale: this.localeSelect.value as Locale,
      presetId: this.presetId,
      mass: Number(this.massInput.value),
      cloudExtent: Number(this.extentInput.value),
      pace: Number(this.paceInput.value),
      composition: {
        hydrogen: Number(this.hydrogenInput.value),
        helium: Number(this.heliumInput.value),
        metals: Number(this.metalsInput.value),
      },
      showEventAnnotations: this.showEventsInput.checked,
    };
  }

  /** Apply a preset's parameter set to the numeric controls. */
  private applyPreset(presetId: string): void {
    const preset: SimulationPreset | undefined = PRESETS[presetId];
    if (!preset) {
      return;
    }
    this.presetId = preset.id;
    this.presetSelect.value = preset.id;
    this.massInput.value = String(preset.mass);
    this.extentInput.value = String(preset.cloudExtent);
    this.hydrogenInput.value = String(preset.composition.hydrogen);
    this.heliumInput.value = String(preset.composition.helium);
    this.metalsInput.value = String(preset.composition.metals);
    this.paceInput.value = String(preset.pace);
    for (const update of this.valueUpdaters) {
      update();
    }
  }

  /** Re-translate every registered label into the active locale. */
  private applyTranslations(): void {
    for (const [element, messageId] of this.translatables) {
      element.textContent = this.t(messageId);
    }
    // <option> labels are translated in place too.
    for (const option of this.localeSelect.options) {
      option.textContent = this.t(`setup.language.${option.value}`);
    }
    for (const option of this.presetSelect.options) {
      const preset = PRESETS[option.value];
      if (preset) {
        option.textContent = this.t(preset.nameMessageId);
      }
    }
  }

  private t(messageId: string): string {
    return this.i18n.translate(this.locale, messageId);
  }

  // --- DOM builders ---------------------------------------------------------

  private appendHeading(messageId: string, tag: 'h1' | 'h2'): void {
    const el = document.createElement(tag);
    this.translatables.set(el, messageId);
    this.root.appendChild(el);
  }

  private appendHint(messageId: string): void {
    const el = document.createElement('p');
    el.className = 'setup-hint';
    this.translatables.set(el, messageId);
    this.root.appendChild(el);
  }

  private appendSelect(
    labelId: string,
    options: readonly { value: string; labelId: string }[],
    selected: string,
  ): HTMLSelectElement {
    const field = this.field(labelId);
    const select = document.createElement('select');
    for (const opt of options) {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = this.t(opt.labelId);
      select.appendChild(optionEl);
    }
    select.value = selected;
    field.appendChild(select);
    return select;
  }

  private appendRange(
    labelId: string,
    min: number,
    max: number,
    step: number,
    value: number,
    opts?: { minLabelId?: string; maxLabelId?: string; format?: (v: number) => string },
  ): HTMLInputElement {
    const field = this.field(labelId);
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    field.appendChild(input);

    // Live numeric read-out that tracks the slider (professional touch).
    if (opts?.format) {
      const format = opts.format;
      const output = document.createElement('output');
      output.className = 'setup-value';
      const update = (): void => {
        output.textContent = format(Number(input.value));
      };
      input.addEventListener('input', update);
      this.valueUpdaters.push(update);
      update();
      field.appendChild(output);
    }

    if (opts?.minLabelId && opts?.maxLabelId) {
      const scale = document.createElement('div');
      scale.className = 'setup-scale';
      const lo = document.createElement('span');
      const hi = document.createElement('span');
      this.translatables.set(lo, opts.minLabelId);
      this.translatables.set(hi, opts.maxLabelId);
      scale.append(lo, hi);
      field.appendChild(scale);
    }
    return input;
  }

  /** Add the tagline shown under the main heading. */
  private appendSubtitle(messageId: string): void {
    const el = document.createElement('p');
    el.className = 'setup-subtitle';
    this.translatables.set(el, messageId);
    this.root.appendChild(el);
  }

  private appendCheckbox(labelId: string, checked: boolean): HTMLInputElement {
    const wrapper = document.createElement('label');
    wrapper.className = 'setup-field setup-field--checkbox';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    const text = document.createElement('span');
    this.translatables.set(text, labelId);
    wrapper.append(input, text);
    this.root.appendChild(wrapper);
    return input;
  }

  private appendSubmit(labelId: string): void {
    const button = document.createElement('button');
    button.type = 'submit';
    this.translatables.set(button, labelId);
    this.root.appendChild(button);
  }

  /** Build a labelled field wrapper and register its label for translation. */
  private field(labelId: string): HTMLElement {
    const wrapper = document.createElement('label');
    wrapper.className = 'setup-field';
    const label = document.createElement('span');
    label.className = 'setup-field__label';
    this.translatables.set(label, labelId);
    wrapper.appendChild(label);
    this.root.appendChild(wrapper);
    return wrapper;
  }

  /** Remove the form from the DOM. */
  destroy(): void {
    this.root.remove();
  }
}
