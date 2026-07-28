// Setup presets (FR-11, A5). Each preset maps to a full, valid parameter set so
// non-expert users can start with one click. 'sun-like' is the default. Presets
// intentionally span every death path for educational contrast:
//   - sun-like / low-mass → white dwarf
//   - high-mass           → supernova → pulsar
//   - black-hole          → the most massive clouds collapse to a black hole
//
// IMPORTANT: `mass` is the CLOUD mass, and a cloud only ever turns about a third
// of itself into a star (see `starFormation.ts`). Each preset therefore states
// the star it is aiming for and derives the cloud it needs, so "Sun-like" really
// does produce a ~1 M☉ star rather than a 0.34 M☉ red dwarf.

import {
  normalizeComposition,
  type CloudComposition,
  type Locale,
  type SimulationConfig,
} from './SimulationConfig';
import { cloudMassForStar } from './starFormation';

/** Parameters a preset supplies, minus per-session UI choices. */
export interface SimulationPreset {
  id: string;
  /** i18n message id for the preset's human-readable name. */
  nameMessageId: string;
  composition: CloudComposition;
  /** Mass in solar masses (M☉). */
  mass: number;
  /** Initial cloud radius in scene/AU units. */
  cloudExtent: number;
  /** Default normalized pace 0..1. */
  pace: number;
}

/** Id of the preset applied by default on first load. */
export const DEFAULT_PRESET_ID = 'sun-like';

/** Round a derived cloud mass to a tidy slider-friendly value. */
function cloudFor(starMass: number, metals: number): number {
  return Math.round(cloudMassForStar(starMass, metals) * 10) / 10;
}

/** All available presets, keyed by id. */
export const PRESETS: Readonly<Record<string, SimulationPreset>> = {
  'sun-like': {
    id: 'sun-like',
    nameMessageId: 'preset.sunLike',
    composition: { hydrogen: 0.74, helium: 0.24, metals: 0.02 },
    // ~1 M☉ star → white dwarf.
    mass: cloudFor(1, 0.02),
    cloudExtent: 50,
    pace: 0.5,
  },
  'low-mass': {
    id: 'low-mass',
    nameMessageId: 'preset.lowMass',
    composition: { hydrogen: 0.76, helium: 0.235, metals: 0.005 },
    // ~0.5 M☉ red dwarf → white dwarf (after a very long life).
    mass: cloudFor(0.5, 0.005),
    cloudExtent: 35,
    pace: 0.5,
  },
  'high-mass': {
    id: 'high-mass',
    nameMessageId: 'preset.highMass',
    composition: { hydrogen: 0.72, helium: 0.26, metals: 0.02 },
    // ~16 M☉ star → supernova → pulsar.
    mass: cloudFor(16, 0.02),
    cloudExtent: 90,
    pace: 0.5,
  },
  'black-hole': {
    id: 'black-hole',
    nameMessageId: 'preset.blackHole',
    // Metal-poor gas drives weaker winds, so the star keeps more of its mass —
    // which is exactly how the real universe makes its heaviest black holes.
    composition: { hydrogen: 0.755, helium: 0.244, metals: 0.001 },
    // ~30 M☉ star → core collapse straight past the neutron-star limit.
    mass: cloudFor(30, 0.001),
    cloudExtent: 120,
    pace: 0.5,
  },
} as const;

/** Overridable per-session choices layered on top of a preset. */
export interface PresetSessionOptions {
  locale?: Locale;
  showEventAnnotations?: boolean;
}

/**
 * Build a full, valid {@link SimulationConfig} from a preset id plus the
 * per-session UI choices. Composition is normalized so fractions sum to 1.
 * Throws if the preset id is unknown.
 */
export function configFromPreset(
  presetId: string,
  options: PresetSessionOptions = {},
): SimulationConfig {
  const preset = PRESETS[presetId];
  if (!preset) {
    throw new RangeError(`Unknown preset id: ${presetId}`);
  }
  return {
    locale: options.locale ?? 'en',
    composition: normalizeComposition(preset.composition),
    mass: preset.mass,
    cloudExtent: preset.cloudExtent,
    pace: preset.pace,
    showEventAnnotations: options.showEventAnnotations ?? false,
    presetId: preset.id,
  };
}
