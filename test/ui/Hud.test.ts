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
