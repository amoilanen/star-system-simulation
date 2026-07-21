// Pure classification of a clicked scene object into a localized description
// (FR-8 "click a body to learn what it is"). Maps a picked target — the star in
// its current lifecycle stage, or a celestial body — to stable i18n message ids
// for a title + description (+ an optional note). Kept DOM-free so it is
// unit-testable; the panel and wiring layers do the translation and rendering.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import { BodyType } from '../sim/PhysicsKernel';

/** The star, described by its current lifecycle stage / remnant kind. */
export interface StarPick {
  kind: 'star';
  stage: LifecycleStage;
  remnant: RemnantType | null;
}

/** A celestial body (planet / comet / asteroid), described by type + size. */
export interface BodyPick {
  kind: 'body';
  type: BodyType;
  /** Scene-unit radius, used to tell rocky planets from gas giants. */
  radius: number;
  /** Whether a visiting body has been captured into a stable orbit. */
  captured: boolean;
}

/** A pickable target resolved from a click. */
export type PickTarget = StarPick | BodyPick;

/** Resolved message ids for rendering an info card. */
export interface BodyInfoMessages {
  titleId: string;
  descId: string;
  /** Optional extra sentence (e.g. captured vs. passing). */
  noteId?: string;
}

/**
 * Planets at or above this scene-unit radius are described as gas giants; below
 * it, as rocky/stone planets. Matches the seeded planet radii (0.4 → 0.85).
 */
export const GAS_GIANT_RADIUS = 0.6;

/**
 * Map a picked target to the message ids describing it. Pure — no DOM, no i18n
 * lookups — so the classification can be unit-tested directly.
 */
export function bodyInfoMessages(target: PickTarget): BodyInfoMessages {
  if (target.kind === 'star') {
    return starInfoMessages(target);
  }
  return celestialBodyInfoMessages(target);
}

function starInfoMessages(star: StarPick): BodyInfoMessages {
  switch (star.stage) {
    case LifecycleStage.DustCloud:
    case LifecycleStage.ProtostarCoalescence:
      return { titleId: 'info.protostar.title', descId: 'info.protostar.desc' };
    case LifecycleStage.FusionIgnition:
    case LifecycleStage.MainSequence:
      return { titleId: 'info.mainSequenceStar.title', descId: 'info.mainSequenceStar.desc' };
    case LifecycleStage.RedGiant:
      return { titleId: 'info.redGiant.title', descId: 'info.redGiant.desc' };
    case LifecycleStage.Death:
      return { titleId: 'info.dyingStar.title', descId: 'info.dyingStar.desc' };
    case LifecycleStage.Remnant:
      return remnantInfoMessages(star.remnant);
    default:
      return { titleId: 'info.mainSequenceStar.title', descId: 'info.mainSequenceStar.desc' };
  }
}

function remnantInfoMessages(remnant: RemnantType | null): BodyInfoMessages {
  switch (remnant) {
    case RemnantType.NeutronStar:
      return { titleId: 'info.neutronStar.title', descId: 'info.neutronStar.desc' };
    case RemnantType.Pulsar:
      return { titleId: 'info.pulsar.title', descId: 'info.pulsar.desc' };
    case RemnantType.WhiteDwarf:
    default:
      return { titleId: 'info.whiteDwarf.title', descId: 'info.whiteDwarf.desc' };
  }
}

function celestialBodyInfoMessages(body: BodyPick): BodyInfoMessages {
  const note = body.captured ? 'info.note.captured' : 'info.note.passing';
  switch (body.type) {
    case BodyType.Comet:
      return { titleId: 'info.comet.title', descId: 'info.comet.desc', noteId: note };
    case BodyType.Asteroid:
      return { titleId: 'info.asteroid.title', descId: 'info.asteroid.desc', noteId: note };
    case BodyType.Planet:
    case BodyType.Protoplanet:
    default:
      return body.radius >= GAS_GIANT_RADIUS
        ? { titleId: 'info.gasGiant.title', descId: 'info.gasGiant.desc' }
        : { titleId: 'info.rockyPlanet.title', descId: 'info.rockyPlanet.desc' };
  }
}
