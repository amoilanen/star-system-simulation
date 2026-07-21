// Body info panel (FR-8): a small localized card that explains what the clicked
// object is — the star at its current stage, a rocky planet, a gas giant, a
// comet, an asteroid, or a stellar remnant. The classification is done by the
// pure {@link bodyInfoMessages}; this component only renders + translates.

import type { Locale } from '../config/SimulationConfig';
import { i18n as sharedI18n, type I18n } from '../i18n/i18n';
import type { BodyInfoMessages } from './bodyInfo';

/** Options for constructing a {@link BodyInfoPanel}. */
export interface BodyInfoPanelOptions {
  container: HTMLElement;
  i18n?: I18n;
  locale: Locale;
}

/** A dismissible card describing the currently-selected body. */
export class BodyInfoPanel {
  private readonly i18n: I18n;
  private locale: Locale;
  private readonly root: HTMLDivElement;
  private readonly headingEl: HTMLSpanElement;
  private readonly closeButton: HTMLButtonElement;
  private readonly titleEl: HTMLHeadingElement;
  private readonly descEl: HTMLParagraphElement;
  private readonly noteEl: HTMLParagraphElement;

  /** The messages currently shown, so the panel can re-translate on locale change. */
  private current: BodyInfoMessages | null = null;

  constructor(options: BodyInfoPanelOptions) {
    this.i18n = options.i18n ?? sharedI18n;
    this.locale = options.locale;

    this.root = document.createElement('div');
    this.root.className = 'body-info';
    this.root.hidden = true;

    const header = document.createElement('div');
    header.className = 'body-info__header';
    this.headingEl = document.createElement('span');
    this.headingEl.className = 'body-info__heading';
    this.closeButton = document.createElement('button');
    this.closeButton.type = 'button';
    this.closeButton.className = 'body-info__close';
    this.closeButton.setAttribute('aria-label', this.t('info.close'));
    this.closeButton.textContent = '×';
    this.closeButton.addEventListener('click', () => this.hide());
    header.append(this.headingEl, this.closeButton);

    this.titleEl = document.createElement('h3');
    this.titleEl.className = 'body-info__title';
    this.descEl = document.createElement('p');
    this.descEl.className = 'body-info__desc';
    this.noteEl = document.createElement('p');
    this.noteEl.className = 'body-info__note';

    this.root.append(header, this.titleEl, this.descEl, this.noteEl);
    options.container.appendChild(this.root);
    this.applyStaticLabels();
  }

  /** The panel root element (for testing / manual mounting). */
  get element(): HTMLDivElement {
    return this.root;
  }

  /** Whether the panel is currently visible. */
  get isVisible(): boolean {
    return !this.root.hidden;
  }

  /** Show the panel populated from the resolved info messages. */
  show(messages: BodyInfoMessages): void {
    this.current = messages;
    this.render();
    this.root.hidden = false;
  }

  /** Hide the panel. */
  hide(): void {
    this.root.hidden = true;
  }

  /** Switch locale and re-translate any shown content. */
  setLocale(locale: Locale): void {
    this.locale = locale;
    this.applyStaticLabels();
    this.render();
  }

  /** Remove the panel from the DOM. */
  destroy(): void {
    this.root.remove();
  }

  private render(): void {
    if (this.current === null) {
      return;
    }
    this.titleEl.textContent = this.t(this.current.titleId);
    this.descEl.textContent = this.t(this.current.descId);
    if (this.current.noteId) {
      this.noteEl.textContent = this.t(this.current.noteId);
      this.noteEl.hidden = false;
    } else {
      this.noteEl.textContent = '';
      this.noteEl.hidden = true;
    }
  }

  private applyStaticLabels(): void {
    this.headingEl.textContent = this.t('info.heading');
    this.closeButton.setAttribute('aria-label', this.t('info.close'));
  }

  private t(messageId: string): string {
    return this.i18n.translate(this.locale, messageId);
  }
}
