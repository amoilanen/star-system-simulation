// Lightweight right-click context menu (FR-8: center the camera on a body).
//
// A tiny, reusable popup: the caller supplies already-localized items with
// select handlers and a viewport position. It closes on selection, on an
// outside click, or on Escape. Positioned absolutely inside the run overlay
// (which spans the viewport), so client coordinates map straight to it.

/** One selectable row in a {@link ContextMenu}. */
export interface ContextMenuItem {
  /** Already-localized label text. */
  label: string;
  /** Invoked when the row is chosen (menu closes first). */
  onSelect: () => void;
}

/** A minimal, dismissible context menu appended to a container element. */
export class ContextMenu {
  private readonly root: HTMLDivElement;
  private readonly onDocumentPointerDown: (e: PointerEvent) => void;
  private readonly onKeyDown: (e: KeyboardEvent) => void;

  constructor(container: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'context-menu';
    this.root.hidden = true;
    this.root.style.pointerEvents = 'auto';
    container.appendChild(this.root);

    this.onDocumentPointerDown = (e: PointerEvent): void => {
      if (!this.root.contains(e.target as Node)) {
        this.close();
      }
    };
    this.onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
  }

  /** The menu root (for testing). */
  get element(): HTMLDivElement {
    return this.root;
  }

  /** Whether the menu is currently open. */
  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** Open the menu at a viewport position with the given items. */
  open(clientX: number, clientY: number, items: readonly ContextMenuItem[]): void {
    this.root.replaceChildren();
    for (const item of items) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'context-menu__item';
      button.textContent = item.label;
      button.addEventListener('click', () => {
        this.close();
        item.onSelect();
      });
      this.root.appendChild(button);
    }
    this.root.style.left = `${clientX}px`;
    this.root.style.top = `${clientY}px`;
    this.root.hidden = false;

    document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    document.addEventListener('keydown', this.onKeyDown);
  }

  /** Close the menu (idempotent). */
  close(): void {
    if (this.root.hidden) {
      return;
    }
    this.root.hidden = true;
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
    document.removeEventListener('keydown', this.onKeyDown);
  }

  /** Remove the menu from the DOM and detach listeners. */
  destroy(): void {
    this.close();
    this.root.remove();
  }
}
