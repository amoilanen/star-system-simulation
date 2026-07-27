// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOCUS_NONE, FOCUS_STAR, Hud } from '../../src/ui/Hud';
import { LifecycleStage } from '../../src/config/fateModel';
import { i18n } from '../../src/i18n/i18n';

function makeHud(
  container: HTMLElement,
  overrides: Partial<ConstructorParameters<typeof Hud>[0]> = {},
) {
  const callbacks = {
    onPaceChange: vi.fn(),
    onTogglePause: vi.fn(),
    onReset: vi.fn(),
    onZoomIn: vi.fn(),
    onZoomOut: vi.fn(),
    onFocusChange: vi.fn(),
  };
  const hud = new Hud({ container, locale: 'en', ...callbacks, ...overrides });
  return { hud, callbacks };
}

describe('Hud', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.replaceChildren();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders localized transport controls and the always-present focus targets', () => {
    const { hud } = makeHud(container);
    expect(container.textContent).toContain(i18n.translate('en', 'hud.pause'));
    expect(container.textContent).toContain(i18n.translate('en', 'hud.reset'));

    const focus = hud.element.querySelector('.hud-focus') as HTMLSelectElement;
    const values = [...focus.options].map((o) => o.value);
    expect(values).toEqual([FOCUS_STAR, FOCUS_NONE]);
    expect(focus.options[0]!.textContent).toBe(i18n.translate('en', 'hud.focus.star'));
  });

  it('toggles the pause button label between pause and resume', () => {
    const { hud } = makeHud(container);
    const button = [...hud.element.querySelectorAll('button')].find(
      (b) => b.textContent === i18n.translate('en', 'hud.pause'),
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();
    hud.setPaused(true);
    expect(button.textContent).toBe(i18n.translate('en', 'hud.resume'));
    hud.setPaused(false);
    expect(button.textContent).toBe(i18n.translate('en', 'hud.pause'));
  });

  it('invokes callbacks from the controls', () => {
    const { hud, callbacks } = makeHud(container);
    const paceInput = hud.element.querySelector('input[type="range"]') as HTMLInputElement;
    paceInput.value = '0.8';
    paceInput.dispatchEvent(new Event('input'));
    expect(callbacks.onPaceChange).toHaveBeenCalledWith(0.8);

    const focus = hud.element.querySelector('.hud-focus') as HTMLSelectElement;
    focus.value = FOCUS_NONE;
    focus.dispatchEvent(new Event('change'));
    expect(callbacks.onFocusChange).toHaveBeenCalledWith(FOCUS_NONE);
  });

  it('renders a rewind button that toggles label + state and reports to the handler', () => {
    const onToggleRewind = vi.fn();
    const { hud } = makeHud(container, { onToggleRewind });
    const button = [...hud.element.querySelectorAll('button')].find(
      (b) => b.textContent === i18n.translate('en', 'hud.rewind'),
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(hud.isRewinding).toBe(false);

    button.dispatchEvent(new MouseEvent('click'));
    expect(onToggleRewind).toHaveBeenCalledWith(true);
    expect(hud.isRewinding).toBe(true);
    expect(button.textContent).toBe(i18n.translate('en', 'hud.rewindStop'));

    button.dispatchEvent(new MouseEvent('click'));
    expect(onToggleRewind).toHaveBeenCalledWith(false);
    expect(hud.isRewinding).toBe(false);
    expect(button.textContent).toBe(i18n.translate('en', 'hud.rewind'));
  });

  it('omits the rewind button when no handler is supplied', () => {
    const { hud } = makeHud(container);
    const rewind = [...hud.element.querySelectorAll('button')].find(
      (b) => b.textContent === i18n.translate('en', 'hud.rewind'),
    );
    expect(rewind).toBeUndefined();
  });

  it('displays the current stage and pluralized body count', () => {
    const { hud } = makeHud(container);
    hud.setStage(LifecycleStage.RedGiant);
    hud.setBodyCount(3);
    expect(hud.element.querySelector('.hud-stage')!.textContent).toBe(
      i18n.translate('en', 'hud.stage', { stage: i18n.translate('en', 'stage.redGiant') }),
    );
    expect(hud.element.querySelector('.hud-body-count')!.textContent).toBe(
      i18n.translate('en', 'hud.bodyCount', { count: 3 }),
    );
  });

  it('adds body focus options and re-translates on locale change', () => {
    const { hud } = makeHud(container);
    hud.setFocusOptions([
      { value: 'body:7', labelMessageId: 'hud.focus.body', params: { body: 'comet', id: 7 } },
    ]);
    const focus = hud.element.querySelector('.hud-focus') as HTMLSelectElement;
    expect([...focus.options].map((o) => o.value)).toEqual([FOCUS_STAR, FOCUS_NONE, 'body:7']);

    hud.setLocale('fi');
    expect(focus.options[0]!.textContent).toBe(i18n.translate('fi', 'hud.focus.star'));
  });
});

describe('Hud visibility toggles', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.replaceChildren();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  function checkboxes(hud: Hud): HTMLInputElement[] {
    return [...hud.element.querySelectorAll('input[type="checkbox"]')] as HTMLInputElement[];
  }

  it('omits the toggles when no handlers are supplied', () => {
    const { hud } = makeHud(container);
    expect(checkboxes(hud)).toHaveLength(0);
  });

  it('renders localized "show orbits" and "show labels" checkboxes', () => {
    const onToggleOrbits = vi.fn();
    const onToggleLabels = vi.fn();
    const { hud } = makeHud(container, { onToggleOrbits, onToggleLabels });

    expect(checkboxes(hud)).toHaveLength(2);
    expect(container.textContent).toContain(i18n.translate('en', 'hud.orbits'));
    expect(container.textContent).toContain(i18n.translate('en', 'hud.labels'));
  });

  it('defaults to orbits off and labels on', () => {
    const { hud } = makeHud(container, { onToggleOrbits: vi.fn(), onToggleLabels: vi.fn() });
    expect(hud.orbitsChecked).toBe(false);
    expect(hud.labelsChecked).toBe(true);
  });

  it('reports the new checked state to each handler', () => {
    const onToggleOrbits = vi.fn();
    const onToggleLabels = vi.fn();
    const { hud } = makeHud(container, { onToggleOrbits, onToggleLabels });
    const [orbits, labels] = checkboxes(hud);

    orbits!.checked = true;
    orbits!.dispatchEvent(new Event('change'));
    expect(onToggleOrbits).toHaveBeenCalledWith(true);
    expect(hud.orbitsChecked).toBe(true);

    labels!.checked = false;
    labels!.dispatchEvent(new Event('change'));
    expect(onToggleLabels).toHaveBeenCalledWith(false);
    expect(hud.labelsChecked).toBe(false);
  });

  it('re-translates the toggle captions on locale change', () => {
    const { hud } = makeHud(container, { onToggleOrbits: vi.fn(), onToggleLabels: vi.fn() });
    hud.setLocale('fi');
    expect(container.textContent).toContain(i18n.translate('fi', 'hud.orbits'));
    expect(container.textContent).toContain(i18n.translate('fi', 'hud.labels'));
  });
});
