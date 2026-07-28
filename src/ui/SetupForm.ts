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
import { determineFate, isSubstellar, RemnantType } from '../config/fateModel';
import { stellarMassFromCloud } from '../config/starFormation';
import { solarToJupiterMasses } from '../sim/astro';
import { i18n as sharedI18n, type I18n } from '../i18n/i18n';

/**
 * Cloud-mass bounds of the setup slider, in solar masses.
 *
 * The range is deliberately WIDE — and logarithmic, see {@link RangeControl} —
 * because the cloud only turns about a third of itself into a star: reaching the
 * ~22 M☉ stellar mass where core collapse produces a BLACK HOLE takes a cloud of
 * roughly 90 M☉, which the old 40 M☉ ceiling could never supply. The bottom end
 * reaches well into the SUB-STELLAR regime — a 0.1 M☉ cloud assembles only
 * ~0.04 M☉ (≈43 Jupiters), far below the 0.08 M☉ hydrogen-burning limit — so
 * brown dwarfs are explorable rather than merely a rounding-error edge case.
 */
export const MASS_MIN = 0.1;
export const MASS_MAX = 250;

/** Slider positions across the logarithmic mass range (finer ⇒ smoother drag). */
const LOG_SLIDER_STEPS = 2000;

/** i18n id naming each remnant kind, for the setup-screen fate preview. */
const REMNANT_MESSAGE_IDS: Readonly<Record<RemnantType, string>> = {
  [RemnantType.WhiteDwarf]: 'remnant.whiteDwarf',
  [RemnantType.NeutronStar]: 'remnant.neutronStar',
  [RemnantType.Pulsar]: 'remnant.pulsar',
  [RemnantType.BlackHole]: 'remnant.blackHole',
  [RemnantType.BrownDwarf]: 'remnant.brownDwarf',
};

/**
 * A numeric slider whose VALUE may be spaced logarithmically over its range,
 * decoupling the DOM position from the physical value. A linear slider spanning
 * 0.2–250 M☉ would spend 99% of its travel above 3 M☉, making every ordinary
 * star impossible to dial in; a logarithmic one gives each decade equal room.
 */
interface RangeControl {
  /** The underlying `<input type="range">` (position space). */
  readonly input: HTMLInputElement;
  /** Current physical value. */
  get(): number;
  /** Set the physical value (clamped into range). */
  set(value: number): void;
}

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
  private readonly massInput: RangeControl;
  private readonly extentInput: RangeControl;
  private readonly hydrogenInput: RangeControl;
  private readonly heliumInput: RangeControl;
  private readonly metalsInput: RangeControl;
  private readonly paceInput: RangeControl;
  private readonly showEventsInput: HTMLInputElement;
  /** Live "this cloud makes an X M☉ star that ends as a Y" preview. */
  private readonly outcomeHint: HTMLParagraphElement;

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

    this.massInput = this.appendRange('setup.mass', MASS_MIN, MASS_MAX, 0.1, preset.mass, {
      format: massFmt,
      log: true,
    });
    // The headline of the whole setup screen: what this cloud actually becomes.
    // Without it the mass slider is misleading, because only ~a third of the
    // cloud ends up in the star.
    this.outcomeHint = this.appendHint('setup.outcome');
    this.extentInput = this.appendRange('setup.cloudExtent', 10, 250, 1, preset.cloudExtent, {
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

    // Keep the outcome preview in step with every control that feeds it.
    for (const control of [this.massInput, this.metalsInput]) {
      control.input.addEventListener('input', () => this.updateOutcomeHint());
    }

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

  /**
   * Refresh the "→ star ≈ X M☉ · ends as a Y" line from the current controls.
   * This is the only place the setup screen tells the user that the cloud mass
   * is NOT the star's mass.
   */
  private updateOutcomeHint(): void {
    const cloudMass = this.massInput.get();
    const metals = this.metalsInput.get();
    const starMass = stellarMassFromCloud(cloudMass, metals);
    const composition = normalizeComposition({
      hydrogen: Math.max(this.hydrogenInput.get(), 1e-9),
      helium: this.heliumInput.get(),
      metals,
    });
    const fate = determineFate(starMass, composition);
    // A substellar cloud never makes a star at all, so the ordinary
    // "forms a star, which ends as X" sentence would be simply untrue.
    const messageId = isSubstellar(starMass) ? 'setup.outcome.substellar' : 'setup.outcome';
    this.outcomeHint.textContent = this.i18n.translate(this.locale, messageId, {
      star: starMass >= 10 ? Math.round(starMass) : Number(starMass.toPrecision(2)),
      jupiters: Math.round(solarToJupiterMasses(starMass)),
      remnant: this.t(REMNANT_MESSAGE_IDS[fate.remnant] ?? 'remnant.whiteDwarf'),
    });
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
      mass: this.massInput.get(),
      cloudExtent: this.extentInput.get(),
      pace: this.paceInput.get(),
      composition: {
        hydrogen: this.hydrogenInput.get(),
        helium: this.heliumInput.get(),
        metals: this.metalsInput.get(),
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
    this.massInput.set(preset.mass);
    this.extentInput.set(preset.cloudExtent);
    this.hydrogenInput.set(preset.composition.hydrogen);
    this.heliumInput.set(preset.composition.helium);
    this.metalsInput.set(preset.composition.metals);
    this.paceInput.set(preset.pace);
    for (const update of this.valueUpdaters) {
      update();
    }
    this.updateOutcomeHint();
  }

  /** Re-translate every registered label into the active locale. */
  private applyTranslations(): void {
    for (const [element, messageId] of this.translatables) {
      element.textContent = this.t(messageId);
    }
    // The outcome line is interpolated, not a static label.
    this.updateOutcomeHint();
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

  private appendHint(messageId: string): HTMLParagraphElement {
    const el = document.createElement('p');
    el.className = 'setup-hint';
    this.translatables.set(el, messageId);
    this.root.appendChild(el);
    return el;
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
    opts?: {
      minLabelId?: string;
      maxLabelId?: string;
      format?: (v: number) => string;
      /** Space the values logarithmically over `[min, max]` (min must be > 0). */
      log?: boolean;
    },
  ): RangeControl {
    const field = this.field(labelId);
    const input = document.createElement('input');
    input.type = 'range';
    const logarithmic = opts?.log === true && min > 0;
    // A log slider works in POSITION space (0..LOG_SLIDER_STEPS) and converts;
    // a plain one uses the value directly.
    const logMin = Math.log(min);
    const logSpan = Math.log(max) - logMin;
    const toValue = (position: number): number =>
      logarithmic ? Math.exp(logMin + (position / LOG_SLIDER_STEPS) * logSpan) : position;
    const toPosition = (v: number): number => {
      const clamped = Math.min(max, Math.max(min, v));
      return logarithmic ? ((Math.log(clamped) - logMin) / logSpan) * LOG_SLIDER_STEPS : clamped;
    };
    input.min = String(logarithmic ? 0 : min);
    input.max = String(logarithmic ? LOG_SLIDER_STEPS : max);
    input.step = String(logarithmic ? 1 : step);
    input.value = String(toPosition(value));
    field.appendChild(input);

    const control: RangeControl = {
      input,
      get: () => {
        const raw = toValue(Number(input.value));
        // Snap to the control's own step so the read-out and the emitted config
        // agree and never show 3.2000000000000004 M☉.
        return logarithmic ? Math.round(raw / step) * step : raw;
      },
      set: (v: number) => {
        input.value = String(toPosition(v));
      },
    };

    // Live numeric read-out that tracks the slider (professional touch).
    if (opts?.format) {
      const format = opts.format;
      const output = document.createElement('output');
      output.className = 'setup-value';
      const update = (): void => {
        output.textContent = format(control.get());
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
    return control;
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
