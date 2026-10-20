// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FOCUS_NONE, FOCUS_STAR, Hud, STAGE_LEGEND_IDS } from '../../src/ui/Hud';
import { LifecycleStage } from '../../src/config/fateModel';
import { i18n } from '../../src/i18n/i18n';
import { stageDurations } from '../../src/sim/stages';
import { timelineView } from '../../src/ui/timeline';

const SOLAR = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };

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

  it('shows an unmissable PAUSED badge and highlights the button while paused', () => {
    const { hud } = makeHud(container);
    const badge = container.querySelector('.hud-paused') as HTMLElement;
    const button = [...hud.element.querySelectorAll('button')].find(
      (b) => b.textContent === i18n.translate('en', 'hud.pause'),
    ) as HTMLButtonElement;

    expect(badge).toBeTruthy();
    expect(badge.hidden).toBe(true);
    expect(button.classList.contains('hud-button--active')).toBe(false);

    hud.setPaused(true);
    expect(badge.hidden).toBe(false);
    expect(badge.textContent).toBe(i18n.translate('en', 'hud.paused'));
    expect(button.classList.contains('hud-button--active')).toBe(true);
    expect(hud.isPaused).toBe(true);

    hud.setPaused(false);
    expect(badge.hidden).toBe(true);
    expect(button.classList.contains('hud-button--active')).toBe(false);
  });

  it('removes the paused badge on destroy', () => {
    const { hud } = makeHud(container);
    hud.destroy();
    expect(container.querySelector('.hud-paused')).toBeNull();
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

  it('defaults to orbits off and labels off', () => {
    const { hud } = makeHud(container, { onToggleOrbits: vi.fn(), onToggleLabels: vi.fn() });
    expect(hud.orbitsChecked).toBe(false);
    expect(hud.labelsChecked).toBe(false);
  });

  it('honours an explicit initialLabels override', () => {
    const { hud } = makeHud(container, {
      onToggleOrbits: vi.fn(),
      onToggleLabels: vi.fn(),
      initialLabels: true,
    });
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

describe('Hud timeline and time controls', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.replaceChildren();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('captions the current stage with its TRUE duration and the universe-age note', () => {
    const { hud } = makeHud(container);
    hud.setTimeline(
      timelineView(LifecycleStage.MainSequence, 0.5, stageDurations(0.2, SOLAR), false),
    );
    const caption = container.querySelector('.hud-timeline__caption')!.textContent ?? '';
    expect(caption).toContain(i18n.translate('en', 'stage.mainSequence'));
    expect(caption).toContain('billion years');
    expect(caption).toContain('13.8 billion years');
    const current = container.querySelector(
      '.hud-timeline__seg[data-state="current"] .hud-timeline__fill',
    ) as HTMLElement;
    expect(parseFloat(current.style.width)).toBeCloseTo(50, 5);
    // The honest note about the orbital clock is always there.
    expect(container.textContent).toContain(i18n.translate('en', 'hud.orbitNote'));
  });

  it('wires the skip button and auto-warp toggle', () => {
    const onSkipStage = vi.fn();
    const onToggleAutoWarp = vi.fn();
    const { hud } = makeHud(container, { onSkipStage, onToggleAutoWarp });
    const skip = container.querySelector('.hud-skip') as HTMLButtonElement;
    expect(skip.disabled).toBe(true);
    hud.setSkip(true, false);
    expect(skip.disabled).toBe(false);
    skip.click();
    expect(onSkipStage).toHaveBeenCalledTimes(1);
    hud.setSkip(true, true);
    expect(skip.disabled).toBe(true);

    expect(hud.autoWarpChecked).toBe(true);
    const toggle = [...container.querySelectorAll('input[type="checkbox"]')].find((el) =>
      el.parentElement?.textContent?.includes(i18n.translate('en', 'hud.autoWarp')),
    ) as HTMLInputElement;
    toggle.click();
    expect(onToggleAutoWarp).toHaveBeenCalledWith(false);
  });

  it('re-translates the timeline caption on a locale change', () => {
    const { hud } = makeHud(container);
    hud.setTimeline(timelineView(LifecycleStage.RedGiant, 0.1, stageDurations(1, SOLAR), false));
    hud.setLocale('fi');
    const caption = container.querySelector('.hud-timeline__caption')!.textContent ?? '';
    expect(caption).toContain(i18n.translate('fi', 'stage.redGiant'));
  });
});

describe('Hud phase legend, seeking, zoom and playback badge', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.replaceChildren();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  function segments(): HTMLElement[] {
    return [...container.querySelectorAll<HTMLElement>('.hud-timeline__seg')];
  }

  it('reveals a phase legend on hover and hides it on leave', () => {
    const { hud } = makeHud(container);
    hud.setTimeline(
      timelineView(LifecycleStage.MainSequence, 0.3, stageDurations(1, SOLAR), false),
    );
    const legend = container.querySelector('.hud-legend') as HTMLElement;
    expect(legend.hidden).toBe(true);
    const redGiant = segments()[LifecycleStage.RedGiant]!;
    redGiant.dispatchEvent(new MouseEvent('mouseenter'));
    expect(legend.hidden).toBe(false);
    expect(legend.textContent).toContain(i18n.translate('en', 'stage.redGiant'));
    expect(legend.textContent).toContain(i18n.translate('en', 'stage.legend.redGiant'));
    expect(legend.textContent).toContain(i18n.translate('en', 'hud.legend.future'));
    redGiant.dispatchEvent(new MouseEvent('mouseleave'));
    expect(legend.hidden).toBe(true);
    // Keyboard users get it too.
    segments()[LifecycleStage.MainSequence]!.dispatchEvent(new FocusEvent('focus'));
    expect(legend.textContent).toContain('30%');
  });

  it('has a legend for every stage in every locale', () => {
    for (const locale of ['en', 'fi'] as const) {
      for (const id of Object.values(STAGE_LEGEND_IDS)) {
        expect(i18n.translate(locale, id)).not.toBe(id);
      }
    }
  });

  it('seeks only to phases the run has already reached', () => {
    const onSeekStage = vi.fn();
    const { hud } = makeHud(container, { onSeekStage });
    hud.setTimeline(
      timelineView(LifecycleStage.MainSequence, 0.3, stageDurations(1, SOLAR), false),
    );
    segments()[LifecycleStage.ProtostarCoalescence]!.click();
    expect(onSeekStage).toHaveBeenCalledWith(LifecycleStage.ProtostarCoalescence);
    segments()[LifecycleStage.RedGiant]!.click();
    expect(onSeekStage).toHaveBeenCalledTimes(1);
    // Viewing the past: phases the live run already reached are reachable again.
    hud.setReachedStage(LifecycleStage.RedGiant);
    hud.setTimeline(timelineView(LifecycleStage.DustCloud, 0.5, stageDurations(1, SOLAR), false));
    segments()[LifecycleStage.RedGiant]!.click();
    expect(onSeekStage).toHaveBeenLastCalledWith(LifecycleStage.RedGiant);
    segments()[LifecycleStage.Death]!.click();
    expect(onSeekStage).toHaveBeenCalledTimes(2);
  });

  it('offers transparent +/− zoom buttons over the scene', () => {
    const { callbacks } = makeHud(container);
    const buttons = [...container.querySelectorAll<HTMLButtonElement>('.zoom-controls__button')];
    expect(buttons.map((b) => b.textContent)).toEqual(['+', '−']);
    expect(buttons[0]!.getAttribute('aria-label')).toBe(i18n.translate('en', 'hud.zoomIn'));
    buttons[0]!.click();
    buttons[1]!.click();
    expect(callbacks.onZoomIn).toHaveBeenCalledTimes(1);
    expect(callbacks.onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('labels the badge paused / rewinding / replay', () => {
    const { hud } = makeHud(container);
    const badge = container.querySelector('.hud-paused') as HTMLElement;
    hud.setRewinding(true);
    expect(badge.textContent).toBe(i18n.translate('en', 'hud.rewinding'));
    hud.setRewinding(false);
    hud.setReplaying(true);
    expect(badge.textContent).toBe(i18n.translate('en', 'hud.replaying'));
    hud.setPaused(true);
    expect(badge.textContent).toBe(i18n.translate('en', 'hud.pausedPast'));
    hud.setReplaying(false);
    expect(badge.textContent).toBe(i18n.translate('en', 'hud.paused'));
    hud.setPaused(false);
    expect(badge.hidden).toBe(true);
  });
});
