// Pure classification of a clicked scene object into a localized description
// (FR-8 "click a body to learn what it is"). Maps a picked target — the star in
// its current lifecycle stage, or a celestial body — to stable i18n message ids
// for a title + description (+ an optional note). Kept DOM-free so it is
// unit-testable; the panel and wiring layers do the translation and rendering.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import { BodyType } from '../sim/PhysicsKernel';
import { solarToEarthMasses } from '../sim/astro';

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
  /** Scene-unit radius (visual size). */
  radius: number;
  /** Mass in solar masses, used to classify the planet (rocky/ice/gas giant). */
  mass?: number;
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
 * Planet classification thresholds in EARTH MASSES. Classifying by mass rather
 * than by drawn size matches how astronomers actually distinguish these worlds
 * and stays correct however the visual scale is tuned:
 *   < 8 M⊕  terrestrial/rocky (Earth 1, Venus 0.8)
 *   8–50 M⊕ ice giant        (Uranus 14.5, Neptune 17)
 *   ≥ 50 M⊕ gas giant        (Saturn 95, Jupiter 318)
 */
export const ICE_GIANT_MIN_EARTH_MASSES = 8;
export const GAS_GIANT_MIN_EARTH_MASSES = 50;

/**
 * i18n title id for a planet of `massSolar`, by mass class. Pure; shared by the
 * label overlay and the click-to-inspect panel so both agree.
 */
export function planetClassTitleId(massSolar: number): string {
  const earthMasses = solarToEarthMasses(massSolar);
  if (earthMasses >= GAS_GIANT_MIN_EARTH_MASSES) {
    return 'info.gasGiant.title';
  }
  if (earthMasses >= ICE_GIANT_MIN_EARTH_MASSES) {
    return 'info.iceGiant.title';
  }
  return 'info.rockyPlanet.title';
}

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
    case RemnantType.BlackHole:
      return { titleId: 'info.blackHole.title', descId: 'info.blackHole.desc' };
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
    default: {
      const titleId = planetClassTitleId(body.mass ?? 0);
      const descId = `${titleId.slice(0, -'.title'.length)}.desc`;
      return { titleId, descId };
    }
  }
}
