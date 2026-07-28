// Pure label-content model for the on-screen body labels.
//
// Turns raw kernel/lifecycle state into the localized name + the short list of
// physical statistics shown beside each object (mass, temperature, orbital
// velocity — plus the star's CORE temperature). Everything here is DOM-free and
// i18n-free (it returns message ids + interpolation values) so the physics
// formatting can be unit-tested directly; `BodyLabels` renders the result.

import { LifecycleStage, RemnantType } from '../config/fateModel';
import { BodyType } from '../sim/PhysicsKernel';
import {
  coreTemperatureK,
  equilibriumTemperatureK,
  orbitalVelocityKms,
  sceneToAu,
  solarToEarthMasses,
  stellarRadiusForStageSolar,
} from '../sim/astro';
import { planetClassTitleId } from './bodyInfo';
import { mainSequenceTemperature } from '../render/starVisual';

/** One "label: value" statistic line rendered under a label's name. */
export interface LabelStat {
  /** i18n message id for the stat's name (e.g. `label.stat.mass`). */
  labelId: string;
  /** Already-formatted value (units included) — locale-independent numerics. */
  value: string;
}

/** The full content of one on-screen label. */
export interface LabelContent {
  /** i18n message id for the object's name. */
  titleId: string;
  /** Interpolation values for {@link titleId} (e.g. the body number). */
  titleValues?: Record<string, string | number>;
  /** The statistics shown beneath the title. */
  stats: LabelStat[];
}

/** Format a temperature in Kelvin with a sensible magnitude and unit. */
export function formatTemperature(kelvin: number): string {
  if (!Number.isFinite(kelvin) || kelvin <= 0) {
    return '—';
  }
  if (kelvin >= 1e6) {
    return `${(kelvin / 1e6).toPrecision(3)} MK`;
  }
  if (kelvin >= 1e4) {
    return `${Math.round(kelvin / 100) / 10} kK`;
  }
  return `${Math.round(kelvin)} K`;
}

/** Format a mass given in solar masses, choosing solar or Earth units. */
export function formatMass(solarMasses: number): string {
  if (!Number.isFinite(solarMasses) || solarMasses <= 0) {
    return '—';
  }
  // Below ~0.05 M☉ the object is planet-like: Earth masses read far better.
  if (solarMasses < 0.05) {
    const earth = solarToEarthMasses(solarMasses);
    if (earth >= 1000) {
      return `${Math.round(earth).toLocaleString('en-US')} M⊕`;
    }
    return `${earth >= 10 ? Math.round(earth) : Number(earth.toPrecision(2))} M⊕`;
  }
  return `${Number(solarMasses.toPrecision(3))} M☉`;
}

/** Format an orbital speed in km/s. */
export function formatVelocity(kms: number): string {
  if (!Number.isFinite(kms) || kms <= 0) {
    return '—';
  }
  return `${kms >= 100 ? Math.round(kms) : Number(kms.toPrecision(3))} km/s`;
}

/** Format an orbital distance given in scene units, as astronomical units. */
export function formatDistance(sceneDistance: number): string {
  const au = sceneToAu(sceneDistance);
  if (!(au > 0)) {
    return '—';
  }
  return `${au >= 10 ? Math.round(au) : Number(au.toPrecision(2))} AU`;
}

/** The star's effective (surface) temperature for its current stage. */
export function starSurfaceTemperatureK(
  stage: LifecycleStage,
  massSolar: number,
  remnant: RemnantType | null,
): number {
  switch (stage) {
    case LifecycleStage.DustCloud:
      return 20;
    case LifecycleStage.ProtostarCoalescence:
      return 2500;
    case LifecycleStage.FusionIgnition:
      return 4000;
    case LifecycleStage.MainSequence:
      return mainSequenceTemperature(massSolar);
    case LifecycleStage.RedGiant:
      return 3300;
    case LifecycleStage.Death:
      return 8000;
    case LifecycleStage.Remnant:
      switch (remnant) {
        case RemnantType.BrownDwarf:
          // Cool enough for clouds and even rain: L/T dwarfs sit at ~1000-2000 K,
          // far below the ~2400 K floor of the coolest true (M-dwarf) star.
          return 1800;
        case RemnantType.NeutronStar:
          return 6e5;
        case RemnantType.Pulsar:
          return 8e5;
        case RemnantType.BlackHole:
          // An event horizon has no surface at all; the number quoted is the
          // Hawking temperature scale, which for a stellar-mass hole is ~1e-8 K.
          return 0;
        case RemnantType.WhiteDwarf:
        default:
          return 15000;
      }
    default:
      return mainSequenceTemperature(massSolar);
  }
}

/** Build the star's label content: mass, CORE temperature, surface temperature. */
export function starLabelContent(
  stage: LifecycleStage,
  massSolar: number,
  remnant: RemnantType | null,
): LabelContent {
  const surface = starSurfaceTemperatureK(stage, massSolar, remnant);
  const core = coreTemperatureK(stage, massSolar, remnant);
  return {
    titleId: starTitleId(stage, remnant),
    stats: [
      { labelId: 'label.stat.mass', value: formatMass(massSolar) },
      { labelId: 'label.stat.coreTemp', value: formatTemperature(core) },
      { labelId: 'label.stat.surfaceTemp', value: formatTemperature(surface) },
    ],
  };
}

/** i18n id naming the star for its current lifecycle stage. */
export function starTitleId(stage: LifecycleStage, remnant: RemnantType | null): string {
  switch (stage) {
    case LifecycleStage.DustCloud:
    case LifecycleStage.ProtostarCoalescence:
      return 'info.protostar.title';
    case LifecycleStage.RedGiant:
      return 'info.redGiant.title';
    case LifecycleStage.Death:
      return 'info.dyingStar.title';
    case LifecycleStage.Remnant:
      switch (remnant) {
        case RemnantType.BrownDwarf:
          return 'info.brownDwarf.title';
        case RemnantType.NeutronStar:
          return 'info.neutronStar.title';
        case RemnantType.Pulsar:
          return 'info.pulsar.title';
        case RemnantType.BlackHole:
          return 'info.blackHole.title';
        case RemnantType.WhiteDwarf:
        default:
          return 'info.whiteDwarf.title';
      }
    default:
      return 'info.mainSequenceStar.title';
  }
}

/** Raw per-body state a label is derived from. */
export interface BodyLabelInput {
  id: number;
  type: BodyType;
  /** Mass in solar masses (as carried in the kernel body buffer). */
  mass: number;
  /** Visual radius in scene units (distinguishes rocky worlds from giants). */
  radius: number;
  /** Distance from the star in scene units. */
  distanceScene: number;
}

/**
 * Build a body's label content: name plus mass, equilibrium (surface)
 * temperature and orbital velocity — all derived from real physics for the
 * star's current effective temperature and radius.
 */
export function bodyLabelContent(
  body: BodyLabelInput,
  starMassSolar: number,
  starTeffK: number,
  stage: LifecycleStage = LifecycleStage.MainSequence,
  remnant: RemnantType | null = null,
): LabelContent {
  const distanceAu = sceneToAu(body.distanceScene);
  // The star's CURRENT radius: a red giant swells to ~10² R☉ (planets heat
  // up), a compact remnant is tiny (survivors freeze).
  const starRadius = stellarRadiusForStageSolar(stage, starMassSolar, remnant);
  // A 0.3 Bond albedo is Earth-like and keeps the figures recognisable.
  const surface = equilibriumTemperatureK(starTeffK, starRadius, distanceAu, 0.3);
  const velocity = orbitalVelocityKms(starMassSolar, distanceAu);
  return {
    titleId: bodyTitleId(body),
    titleValues: { id: body.id },
    stats: [
      { labelId: 'label.stat.mass', value: formatMass(body.mass) },
      { labelId: 'label.stat.surfaceTemp', value: formatTemperature(surface) },
      { labelId: 'label.stat.velocity', value: formatVelocity(velocity) },
      { labelId: 'label.stat.distance', value: formatDistance(body.distanceScene) },
    ],
  };
}

/** i18n id naming a celestial body by kind (and, for planets, by MASS class). */
export function bodyTitleId(body: Pick<BodyLabelInput, 'type' | 'mass'>): string {
  switch (body.type) {
    case BodyType.Comet:
      return 'info.comet.title';
    case BodyType.Asteroid:
      return 'info.asteroid.title';
    case BodyType.Protoplanet:
      return 'info.protoplanet.title';
    case BodyType.Planet:
    default:
      return planetClassTitleId(body.mass);
  }
}
