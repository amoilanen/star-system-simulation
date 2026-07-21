import { describe, it, expect } from 'vitest';
import {
  SimEventType,
  EVENT_MESSAGE_IDS,
  messageIdForEvent,
  createEvent,
  EventBus,
  type SimulationEvent,
} from '../../src/sim/events';
import { CATALOGS } from '../../src/i18n/i18n';

const ALL_EVENT_TYPES = [
  SimEventType.CollapseOnset,
  SimEventType.ProtostarFormed,
  SimEventType.FusionIgnition,
  SimEventType.PlanetFormed,
  SimEventType.RedGiantOnset,
  SimEventType.DeathEvent,
  SimEventType.RemnantFormed,
  SimEventType.BodyCaptured,
  SimEventType.BodyEjected,
] as const;

describe('event message ids', () => {
  it('maps every SimEventType to a message id present in every catalog', () => {
    for (const type of ALL_EVENT_TYPES) {
      const id = messageIdForEvent(type);
      expect(id).toBe(EVENT_MESSAGE_IDS[type]);
      expect(CATALOGS.en[id], `en missing ${id}`).toBeTruthy();
      expect(CATALOGS.fi[id], `fi missing ${id}`).toBeTruthy();
    }
  });

  it('uses a distinct message id per event type', () => {
    const ids = ALL_EVENT_TYPES.map(messageIdForEvent);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('createEvent', () => {
  it('attaches the correct messageId and preserves timing/data', () => {
    const event = createEvent(SimEventType.FusionIgnition, 42, { temperature: 1e7 });
    expect(event.type).toBe(SimEventType.FusionIgnition);
    expect(event.simTime).toBe(42);
    expect(event.messageId).toBe('event.fusionIgnition');
    expect(event.data).toEqual({ temperature: 1e7 });
  });

  it('omits data when none is supplied', () => {
    const event = createEvent(SimEventType.CollapseOnset, 0);
    expect(event.data).toBeUndefined();
  });
});

describe('EventBus', () => {
  it('delivers events to subscribers in emission order with valid messageIds', () => {
    const bus = new EventBus();
    const received: SimulationEvent[] = [];
    bus.subscribe((e) => received.push(e));

    bus.emit({ type: SimEventType.CollapseOnset, simTime: 1 });
    bus.emit({ type: SimEventType.FusionIgnition, simTime: 2 });

    expect(received.map((e) => e.type)).toEqual([
      SimEventType.CollapseOnset,
      SimEventType.FusionIgnition,
    ]);
    expect(received.map((e) => e.messageId)).toEqual([
      'event.collapseOnset',
      'event.fusionIgnition',
    ]);
  });

  it('drains queued events in order and clears the queue', () => {
    const bus = new EventBus();
    bus.emit({ type: SimEventType.ProtostarFormed, simTime: 1 });
    bus.emit({ type: SimEventType.RemnantFormed, simTime: 3, data: { remnant: 'pulsar' } });

    expect(bus.pending).toBe(2);
    const drained = bus.drain();
    expect(drained.map((e) => e.type)).toEqual([
      SimEventType.ProtostarFormed,
      SimEventType.RemnantFormed,
    ]);
    expect(drained[1]?.data).toEqual({ remnant: 'pulsar' });
    expect(bus.pending).toBe(0);
    expect(bus.drain()).toEqual([]);
  });

  it('respects a caller-provided messageId override', () => {
    const bus = new EventBus();
    bus.emit({ type: SimEventType.BodyCaptured, simTime: 5, messageId: 'custom.key' });
    expect(bus.drain()[0]?.messageId).toBe('custom.key');
  });

  it('stops notifying after unsubscribe', () => {
    const bus = new EventBus();
    const received: SimulationEvent[] = [];
    const unsubscribe = bus.subscribe((e) => received.push(e));

    bus.emit({ type: SimEventType.PlanetFormed, simTime: 1 });
    unsubscribe();
    bus.emit({ type: SimEventType.PlanetFormed, simTime: 2 });

    expect(received).toHaveLength(1);
  });
});
