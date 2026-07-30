import { describe, expect, it } from 'vitest';
import { bodyInfoMessages, planetClassTitleId, type PickTarget } from '../../src/ui/bodyInfo';
import {
  FATE_THRESHOLDS,
  isSelfLuminous,
  LifecycleStage,
  RemnantType,
} from '../../src/config/fateModel';
import { BodyType } from '../../src/sim/PhysicsKernel';
import { i18n } from '../../src/i18n/i18n';

describe('bodyInfoMessages', () => {
  it('describes the star by its current lifecycle stage', () => {
    const cases: Array<[LifecycleStage, string]> = [
      [LifecycleStage.DustCloud, 'info.protostar.title'],
      [LifecycleStage.ProtostarCoalescence, 'info.protostar.title'],
      [LifecycleStage.FusionIgnition, 'info.mainSequenceStar.title'],
      [LifecycleStage.MainSequence, 'info.mainSequenceStar.title'],
      [LifecycleStage.RedGiant, 'info.redGiant.title'],
      [LifecycleStage.Death, 'info.dyingStar.title'],
    ];
    for (const [stage, titleId] of cases) {
      const msg = bodyInfoMessages({ kind: 'star', stage, remnant: null });
      expect(msg.titleId).toBe(titleId);
    }
  });

  it('describes each remnant kind at the remnant stage', () => {
    const remnants: Array<[RemnantType, string]> = [
      [RemnantType.WhiteDwarf, 'info.whiteDwarf.title'],
      [RemnantType.NeutronStar, 'info.neutronStar.title'],
      [RemnantType.Pulsar, 'info.pulsar.title'],
    ];
    for (const [remnant, titleId] of remnants) {
      const msg = bodyInfoMessages({ kind: 'star', stage: LifecycleStage.Remnant, remnant });
      expect(msg.titleId).toBe(titleId);
    }
  });

  it('distinguishes rocky planets from gas giants by radius', () => {
    const rocky = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Planet,
      radius: 0.08,
      mass: 1 / 332946, // 1 M⊕
      captured: true,
    });
    const giant = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Planet,
      radius: 0.24,
      mass: 318 / 332946, // Jupiter
      captured: true,
    });
    const iceGiant = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Planet,
      radius: 0.16,
      mass: 17 / 332946, // Neptune
      captured: true,
    });
    expect(rocky.titleId).toBe('info.rockyPlanet.title');
    expect(giant.titleId).toBe('info.gasGiant.title');
    expect(iceGiant.titleId).toBe('info.iceGiant.title');
  });

  it('never describes a self-luminous mass as a planet', () => {
    // Reported bug 1: the gas-giant class was open-ended at the top, so a 2–3 M☉
    // companion — 660 000 M⊕ — came back as "gas giant".
    for (const mass of [FATE_THRESHOLDS.hydrogenBurningMinMass, 0.5, 2, 3, 20]) {
      expect(planetClassTitleId(mass), `${mass} M☉`).toBe('info.companionStar.title');
    }
    for (const mass of [FATE_THRESHOLDS.deuteriumBurningMinMass, 0.02, 0.079]) {
      expect(planetClassTitleId(mass), `${mass} M☉`).toBe('info.brownDwarfCompanion.title');
    }
    // Just below the deuterium limit it is still a world, and still a gas giant.
    expect(planetClassTitleId(FATE_THRESHOLDS.deuteriumBurningMinMass * 0.99)).toBe(
      'info.gasGiant.title',
    );
  });

  it('agrees with the predicate the RENDERER routes on', () => {
    // `BodyRenderer` draws a body as a luminous companion iff `isSelfLuminous`,
    // and the UI names it from `planetClassTitleId`. If the two ever disagree the
    // scene shows a ringed world the panel calls a star, or a bare glowing ball
    // the panel calls a gas giant — both are reported bug 2.
    for (const mass of [0, 1e-9, 3e-6, 9.55e-4, 0.0129, 0.013, 0.05, 0.0799, 0.08, 1, 3, 20]) {
      const luminous = isSelfLuminous(mass);
      const titleId = planetClassTitleId(mass);
      const named =
        titleId === 'info.companionStar.title' || titleId === 'info.brownDwarfCompanion.title';
      expect(named, `${mass} M☉ → ${titleId}`).toBe(luminous);
    }
  });

  it('describes both kinds of companion from the kernel type lane', () => {
    const star = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Star,
      radius: 0.01,
      mass: 2,
      captured: true,
    });
    expect(star.titleId).toBe('info.companionStar.title');
    expect(star.descId).toBe('info.companionStar.desc');

    const dwarf = bodyInfoMessages({
      kind: 'body',
      type: BodyType.BrownDwarf,
      radius: 0.005,
      mass: 0.03,
      captured: true,
    });
    expect(dwarf.titleId).toBe('info.brownDwarfCompanion.title');
    expect(dwarf.descId).toBe('info.brownDwarfCompanion.desc');

    // A stellar mass mislabelled as a planet still resolves to a REAL card, not
    // a `.desc` key derived from a planet title.
    const mislabelled = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Planet,
      radius: 0.01,
      mass: 3,
      captured: true,
    });
    expect(mislabelled.titleId).toBe('info.companionStar.title');
    for (const locale of ['en', 'fi'] as const) {
      expect(i18n.translate(locale, mislabelled.descId)).not.toBe(mislabelled.descId);
    }
  });

  it('notes that a metal-free cloud forms no planets, and only then', () => {
    // Reported bug 4: with no heavier elements there are no condensable solids,
    // so the disc seeds nothing at all — the star's card has to say so.
    const barren = bodyInfoMessages({
      kind: 'star',
      stage: LifecycleStage.MainSequence,
      remnant: null,
      discMetallicity: 0,
    });
    expect(barren.titleId).toBe('info.mainSequenceStar.title');
    expect(barren.noteId).toBe('info.note.noPlanets');

    // Solar composition builds planets, so no note …
    expect(
      bodyInfoMessages({
        kind: 'star',
        stage: LifecycleStage.MainSequence,
        remnant: null,
        discMetallicity: 0.02,
      }).noteId,
    ).toBeUndefined();
    // … and neither does a caller that simply does not know the composition.
    expect(
      bodyInfoMessages({ kind: 'star', stage: LifecycleStage.MainSequence, remnant: null }).noteId,
    ).toBeUndefined();
  });

  it('labels comets and asteroids with a captured/passing note', () => {
    const captured = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Comet,
      radius: 0.3,
      captured: true,
    });
    expect(captured.titleId).toBe('info.comet.title');
    expect(captured.noteId).toBe('info.note.captured');

    const passing = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Asteroid,
      radius: 0.2,
      captured: false,
    });
    expect(passing.titleId).toBe('info.asteroid.title');
    expect(passing.noteId).toBe('info.note.passing');
  });

  it('resolves to real localized strings in both locales', () => {
    const targets: PickTarget[] = [
      { kind: 'star', stage: LifecycleStage.MainSequence, remnant: null },
      { kind: 'star', stage: LifecycleStage.Remnant, remnant: RemnantType.Pulsar },
      { kind: 'body', type: BodyType.Comet, radius: 0.3, captured: false },
      { kind: 'body', type: BodyType.Star, radius: 0.01, mass: 2, captured: true },
      { kind: 'body', type: BodyType.BrownDwarf, radius: 0.005, mass: 0.03, captured: true },
      {
        kind: 'star',
        stage: LifecycleStage.MainSequence,
        remnant: null,
        discMetallicity: 0,
      },
    ];
    for (const target of targets) {
      const { titleId, descId, noteId } = bodyInfoMessages(target);
      for (const locale of ['en', 'fi'] as const) {
        expect(i18n.translate(locale, titleId)).not.toBe(titleId);
        expect(i18n.translate(locale, descId)).not.toBe(descId);
        if (noteId) {
          expect(i18n.translate(locale, noteId)).not.toBe(noteId);
        }
      }
    }
  });
});
