// i18n catalog registry + message formatter (spec §1.2, §3.5, FR-2, D5).
//
// No display string is hard-coded anywhere in the app: UI and HUD read messages
// from locale catalogs by stable message id. Adding a language is a data-only
// change — register a new catalog, no consumer code changes (FR-2).
//
// The formatter supports:
//   - Interpolation:   "Mass: {mass} M☉"                        → params.mass
//   - Pluralization:   "{count, plural, one {# body} other {# bodies}}"
//                      (ICU-style; selector via Intl.PluralRules for the locale,
//                       `#` is replaced by the numeric argument, `=N` exact
//                       matches are honored before category selection).
//
// Missing keys fall back to the default locale, then to the raw message id, so a
// partially-translated catalog never crashes the UI.

import type { Locale } from '../config/SimulationConfig';
import enCatalog from './en.json';
import fiCatalog from './fi.json';

/** Values that can be interpolated into a message. */
export type MessageParams = Record<string, string | number>;

/** A flat map of stable message id → message template for one locale. */
export type MessageCatalog = Record<string, string>;

/** Locale used when a key is missing from the requested locale. */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Registry of locale catalogs plus a formatter. Instances are cheap; the module
 * also exports a shared {@link i18n} pre-loaded with `en` and `fi`.
 */
export class I18n {
  private readonly catalogs = new Map<string, MessageCatalog>();
  private readonly pluralRulesCache = new Map<string, Intl.PluralRules>();

  constructor(
    /** Locale returned to when a key is missing from the active locale. */
    public readonly defaultLocale: Locale = DEFAULT_LOCALE,
  ) {}

  /** Register (or replace) the catalog for a locale. Returns `this` for chaining. */
  register(locale: string, catalog: MessageCatalog): this {
    this.catalogs.set(locale, catalog);
    return this;
  }

  /** True when a catalog has been registered for the locale. */
  hasLocale(locale: string): boolean {
    return this.catalogs.has(locale);
  }

  /** All registered locales. */
  locales(): string[] {
    return [...this.catalogs.keys()];
  }

  /**
   * Resolve a message id in `locale`, applying interpolation/pluralization with
   * `params`. Falls back to the default locale, then to the raw `messageId`.
   */
  translate(locale: string, messageId: string, params: MessageParams = {}): string {
    const template = this.lookup(locale, messageId);
    if (template === undefined) {
      return messageId;
    }
    return formatMessage(template, params, this.resolveFormatLocale(locale, messageId));
  }

  /** Raw template lookup with default-locale fallback (no formatting). */
  private lookup(locale: string, messageId: string): string | undefined {
    const primary = this.catalogs.get(locale);
    const direct = primary?.[messageId];
    if (direct !== undefined) {
      return direct;
    }
    if (locale !== this.defaultLocale) {
      return this.catalogs.get(this.defaultLocale)?.[messageId];
    }
    return undefined;
  }

  /** Choose the locale whose catalog actually supplied the resolved template. */
  private resolveFormatLocale(locale: string, messageId: string): string {
    const primary = this.catalogs.get(locale);
    if (primary?.[messageId] !== undefined) {
      return locale;
    }
    return this.defaultLocale;
  }

  /** Cached {@link Intl.PluralRules} per locale. */
  pluralRules(locale: string): Intl.PluralRules {
    let rules = this.pluralRulesCache.get(locale);
    if (!rules) {
      rules = new Intl.PluralRules(locale);
      this.pluralRulesCache.set(locale, rules);
    }
    return rules;
  }
}

// --- Formatter --------------------------------------------------------------

/**
 * Format an ICU-lite message template. Exported for direct unit testing; the
 * app uses {@link I18n.translate}.
 */
export function formatMessage(template: string, params: MessageParams, locale: string): string {
  let result = '';
  let i = 0;
  while (i < template.length) {
    const ch = template[i];
    if (ch === '{') {
      const end = findMatchingBrace(template, i);
      if (end === -1) {
        // Unbalanced brace: emit the remainder verbatim.
        result += template.slice(i);
        break;
      }
      result += formatPlaceholder(template.slice(i + 1, end), params, locale);
      i = end + 1;
    } else {
      result += ch;
      i += 1;
    }
  }
  return result;
}

/** Index of the `}` matching the `{` at `open`, honoring nesting; -1 if none. */
function findMatchingBrace(template: string, open: number): number {
  let depth = 0;
  for (let i = open; i < template.length; i += 1) {
    const ch = template[i];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

/** Format the contents of a single `{...}` placeholder. */
function formatPlaceholder(inner: string, params: MessageParams, locale: string): string {
  const firstComma = inner.indexOf(',');
  if (firstComma === -1) {
    // Simple interpolation: `{name}`.
    return interpolate(inner.trim(), params);
  }

  const argName = inner.slice(0, firstComma).trim();
  const secondComma = inner.indexOf(',', firstComma + 1);
  const type = (
    secondComma === -1 ? inner.slice(firstComma + 1) : inner.slice(firstComma + 1, secondComma)
  ).trim();

  if (type === 'plural' && secondComma !== -1) {
    return formatPlural(argName, inner.slice(secondComma + 1), params, locale);
  }

  // Unknown format type — degrade gracefully to plain interpolation.
  return interpolate(argName, params);
}

/** Replace a single argument name with its stringified param value. */
function interpolate(name: string, params: MessageParams): string {
  const value = params[name];
  return value === undefined ? `{${name}}` : String(value);
}

/** Format a `{arg, plural, ...options}` placeholder. */
function formatPlural(
  argName: string,
  optionsBlock: string,
  params: MessageParams,
  locale: string,
): string {
  const raw = params[argName];
  const count = typeof raw === 'number' ? raw : Number(raw);
  const options = parsePluralOptions(optionsBlock);

  const exact = options.get(`=${count}`);
  const category = Number.isFinite(count) ? new Intl.PluralRules(locale).select(count) : 'other';
  const selected = exact ?? options.get(category) ?? options.get('other') ?? '';

  // Recurse so sub-messages may contain their own placeholders; `#` → count.
  const replaced = selected.replace(/#/g, String(count));
  return formatMessage(replaced, params, locale);
}

/** Parse `one {..} other {..} =0 {..}` into a selector → sub-message map. */
function parsePluralOptions(block: string): Map<string, string> {
  const options = new Map<string, string>();
  let i = 0;
  while (i < block.length) {
    // Skip whitespace between options.
    while (i < block.length && /\s/.test(block[i] as string)) {
      i += 1;
    }
    if (i >= block.length) {
      break;
    }
    // Read selector token up to the next `{`.
    const braceStart = block.indexOf('{', i);
    if (braceStart === -1) {
      break;
    }
    const selector = block.slice(i, braceStart).trim();
    const braceEnd = findMatchingBrace(block, braceStart);
    if (braceEnd === -1) {
      break;
    }
    if (selector) {
      options.set(selector, block.slice(braceStart + 1, braceEnd));
    }
    i = braceEnd + 1;
  }
  return options;
}

// --- Shared instance --------------------------------------------------------

/** All bundled catalogs, keyed by locale. Exported for catalog-parity tests. */
export const CATALOGS: Readonly<Record<Locale, MessageCatalog>> = {
  en: enCatalog as MessageCatalog,
  fi: fiCatalog as MessageCatalog,
};

/** Shared registry pre-loaded with the bundled `en` and `fi` catalogs. */
export const i18n = new I18n(DEFAULT_LOCALE)
  .register('en', CATALOGS.en)
  .register('fi', CATALOGS.fi);
