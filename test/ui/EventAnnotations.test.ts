// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { EventAnnotations } from '../../src/ui/EventAnnotations';
import { createEvent, SimEventType } from '../../src/sim/events';
import { RemnantType } from '../../src/config/fateModel';
import { BodyType } from '../../src/sim/PhysicsKernel';
import { i18n } from '../../src/i18n/i18n';

describe('EventAnnotations', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.replaceChildren();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('omits annotations entirely when disabled (FR-9)', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: false });
    const event = createEvent(SimEventType.FusionIgnition, 1);
    expect(layer.resolve(event)).toBeNull();
    expect(layer.show(event)).toBeNull();
    expect(layer.element.childElementCount).toBe(0);
  });

  it('resolves and renders the localized message when enabled', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: true });
    const event = createEvent(SimEventType.FusionIgnition, 1);
    expect(layer.resolve(event)).toBe(i18n.translate('en', 'event.fusionIgnition'));
    const node = layer.show(event);
    expect(node).not.toBeNull();
    expect(layer.element.childElementCount).toBe(1);
    // Stage-transition events render the message plus a header naming the stage
    // the star enters (fusion ignition → main sequence).
    expect(node!.textContent).toContain(i18n.translate('en', 'event.fusionIgnition'));
    expect(node!.textContent).toContain(i18n.translate('en', 'stage.mainSequence'));
  });

  it('resolves the correct localized string per event type in Finnish', () => {
    const layer = new EventAnnotations({ container, locale: 'fi', enabled: true });
    for (const type of [
      SimEventType.CollapseOnset,
      SimEventType.ProtostarFormed,
      SimEventType.FusionIgnition,
      SimEventType.PlanetFormed,
      SimEventType.RedGiantOnset,
      SimEventType.DeathEvent,
    ]) {
      const event = createEvent(type, 0);
      expect(layer.resolve(event)).toBe(i18n.translate('fi', event.messageId));
    }
  });

  it('localizes enum payloads (remnant kind) into the message', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: true });
    const event = createEvent(SimEventType.RemnantFormed, 5, {
      remnant: RemnantType.Pulsar,
      supernova: true,
    });
    const expected = i18n.translate('en', 'event.remnantFormed', {
      remnant: i18n.translate('en', 'remnant.pulsar'),
    });
    expect(layer.resolve(event)).toBe(expected);
    expect(layer.resolve(event)).toContain('pulsar');
  });

  it('localizes body-type payloads for capture/ejection events', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: true });
    const event = createEvent(SimEventType.BodyCaptured, 5, {
      bodyId: 7,
      bodyType: BodyType.Comet,
    });
    const expected = i18n.translate('en', 'event.bodyCaptured', {
      body: i18n.translate('en', 'body.comet'),
      id: 7,
    });
    expect(layer.resolve(event)).toBe(expected);
    expect(layer.resolve(event)).toContain('comet');
  });

  it('labels stage-transition annotations with the stage the star enters', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: true });

    // Red-giant onset is a stage transition → shows the "Red giant" stage badge.
    const transition = layer.show(createEvent(SimEventType.RedGiantOnset, 1));
    const badge = transition!.querySelector('.event-annotation__stage');
    expect(badge?.textContent).toBe(i18n.translate('en', 'stage.redGiant'));

    // A capture event is not a stage change → no stage badge.
    const capture = layer.show(
      createEvent(SimEventType.BodyCaptured, 2, { bodyId: 1, bodyType: BodyType.Comet }),
    );
    expect(capture!.querySelector('.event-annotation__stage')).toBeNull();
  });

  it('keeps stage-transition annotations visible despite a flood of captures', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: true, maxVisible: 3 });
    layer.show(createEvent(SimEventType.FusionIgnition, 0)); // milestone
    for (let i = 1; i <= 10; i += 1) {
      layer.show(
        createEvent(SimEventType.BodyCaptured, i, { bodyId: i, bodyType: BodyType.Comet }),
      );
    }
    expect(layer.element.childElementCount).toBe(3);
    // The milestone survives the eviction; only transient captures are dropped.
    expect(layer.element.querySelector('.event-annotation--stage')).not.toBeNull();
    expect(layer.element.textContent).toContain(i18n.translate('en', 'stage.mainSequence'));
  });

  it('respects a live toggle and clears on disable', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: true });
    layer.show(createEvent(SimEventType.FusionIgnition, 1));
    expect(layer.element.childElementCount).toBe(1);
    layer.setEnabled(false);
    expect(layer.element.childElementCount).toBe(0);
    expect(layer.show(createEvent(SimEventType.FusionIgnition, 2))).toBeNull();
  });

  it('caps the number of visible annotations', () => {
    const layer = new EventAnnotations({ container, locale: 'en', enabled: true, maxVisible: 2 });
    for (let i = 0; i < 5; i += 1) {
      layer.show(createEvent(SimEventType.PlanetFormed, i));
    }
    expect(layer.element.childElementCount).toBe(2);
  });
});
