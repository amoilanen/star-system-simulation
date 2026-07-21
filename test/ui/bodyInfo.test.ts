import { describe, expect, it } from 'vitest';
import { bodyInfoMessages, GAS_GIANT_RADIUS, type PickTarget } from '../../src/ui/bodyInfo';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
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
      radius: GAS_GIANT_RADIUS - 0.1,
      captured: true,
    });
    const giant = bodyInfoMessages({
      kind: 'body',
      type: BodyType.Planet,
      radius: GAS_GIANT_RADIUS + 0.1,
      captured: true,
    });
    expect(rocky.titleId).toBe('info.rockyPlanet.title');
    expect(giant.titleId).toBe('info.gasGiant.title');
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
