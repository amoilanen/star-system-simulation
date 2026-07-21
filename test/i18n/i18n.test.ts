import { describe, it, expect } from 'vitest';
import { I18n, CATALOGS, DEFAULT_LOCALE, formatMessage, i18n } from '../../src/i18n/i18n';

// The nine SimEventType members from spec §4.3. i18n must provide exactly one
// message per event so the HUD can annotate every lifecycle/body event (FR-9).
// Kept as a literal here so the i18n step has no dependency on the (later)
// events module while still enforcing coverage.
const EVENT_MESSAGE_IDS = [
  'event.collapseOnset',
  'event.protostarFormed',
  'event.fusionIgnition',
  'event.planetFormed',
  'event.redGiantOnset',
  'event.deathEvent',
  'event.remnantFormed',
  'event.bodyCaptured',
  'event.bodyEjected',
] as const;

describe('catalog completeness', () => {
  it('en and fi expose identical key sets', () => {
    const enKeys = Object.keys(CATALOGS.en).sort();
    const fiKeys = Object.keys(CATALOGS.fi).sort();
    expect(fiKeys).toEqual(enKeys);
  });

  it('provides a message for every SimEventType in both locales', () => {
    for (const id of EVENT_MESSAGE_IDS) {
      expect(CATALOGS.en[id], `en missing ${id}`).toBeTruthy();
      expect(CATALOGS.fi[id], `fi missing ${id}`).toBeTruthy();
    }
  });

  it('has no empty message templates', () => {
    for (const locale of ['en', 'fi'] as const) {
      for (const [key, value] of Object.entries(CATALOGS[locale])) {
        expect(value.trim(), `${locale}:${key} is empty`).not.toBe('');
      }
    }
  });
});

describe('interpolation', () => {
  it('substitutes named parameters', () => {
    expect(formatMessage('Mass: {mass} solar', { mass: 20 }, 'en')).toBe('Mass: 20 solar');
  });

  it('substitutes multiple parameters and preserves surrounding text', () => {
    const out = formatMessage('{a} + {b} = {c}', { a: 1, b: 2, c: 3 }, 'en');
    expect(out).toBe('1 + 2 = 3');
  });

  it('leaves the placeholder intact when a parameter is missing', () => {
    expect(formatMessage('Hello {name}', {}, 'en')).toBe('Hello {name}');
  });

  it('resolves catalog messages with interpolation via translate', () => {
    expect(i18n.translate('en', 'event.remnantFormed', { remnant: 'white dwarf' })).toBe(
      'The star leaves behind a white dwarf.',
    );
  });
});

describe('pluralization', () => {
  it('selects the =0 exact match before category rules (en)', () => {
    expect(i18n.translate('en', 'hud.bodyCount', { count: 0 })).toBe('No orbiting bodies');
  });

  it('selects the one category and replaces # (en)', () => {
    expect(i18n.translate('en', 'hud.bodyCount', { count: 1 })).toBe('1 orbiting body');
  });

  it('selects the other category and replaces # (en)', () => {
    expect(i18n.translate('en', 'hud.bodyCount', { count: 5 })).toBe('5 orbiting bodies');
  });

  it('applies Finnish plural categories', () => {
    expect(i18n.translate('fi', 'hud.bodyCount', { count: 0 })).toBe('Ei kiertäviä kappaleita');
    expect(i18n.translate('fi', 'hud.bodyCount', { count: 1 })).toBe('1 kiertävä kappale');
    expect(i18n.translate('fi', 'hud.bodyCount', { count: 3 })).toBe('3 kiertävää kappaletta');
  });
});

describe('missing-key fallback', () => {
  it('falls back to the default locale when a key is absent in the requested locale', () => {
    const reg = new I18n('en').register('en', { greeting: 'Hello {name}' }).register('fi', {}); // fi intentionally missing the key
    expect(reg.translate('fi', 'greeting', { name: 'Anton' })).toBe('Hello Anton');
  });

  it('returns the raw message id when the key is absent everywhere', () => {
    const reg = new I18n('en').register('en', {});
    expect(reg.translate('en', 'does.not.exist')).toBe('does.not.exist');
  });

  it('uses the default locale plural rules for a fallen-back message', () => {
    const reg = new I18n('en')
      .register('en', { items: '{count, plural, one {# item} other {# items}}' })
      .register('fi', {});
    expect(reg.translate('fi', 'items', { count: 2 })).toBe('2 items');
  });

  it('reports registered locales and membership', () => {
    expect(i18n.hasLocale('en')).toBe(true);
    expect(i18n.hasLocale('fi')).toBe(true);
    expect(i18n.hasLocale('de')).toBe(false);
    expect(i18n.locales().sort()).toEqual(['en', 'fi']);
    expect(DEFAULT_LOCALE).toBe('en');
  });
});
