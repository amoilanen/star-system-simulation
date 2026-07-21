// Localized event-annotation layer (spec §3.1, FR-9).
//
// When the user enabled "show information about star system events" (FR-9), this
// layer renders a short, localized annotation for each notable simulation event
// (fusion ignition, red-giant onset, comet capture, ...). When the toggle is
// off it renders nothing. Messages are resolved from the i18n catalog by the
// event's stable `messageId` in the active locale (D5, FR-2); enum-valued event
// data (remnant kind, body type) is itself localized before interpolation.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import type { Locale } from '../config/SimulationConfig';
import { BodyType } from '../sim/PhysicsKernel';
import type { SimEventType, SimulationEvent } from '../sim/events';
import { STAGE_ENTRY_EVENT } from '../sim/stages';
import { i18n as sharedI18n, type I18n, type MessageParams } from '../i18n/i18n';
import { STAGE_MESSAGE_IDS } from './Hud';

/**
 * Reverse of {@link STAGE_ENTRY_EVENT}: the lifecycle stage a given event marks
 * entry into. Only the six stage-transition events appear here — capture,
 * ejection and planet-formation events are not stage changes and get no badge.
 */
const EVENT_TARGET_STAGE: Partial<Record<SimEventType, LifecycleStage>> = (() => {
  const map: Partial<Record<SimEventType, LifecycleStage>> = {};
  for (const key of Object.keys(STAGE_ENTRY_EVENT)) {
    const stage = Number(key) as LifecycleStage;
    const type = STAGE_ENTRY_EVENT[stage];
    if (type !== undefined) {
      map[type] = stage;
    }
  }
  return map;
})();

/** RemnantType → i18n message id, for interpolating `{remnant}` into messages. */
export const REMNANT_MESSAGE_IDS: Readonly<Record<RemnantType, string>> = {
  [RemnantType.WhiteDwarf]: 'remnant.whiteDwarf',
  [RemnantType.NeutronStar]: 'remnant.neutronStar',
  [RemnantType.Pulsar]: 'remnant.pulsar',
};

/** BodyType → i18n message id, for interpolating `{body}` into messages. */
export const BODY_TYPE_MESSAGE_IDS: Readonly<Record<BodyType, string>> = {
  [BodyType.Protoplanet]: 'body.protoplanet',
  [BodyType.Planet]: 'body.planet',
  [BodyType.Comet]: 'body.comet',
  [BodyType.Asteroid]: 'body.asteroid',
};

/**
 * Build the interpolation params for an event's annotation, localizing any
 * enum-valued payload (remnant kind, body type) into the active locale so the
 * final message reads naturally. Pure; exported for unit testing.
 */
export function annotationParams(
  event: SimulationEvent,
  i18n: I18n,
  locale: Locale,
): MessageParams {
  const params: MessageParams = {};
  const data = event.data;
  if (!data) {
    return params;
  }
  const remnant = data.remnant;
  if (typeof remnant === 'number' && remnant in REMNANT_MESSAGE_IDS) {
    params.remnant = i18n.translate(locale, REMNANT_MESSAGE_IDS[remnant as RemnantType]);
  }
  const bodyType = data.bodyType;
  if (typeof bodyType === 'number' && bodyType in BODY_TYPE_MESSAGE_IDS) {
    params.body = i18n.translate(locale, BODY_TYPE_MESSAGE_IDS[bodyType as BodyType]);
  }
  if (typeof data.bodyId === 'number') {
    params.id = data.bodyId;
  }
  return params;
}

/** Options for constructing an {@link EventAnnotations} layer. */
export interface EventAnnotationsOptions {
  container: HTMLElement;
  i18n?: I18n;
  locale: Locale;
  /** Whether annotations are shown at all (FR-9 toggle). */
  enabled: boolean;
  /** Max annotations kept in the DOM at once. Default 6. */
  maxVisible?: number;
}

/**
 * Renders localized annotations for simulation events, but only while enabled.
 * The wiring layer feeds it drained events each frame via {@link show}.
 */
export class EventAnnotations {
  private readonly i18n: I18n;
  private locale: Locale;
  private enabled: boolean;
  private readonly maxVisible: number;
  private readonly root: HTMLDivElement;

  constructor(options: EventAnnotationsOptions) {
    this.i18n = options.i18n ?? sharedI18n;
    this.locale = options.locale;
    this.enabled = options.enabled;
    this.maxVisible = options.maxVisible ?? 6;

    this.root = document.createElement('div');
    this.root.className = 'event-annotations';
    this.root.setAttribute('aria-live', 'polite');
    options.container.appendChild(this.root);
  }

  /** The annotation layer's root element. */
  get element(): HTMLDivElement {
    return this.root;
  }

  /**
   * Resolve the localized annotation text for an event, or `null` when the
   * layer is disabled (FR-9). Pure aside from reading the current locale/enabled
   * flag; used both by {@link show} and directly in tests.
   */
  resolve(event: SimulationEvent): string | null {
    if (!this.enabled) {
      return null;
    }
    return this.i18n.translate(
      this.locale,
      event.messageId,
      annotationParams(event, this.i18n, this.locale),
    );
  }

  /**
   * Render an annotation for an event when enabled; a no-op returning `null`
   * when disabled. Trims the oldest entries beyond {@link maxVisible}.
   */
  show(event: SimulationEvent): HTMLElement | null {
    const text = this.resolve(event);
    if (text === null) {
      return null;
    }
    const entry = document.createElement('div');
    entry.className = 'event-annotation';

    // Stage-transition events get a header naming the stage the star enters, so
    // the annotation states which phase the star is transitioning to.
    const stage = EVENT_TARGET_STAGE[event.type];
    if (stage !== undefined) {
      entry.classList.add('event-annotation--stage');
      const badge = document.createElement('span');
      badge.className = 'event-annotation__stage';
      badge.textContent = this.i18n.translate(this.locale, STAGE_MESSAGE_IDS[stage]);
      const body = document.createElement('span');
      body.className = 'event-annotation__text';
      body.textContent = text;
      entry.append(badge, body);
    } else {
      entry.textContent = text;
    }

    this.root.appendChild(entry);
    this.trim();
    return entry;
  }

  /**
   * Keep at most {@link maxVisible} annotations, preferring to evict the oldest
   * transient events (captures/ejections) so the milestone stage-transition
   * annotations stay visible rather than being flushed out by frequent visitors.
   */
  private trim(): void {
    while (this.root.childElementCount > this.maxVisible) {
      const children = Array.from(this.root.children);
      const evictable =
        children.find((c) => !c.classList.contains('event-annotation--stage')) ?? children[0];
      evictable?.remove();
    }
  }

  /** Enable/disable the layer; disabling clears any visible annotations. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  /** Whether annotations are currently shown. */
  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Switch the locale used for subsequently shown annotations. */
  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  /** Remove all visible annotations. */
  clear(): void {
    this.root.replaceChildren();
  }

  /** Remove the layer from the DOM. */
  destroy(): void {
    this.root.remove();
  }
}
