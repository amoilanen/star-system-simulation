// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { SetupForm, buildSimulationConfig, type SetupFormState } from '../../src/ui/SetupForm';
import { isValidComposition } from '../../src/config/SimulationConfig';
import { PRESETS } from '../../src/config/presets';
import { i18n } from '../../src/i18n/i18n';

const baseState: SetupFormState = {
  locale: 'en',
  presetId: 'sun-like',
  mass: 1,
  cloudExtent: 50,
  pace: 0.5,
  composition: { hydrogen: 0.74, helium: 0.24, metals: 0.02 },
  showEventAnnotations: false,
};

describe('buildSimulationConfig', () => {
  it('normalizes composition fractions to sum to 1', () => {
    const config = buildSimulationConfig({
      ...baseState,
      composition: { hydrogen: 7.4, helium: 2.4, metals: 0.2 }, // sums to 10
    });
    expect(isValidComposition(config.composition)).toBe(true);
    expect(config.composition.hydrogen).toBeCloseTo(0.74, 6);
    expect(config.composition.helium).toBeCloseTo(0.24, 6);
    expect(config.composition.metals).toBeCloseTo(0.02, 6);
  });

  it('clamps pace to [0, 1] and produces a frozen config', () => {
    const high = buildSimulationConfig({ ...baseState, pace: 5 });
    const low = buildSimulationConfig({ ...baseState, pace: -3 });
    expect(high.pace).toBe(1);
    expect(low.pace).toBe(0);
    expect(Object.isFrozen(high)).toBe(true);
  });

  it('carries locale, mass, extent, annotation toggle and preset id through', () => {
    const config = buildSimulationConfig({
      ...baseState,
      locale: 'fi',
      mass: 12,
      cloudExtent: 90,
      showEventAnnotations: true,
      presetId: 'high-mass',
    });
    expect(config.locale).toBe('fi');
    expect(config.mass).toBe(12);
    expect(config.cloudExtent).toBe(90);
    expect(config.showEventAnnotations).toBe(true);
    expect(config.presetId).toBe('high-mass');
  });
});

describe('SetupForm', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.replaceChildren();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders localized labels and submits a valid config', () => {
    let submitted = null as ReturnType<SetupForm['readConfig']> | null;
    const form = new SetupForm({
      container,
      onSubmit: (config) => {
        submitted = config;
      },
    });

    // Heading is translated from the catalog, not hard-coded.
    expect(container.textContent).toContain(i18n.translate('en', 'setup.heading'));

    form.element.requestSubmit?.() ?? form.element.dispatchEvent(new Event('submit'));
    expect(submitted).not.toBeNull();
    expect(isValidComposition(submitted!.composition)).toBe(true);
    expect(submitted!.presetId).toBe('sun-like');
    expect(submitted!.locale).toBe('en');
  });

  it('applies a preset to the numeric controls when selected', () => {
    const form = new SetupForm({ container, onSubmit: () => {} });
    const select = container.querySelector('select') as HTMLSelectElement;
    // Second select is the preset select.
    const presetSelect = container.querySelectorAll('select')[1] as HTMLSelectElement;
    presetSelect.value = 'high-mass';
    presetSelect.dispatchEvent(new Event('change'));

    const state = form.readState();
    expect(state.presetId).toBe('high-mass');
    expect(state.mass).toBe(PRESETS['high-mass']!.mass);
    expect(state.cloudExtent).toBe(PRESETS['high-mass']!.cloudExtent);
    expect(select).toBeTruthy();
  });

  it('re-translates labels when the language select changes', () => {
    const form = new SetupForm({ container, onSubmit: () => {} });
    const localeSelect = container.querySelector('select') as HTMLSelectElement;
    localeSelect.value = 'fi';
    localeSelect.dispatchEvent(new Event('change'));

    expect(container.textContent).toContain(i18n.translate('fi', 'setup.heading'));
    expect(form.readState().locale).toBe('fi');
  });
});
