// Simulation event contracts + event bus (spec §4.3, §3.4, FR-5, FR-9).
//
// The educational layer of the simulation is driven by discrete events: the
// stage FSM and the body dynamics emit a `SimulationEvent` at each notable
// moment (collapse onset, fusion ignition, red-giant swell, remnant formation,
// comet capture/ejection, ...). The HUD renders localized annotations for these
// events — but only when the user enabled the toggle (FR-9).
//
// Every event carries a stable i18n `messageId` (an i18n catalog KEY, not the
// resolved text) so the HUD can translate it into the active locale. The
// EventBus attaches the correct `messageId` for an event's type automatically,
// keeping the single source of truth for the type→message mapping here.

/** Discrete simulation events surfaced to the educational layer (spec §4.3). */
export enum SimEventType {
  CollapseOnset,
  ProtostarFormed,
  FusionIgnition, // "start of the nuclear fusion reaction"
  PlanetFormed,
  RedGiantOnset,
  DeathEvent, // supernova / white-dwarf formation
  RemnantFormed,
  BodyCaptured, // comet/asteroid captured
  BodyEjected, // comet/asteroid ejected
}

/**
 * A single simulation event (spec §4.3). `messageId` is an i18n catalog key
 * resolved by the HUD in the active locale, never pre-translated text.
 */
export interface SimulationEvent {
  type: SimEventType;
  /** Simulation-clock timestamp (sim seconds) at which the event occurred. */
  simTime: number;
  /** Optional structured payload, e.g. `{ bodyId }`, `{ remnant }`. */
  data?: Record<string, unknown>;
  /** i18n message key resolved by the HUD in the active locale. */
  messageId: string;
}

/**
 * Single source of truth mapping each {@link SimEventType} to its i18n message
 * key. Keys correspond 1:1 to entries in the locale catalogs (`en.json`,
 * `fi.json`). Kept exhaustive via the `Record<SimEventType, string>` type so a
 * new event member fails to compile until it has a message key.
 */
export const EVENT_MESSAGE_IDS: Readonly<Record<SimEventType, string>> = {
  [SimEventType.CollapseOnset]: 'event.collapseOnset',
  [SimEventType.ProtostarFormed]: 'event.protostarFormed',
  [SimEventType.FusionIgnition]: 'event.fusionIgnition',
  [SimEventType.PlanetFormed]: 'event.planetFormed',
  [SimEventType.RedGiantOnset]: 'event.redGiantOnset',
  [SimEventType.DeathEvent]: 'event.deathEvent',
  [SimEventType.RemnantFormed]: 'event.remnantFormed',
  [SimEventType.BodyCaptured]: 'event.bodyCaptured',
  [SimEventType.BodyEjected]: 'event.bodyEjected',
} as const;

/** Resolve the i18n message key for an event type. */
export function messageIdForEvent(type: SimEventType): string {
  return EVENT_MESSAGE_IDS[type];
}

/**
 * Construct a fully-formed {@link SimulationEvent}, attaching the correct
 * `messageId` for the given type. Pure; does not emit anything.
 */
export function createEvent(
  type: SimEventType,
  simTime: number,
  data?: Record<string, unknown>,
): SimulationEvent {
  const event: SimulationEvent = { type, simTime, messageId: messageIdForEvent(type) };
  if (data !== undefined) {
    event.data = data;
  }
  return event;
}

/** Payload accepted by {@link EventBus.emit}; `messageId` is filled if omitted. */
export type EmittableEvent = Omit<SimulationEvent, 'messageId'> & { messageId?: string };

/** A subscriber invoked synchronously for each emitted event. */
export type EventListener = (event: SimulationEvent) => void;

/** Unsubscribe handle returned by {@link EventBus.subscribe}. */
export type Unsubscribe = () => void;

/**
 * In-memory pub/sub for simulation events. Emitted events are delivered
 * synchronously to subscribers AND queued so a consumer that polls once per
 * frame can {@link drain} them in emission order (spec §2 data-flow). The bus
 * attaches the localized `messageId` for each event's type when absent.
 */
export class EventBus {
  private readonly listeners = new Set<EventListener>();
  private queue: SimulationEvent[] = [];

  /** Register a listener. Returns an idempotent unsubscribe handle. */
  subscribe(listener: EventListener): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an event: fill its `messageId` from the type when omitted, queue it for
   * {@link drain}, then notify subscribers synchronously. Returns the
   * fully-formed event.
   */
  emit(event: EmittableEvent): SimulationEvent {
    const full: SimulationEvent = {
      ...event,
      messageId: event.messageId ?? messageIdForEvent(event.type),
    };
    this.queue.push(full);
    for (const listener of this.listeners) {
      listener(full);
    }
    return full;
  }

  /** Number of events currently queued for draining. */
  get pending(): number {
    return this.queue.length;
  }

  /** Return all queued events in emission order and clear the queue. */
  drain(): SimulationEvent[] {
    const drained = this.queue;
    this.queue = [];
    return drained;
  }

  /** Drop any queued events and all subscribers (used on reset/dispose). */
  clear(): void {
    this.queue = [];
    this.listeners.clear();
  }
}
