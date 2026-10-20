import { describe, it, expect } from 'vitest';
import {
  STAGE_ORDER,
  STAGE_ENTRY_EVENT,
  DEATH_PHASES,
  NEBULA_PHASES,
  stageDurations,
  mainSequenceLifetimeSeconds,
  preMainSequenceSeconds,
} from '../../src/sim/stages';
import { EVENT_MESSAGE_IDS, SimEventType } from '../../src/sim/events';
import { LifecycleStage } from '../../src/config/fateModel';
import { CATALOGS } from '../../src/i18n/i18n';
import type { CloudComposition } from '../../src/config/SimulationConfig';

// NB `stages.ts` deliberately holds no state machine: both kernels drive the
// progression themselves, because only they know the accreted core mass that
// makes FORMATION physics-driven rather than timed — and only they know that a
// SUBSTELLAR object short-circuits the order entirely (a brown dwarf never
// ignites, so it goes straight from FusionIgnition to Remnant). What lives here
// is the shared ordering, the entry events, the death's internal structure and
// the illustrative durations, so that is what this file tests. End-to-end stage
// and event behaviour is covered against the real kernels in
// `TsFallbackKernel.test.ts`, `WasmKernel.test.ts` and the simulation battery.

const SOLAR_COMPOSITION: CloudComposition = { hydrogen: 0.74, helium: 0.24, metals: 0.02 };
const YEAR = 365.25 * 24 * 3600;
const MYR = 1e6 * YEAR;
const GYR = 1e9 * YEAR;

describe('STAGE_ORDER', () => {
  it('walks the full lifecycle in the spec order', () => {
    expect(STAGE_ORDER).toEqual([
      LifecycleStage.DustCloud,
      LifecycleStage.ProtostarCoalescence,
      LifecycleStage.FusionIgnition,
      LifecycleStage.MainSequence,
      LifecycleStage.RedGiant,
      LifecycleStage.Death,
      LifecycleStage.Remnant,
    ]);
  });

  it('is strictly increasing, so "later stage" comparisons are sound', () => {
    // Both kernels compare stages with `<` / `>=` ("has the star ignited yet?",
    // "is it past the death?"), which only means anything while the enum's
    // numeric order matches the timeline.
    for (let i = 1; i < STAGE_ORDER.length; i += 1) {
      expect(STAGE_ORDER[i]!).toBeGreaterThan(STAGE_ORDER[i - 1]!);
    }
  });
});

describe('STAGE_ENTRY_EVENT', () => {
  it('gives every stage except the initial one exactly one entry event', () => {
    // DustCloud is where the simulation begins, so nothing is ever "entered".
    expect(STAGE_ENTRY_EVENT[LifecycleStage.DustCloud]).toBeUndefined();
    const entered = STAGE_ORDER.filter((s) => s !== LifecycleStage.DustCloud);
    for (const stage of entered) {
      expect(STAGE_ENTRY_EVENT[stage]).toBeDefined();
    }
    // Six transitions between seven stages ⇒ six events, never duplicated.
    const events = entered.map((s) => STAGE_ENTRY_EVENT[s]);
    expect(events).toHaveLength(6);
    expect(new Set(events).size).toBe(6);
  });

  it('maps each stage to the event that announces it, in order', () => {
    const events = STAGE_ORDER.filter((s) => s !== LifecycleStage.DustCloud).map(
      (s) => STAGE_ENTRY_EVENT[s],
    );
    expect(events).toEqual([
      SimEventType.CollapseOnset,
      SimEventType.ProtostarFormed,
      SimEventType.FusionIgnition,
      SimEventType.RedGiantOnset,
      SimEventType.DeathEvent,
      SimEventType.RemnantFormed,
    ]);
  });

  it('has a translatable message for every entry event in every locale', () => {
    for (const stage of STAGE_ORDER.filter((s) => s !== LifecycleStage.DustCloud)) {
      const messageId = EVENT_MESSAGE_IDS[STAGE_ENTRY_EVENT[stage]!];
      expect(messageId).toBeTruthy();
      for (const [locale, catalog] of Object.entries(CATALOGS)) {
        expect(catalog[messageId], `${locale} is missing ${messageId}`).toBeTruthy();
      }
    }
  });
});

describe('stageDurations', () => {
  it('gives every stage a positive duration and a terminal remnant', () => {
    const d = stageDurations(1, SOLAR_COMPOSITION);
    for (const stage of STAGE_ORDER.filter((s) => s !== LifecycleStage.Remnant)) {
      expect(d[stage]).toBeGreaterThan(0);
      expect(Number.isFinite(d[stage])).toBe(true);
    }
    expect(d[LifecycleStage.Remnant]).toBe(Infinity);
  });

  it('makes massive stars live much shorter than low-mass ones', () => {
    const low = stageDurations(0.5, SOLAR_COMPOSITION)[LifecycleStage.MainSequence];
    const sun = stageDurations(1, SOLAR_COMPOSITION)[LifecycleStage.MainSequence];
    const high = stageDurations(20, SOLAR_COMPOSITION)[LifecycleStage.MainSequence];
    expect(low).toBeGreaterThan(sun);
    expect(sun).toBeGreaterThan(high);
    // The scaling is steep: a 20 M☉ star burns out >1000× faster than the Sun.
    expect(sun / high).toBeGreaterThan(1000);
  });

  it('puts a solar main sequence at ~10 Gyr', () => {
    const sun = stageDurations(1, SOLAR_COMPOSITION)[LifecycleStage.MainSequence];
    expect(sun / GYR).toBeGreaterThan(9);
    expect(sun / GYR).toBeLessThan(12);
  });

  it('matches detailed stellar models across the mass range (within 12 %)', () => {
    // Solar-metallicity model lifetimes (Myr), Schaller 1992 / Ekström 2012.
    const models: Array<[number, number]> = [
      [0.8, 2.5e4],
      [1, 1e4],
      [2, 1.1e3],
      [5, 100],
      [9, 28],
      [15, 11.5],
      [20, 8.1],
      [40, 4.3],
      [60, 3.5],
      [120, 2.8],
    ];
    for (const [mass, reference] of models) {
      const myr = mainSequenceLifetimeSeconds(mass, 0.02) / MYR;
      expect(Math.abs(myr / reference - 1), `${mass} M☉: ${myr} Myr`).toBeLessThan(0.12);
    }
  });

  it('never lets even the most massive star live less than ~3 Myr', () => {
    expect(mainSequenceLifetimeSeconds(250, 0.02) / MYR).toBeGreaterThan(2.5);
  });

  it('lets metal-poor stars burn out sooner (lower opacity, more luminous)', () => {
    const poor = stageDurations(1, { hydrogen: 0.79, helium: 0.209, metals: 0.001 });
    const rich = stageDurations(1, { hydrogen: 0.68, helium: 0.22, metals: 0.1 });
    expect(poor[LifecycleStage.MainSequence]).toBeLessThan(rich[LifecycleStage.MainSequence]);
    // Never zero or negative, however extreme the composition.
    expect(mainSequenceLifetimeSeconds(1, 0)).toBeGreaterThan(0);
  });

  it('contracts the Sun for tens of Myr before ignition, a massive star almost not at all', () => {
    const sun = stageDurations(1, SOLAR_COMPOSITION)[LifecycleStage.FusionIgnition] / MYR;
    expect(sun).toBeGreaterThan(20);
    expect(sun).toBeLessThan(60);
    expect(preMainSequenceSeconds(30)).toBeLessThan(preMainSequenceSeconds(1) / 100);
    // A red dwarf takes far longer still.
    expect(preMainSequenceSeconds(0.1)).toBeGreaterThan(preMainSequenceSeconds(1) * 10);
  });

  it('gives a brown dwarf a deuterium-burning phase of ~10–100 Myr', () => {
    const bd = preMainSequenceSeconds(0.04) / MYR;
    expect(bd).toBeGreaterThan(5);
    expect(bd).toBeLessThan(100);
  });

  it('makes a supernova a ~1-year event and a planetary nebula a millennia-long one', () => {
    const sun = stageDurations(1, SOLAR_COMPOSITION)[LifecycleStage.Death];
    const massive = stageDurations(20, SOLAR_COMPOSITION)[LifecycleStage.Death];
    expect(massive / YEAR).toBeLessThanOrEqual(2);
    expect(sun / YEAR).toBeGreaterThan(1e3);
  });
});

describe('DEATH_PHASES', () => {
  it('orders shock breakout before peak luminosity, both inside the stage', () => {
    expect(DEATH_PHASES.shockBreakout).toBeGreaterThan(0);
    expect(DEATH_PHASES.shockBreakout).toBeLessThan(DEATH_PHASES.peakLuminosity);
    expect(DEATH_PHASES.peakLuminosity).toBeLessThan(1);
  });

  it('reserves enough steps for the death to be watchable', () => {
    expect(DEATH_PHASES.minSteps).toBeGreaterThan(1);
    // The shock must not land on the very first step, or there is no build-up.
    expect(DEATH_PHASES.minSteps * DEATH_PHASES.shockBreakout).toBeGreaterThan(1);
  });
});

describe('NEBULA_PHASES', () => {
  it('leaves the shell inside the framed system when the remnant appears', () => {
    // `1 − e^-0.6 ≈ 45 %` of the stall radius, which is 1.4–1.5 cloud radii, so
    // the nebula is still on screen at the handover instead of long gone.
    const atRemnant = 1 - Math.exp(-NEBULA_PHASES.deathSweep);
    expect(atRemnant).toBeGreaterThan(0.3);
    expect(atRemnant).toBeLessThan(0.6);
  });

  it('goes on expanding, ever more slowly, for the whole remnant stage', () => {
    const atRemnant = 1 - Math.exp(-NEBULA_PHASES.deathSweep);
    const atFade = 1 - Math.exp(-(NEBULA_PHASES.deathSweep + NEBULA_PHASES.remnantSweep));
    expect(atFade).toBeGreaterThan(atRemnant);
    // …and never past the stall radius: a nebula settles, it does not run away.
    expect(atFade).toBeLessThan(1);
  });

  it('mirrors the kernel exactly (EJECTA_DRAG × its two clocks)', () => {
    // Rust: DEATH_SWEEP = EJECTA_DRAG × DEATH_ORBITAL_SPAN and
    // EJECTA_DRAG × EJECTA_LIFETIME — pinned on both sides so the drawn shock
    // front cannot drift away from the gas it is drawn around.
    expect(NEBULA_PHASES.deathSweep).toBe(0.6);
    expect(NEBULA_PHASES.remnantSweep).toBe(3.25);
  });
});
