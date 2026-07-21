// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContextMenu } from '../../src/ui/ContextMenu';

describe('ContextMenu', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.replaceChildren();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('starts hidden and opens with the given items at a position', () => {
    const menu = new ContextMenu(container);
    expect(menu.isOpen).toBe(false);

    menu.open(120, 60, [{ label: 'Center on Star', onSelect: () => {} }]);
    expect(menu.isOpen).toBe(true);
    const items = menu.element.querySelectorAll('.context-menu__item');
    expect(items).toHaveLength(1);
    expect(items[0]!.textContent).toBe('Center on Star');
    expect(menu.element.style.left).toBe('120px');
    expect(menu.element.style.top).toBe('60px');
  });

  it('invokes the handler and closes when an item is chosen', () => {
    const menu = new ContextMenu(container);
    const onSelect = vi.fn();
    menu.open(0, 0, [{ label: 'Center on planet #1', onSelect }]);

    (menu.element.querySelector('.context-menu__item') as HTMLButtonElement).click();
    expect(onSelect).toHaveBeenCalledOnce();
    expect(menu.isOpen).toBe(false);
  });

  it('closes on an outside pointer press', () => {
    const menu = new ContextMenu(container);
    menu.open(0, 0, [{ label: 'x', onSelect: () => {} }]);
    // jsdom lacks PointerEvent; a plain typed Event triggers the same listener.
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(menu.isOpen).toBe(false);
  });
});
