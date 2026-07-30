import { describe, it, expect } from 'vitest';
import {
  bodyLabelContent,
  bodyTitleId,
  formatDistance,
  formatMass,
  formatTemperature,
  formatVelocity,
  isLuminousBody,
  starLabelContent,
  starSurfaceTemperatureK,
} from '../../src/ui/labelInfo';
import { FATE_THRESHOLDS, LifecycleStage, RemnantType } from '../../src/config/fateModel';
import { BROWN_DWARF_TEMPERATURE_K, mainSequenceTemperature } from '../../src/render/starVisual';
import { BodyType } from '../../src/sim/PhysicsKernel';
import { auToScene, SOLAR_EFFECTIVE_TEMPERATURE_K } from '../../src/sim/astro';
import { CATALOGS } from '../../src/i18n/i18n';

describe('formatters', () => {
  it('formats temperatures with a sensible unit', () => {
    expect(formatTemperature(288)).toBe('288 K');
    expect(formatTemperature(15000)).toBe('15 kK');
    expect(formatTemperature(1.57e7)).toContain('MK');
    expect(formatTemperature(0)).toBe('—');
  });

  it('formats planet masses in Earth masses and stars in solar masses', () => {
    expect(formatMass(1)).toBe('1 M☉');
    // Jupiter ≈ 9.55e-4 M☉ ≈ 318 M⊕.
    expect(formatMass(9.55e-4)).toContain('M⊕');
    expect(formatMass(0)).toBe('—');
  });

  it('switches to solar masses at the deuterium-burning limit', () => {
    // Spec §4.2/§4.7: at and above 0.013 M☉ the object FUSES, so it is a brown
    // dwarf or a star and must be quoted in M☉ — "4331 M⊕" reads as a planet.
    const limit = FATE_THRESHOLDS.deuteriumBurningMinMass;
    expect(formatMass(limit)).toContain('M☉');
    expect(formatMass(limit)).not.toContain('M⊕');
    expect(formatMass(limit * 0.99)).toContain('M⊕');
    // Every companion mass the kernel can produce, including the reported 2–3 M☉.
    for (const mass of [0.02, 0.08, 0.42, 1, 2, 3, 20]) {
      expect(formatMass(mass), `${mass} M☉`).toContain('M☉');
    }
  });

  it('formats velocity and distance', () => {
    expect(formatVelocity(29.78)).toBe('29.8 km/s');
    expect(formatVelocity(0)).toBe('—');
    expect(formatDistance(auToScene(1))).toBe('1 AU');
  });
});

describe('starLabelContent', () => {
  it('exposes mass, CORE temperature and surface temperature', () => {
    const content = starLabelContent(LifecycleStage.MainSequence, 1, null);
    const ids = content.stats.map((s) => s.labelId);
    expect(ids).toEqual(['label.stat.mass', 'label.stat.coreTemp', 'label.stat.surfaceTemp']);
    // Solar core ~1.57e7 K reads in megakelvin; surface ~5800 K in kelvin.
    expect(content.stats[1]?.value).toContain('MK');
    const surface = Number.parseFloat(content.stats[2]?.value ?? '0');
    expect(surface).toBeGreaterThan(5000);
    expect(surface).toBeLessThan(6500);
  });

  it('names the star by lifecycle stage', () => {
    expect(starLabelContent(LifecycleStage.RedGiant, 1, null).titleId).toBe('info.redGiant.title');
    expect(starLabelContent(LifecycleStage.Remnant, 20, RemnantType.Pulsar).titleId).toBe(
      'info.pulsar.title',
    );
  });

  it('uses message ids that exist in every catalog', () => {
    const content = starLabelContent(LifecycleStage.MainSequence, 1, null);
    for (const catalog of Object.values(CATALOGS)) {
      expect(catalog[content.titleId]).toBeTruthy();
      for (const stat of content.stats) {
        expect(catalog[stat.labelId], `missing ${stat.labelId}`).toBeTruthy();
      }
    }
  });
});

describe('bodyLabelContent', () => {
  const earthLike = {
    id: 3,
    type: BodyType.Planet,
    mass: 3e-6,
    radius: 0.08,
    distanceScene: auToScene(1),
  };

  it('derives Earth-like temperature and orbital speed at 1 AU', () => {
    const content = bodyLabelContent(earthLike, 1, SOLAR_EFFECTIVE_TEMPERATURE_K);
    const byId = new Map(content.stats.map((s) => [s.labelId, s.value]));
    // ~255 K with a 0.3 Bond albedo, and ~29.8 km/s.
    const temp = Number.parseFloat(byId.get('label.stat.surfaceTemp') ?? '0');
    expect(temp).toBeGreaterThan(240);
    expect(temp).toBeLessThan(270);
    expect(byId.get('label.stat.velocity')).toBe('29.8 km/s');
    expect(byId.get('label.stat.distance')).toBe('1 AU');
  });

  it('reports a colder, slower world further out', () => {
    const far = { ...earthLike, distanceScene: auToScene(9) };
    const near = bodyLabelContent(earthLike, 1, SOLAR_EFFECTIVE_TEMPERATURE_K);
    const outer = bodyLabelContent(far, 1, SOLAR_EFFECTIVE_TEMPERATURE_K);
    const t = (c: typeof near): number =>
      Number.parseFloat(c.stats.find((s) => s.labelId === 'label.stat.surfaceTemp')?.value ?? '0');
    const v = (c: typeof near): number =>
      Number.parseFloat(c.stats.find((s) => s.labelId === 'label.stat.velocity')?.value ?? '0');
    expect(t(outer)).toBeLessThan(t(near));
    expect(v(outer)).toBeLessThan(v(near));
  });

  it('names bodies by kind and mass class', () => {
    const earth = 1 / 332946; // one Earth mass, in solar masses
    expect(bodyTitleId({ type: BodyType.Comet, mass: 1e-12 })).toBe('info.comet.title');
    expect(bodyTitleId({ type: BodyType.Asteroid, mass: 1e-12 })).toBe('info.asteroid.title');
    expect(bodyTitleId({ type: BodyType.Protoplanet, mass: earth })).toBe('info.protoplanet.title');
    // Planets are classified by MASS, not drawn size: Earth → rocky,
    // Neptune (17 M⊕) → ice giant, Jupiter (318 M⊕) → gas giant.
    expect(bodyTitleId({ type: BodyType.Planet, mass: earth })).toBe('info.rockyPlanet.title');
    expect(bodyTitleId({ type: BodyType.Planet, mass: earth * 17 })).toBe('info.iceGiant.title');
    expect(bodyTitleId({ type: BodyType.Planet, mass: earth * 318 })).toBe('info.gasGiant.title');
  });

  it('names a companion star and a brown dwarf, never a planet class', () => {
    // Reported bug 1: a 2–3 M☉ protoplanet was labelled as a gas giant, because
    // the mass classes were open-ended at the top.
    expect(bodyTitleId({ type: BodyType.Star, mass: 2 })).toBe('info.companionStar.title');
    expect(bodyTitleId({ type: BodyType.BrownDwarf, mass: 0.03 })).toBe(
      'info.brownDwarfCompanion.title',
    );
    // Even when the TYPE lane still says "planet" or "protoplanet", the mass
    // decides — a body over the hydrogen-burning limit is a star, full stop.
    for (const type of [BodyType.Planet, BodyType.Protoplanet] as const) {
      expect(bodyTitleId({ type, mass: 3 })).toBe('info.companionStar.title');
      expect(bodyTitleId({ type, mass: 0.02 })).toBe('info.brownDwarfCompanion.title');
    }
  });

  it('reports a companion by its OWN effective temperature, not an equilibrium one', () => {
    const companion = {
      id: 9,
      type: BodyType.Star,
      mass: 2,
      radius: 0.01,
      distanceScene: auToScene(30),
    };
    const content = bodyLabelContent(companion, 1, SOLAR_EFFECTIVE_TEMPERATURE_K);
    const byId = new Map(content.stats.map((s) => [s.labelId, s.value]));
    expect(content.titleId).toBe('info.companionStar.title');
    // Mass in M☉ …
    expect(byId.get('label.stat.mass')).toBe('2 M☉');
    // … and its own ~9000 K photosphere, not the ~50 K a body 30 AU from the
    // primary would be heated to.
    expect(byId.get('label.stat.surfaceTemp')).toBe(formatTemperature(mainSequenceTemperature(2)));
    expect(Number.parseFloat(byId.get('label.stat.surfaceTemp') ?? '0')).toBeGreaterThan(1);

    const dwarf = bodyLabelContent(
      { ...companion, type: BodyType.BrownDwarf, mass: 0.03 },
      1,
      SOLAR_EFFECTIVE_TEMPERATURE_K,
    );
    const dwarfTemp = dwarf.stats.find((s) => s.labelId === 'label.stat.surfaceTemp')?.value;
    expect(dwarf.titleId).toBe('info.brownDwarfCompanion.title');
    expect(dwarfTemp).toBe(formatTemperature(BROWN_DWARF_TEMPERATURE_K));
  });

  it('recognises a shining body from either the type lane or the mass', () => {
    // The renderer routes on the same rule, so the two can never disagree about
    // whether an object gets a ring system or a corona (reported bug 2).
    expect(isLuminousBody(BodyType.Star, 2)).toBe(true);
    expect(isLuminousBody(BodyType.BrownDwarf, 0.03)).toBe(true);
    // Mass alone is enough, even when the type lane still says "planet" …
    expect(isLuminousBody(BodyType.Planet, 3)).toBe(true);
    expect(isLuminousBody(BodyType.Protoplanet, 0.02)).toBe(true);
    // … and the type lane alone is enough, even for an implausibly light one.
    expect(isLuminousBody(BodyType.Star, 0)).toBe(true);
    // Worlds, comets and asteroids never shine.
    for (const type of [
      BodyType.Planet,
      BodyType.Protoplanet,
      BodyType.Comet,
      BodyType.Asteroid,
    ] as const) {
      expect(isLuminousBody(type, 9.55e-4), `${type}`).toBe(false);
    }
  });

  it('uses catalogued ids for a companion label in every locale', () => {
    const content = bodyLabelContent(
      { id: 4, type: BodyType.Star, mass: 0.5, radius: 0.01, distanceScene: auToScene(20) },
      1,
      SOLAR_EFFECTIVE_TEMPERATURE_K,
    );
    for (const catalog of Object.values(CATALOGS)) {
      expect(catalog[content.titleId], `missing ${content.titleId}`).toBeTruthy();
      for (const stat of content.stats) {
        expect(catalog[stat.labelId], `missing ${stat.labelId}`).toBeTruthy();
      }
    }
  });

  it('uses message ids that exist in every catalog', () => {
    const content = bodyLabelContent(earthLike, 1, SOLAR_EFFECTIVE_TEMPERATURE_K);
    for (const catalog of Object.values(CATALOGS)) {
      expect(catalog[content.titleId]).toBeTruthy();
      for (const stat of content.stats) {
        expect(catalog[stat.labelId], `missing ${stat.labelId}`).toBeTruthy();
      }
    }
  });
});

describe('starSurfaceTemperatureK', () => {
  it('is cold for a cloud, solar-like on the main sequence, cool for a giant', () => {
    expect(starSurfaceTemperatureK(LifecycleStage.DustCloud, 1, null)).toBeLessThan(100);
    const main = starSurfaceTemperatureK(LifecycleStage.MainSequence, 1, null);
    expect(main).toBeGreaterThan(5000);
    expect(main).toBeLessThan(6500);
    expect(starSurfaceTemperatureK(LifecycleStage.RedGiant, 1, null)).toBeLessThan(main);
  });
});
