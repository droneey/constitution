'use client';
import { useEffect } from 'react';

import { GLIDE_LISTS } from './glide.constants';
import type { GlideList } from './glide.types';

/** a muted block under the list's rows slides to the one under the pointer or the keyboard, as the sidebar's does */
function glide(area: HTMLElement, { rows, marked, filled }: GlideList): void {
  const block = document.createElement('div');
  block.dataset.glide = '';
  block.setAttribute('aria-hidden', 'true');
  if (getComputedStyle(area).position === 'static') {
    area.style.position = 'relative';
  }
  area.style.isolation = 'isolate';
  area.append(block);

  let current: HTMLElement | undefined;

  /** by offsets, which a popup's opening scale leaves alone */
  const place = (row: HTMLElement): void => {
    let x = 0;
    let y = 0;
    let node: Element | undefined = row;
    while (node instanceof HTMLElement && node !== area) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent ?? undefined;
    }
    block.style.translate = `${x}px ${y}px`;
    block.style.width = `calc(${row.offsetWidth}px - 2 * var(--glide-inset))`;
    block.style.height = `calc(${row.offsetHeight}px - 2 * var(--glide-inset))`;
    // Stryker disable next-line ConditionalExpression: without a fill the row would be asked to match "undefined", a tag no row has
    block.style.opacity = filled !== undefined && row.matches(filled) ? '0' : '1';
  };

  const show = (row: HTMLElement | undefined): void => {
    if (row === current) {
      if (row !== undefined) {
        place(row);
      }
      return;
    }
    block.style.transitionProperty = current === undefined ? 'opacity' : '';
    current = row;
    if (row === undefined) {
      block.style.opacity = '0';
    } else {
      place(row);
    }
  };

  const rowOf = (target: Element): HTMLElement | undefined =>
    target.closest<HTMLElement>(rows) ?? undefined;

  if (marked !== undefined) {
    const selector = `:is(${rows})[${marked}]:not([${marked}='false'])`;
    const sync = (): void => show(area.querySelector<HTMLElement>(selector) ?? undefined);
    new MutationObserver(sync).observe(area, {
      attributes: true,
      attributeFilter: [
        marked,
      ],
      childList: true,
      subtree: true,
    });
    sync();
    return;
  }

  area.addEventListener('pointerover', ({ target, pointerType }) => {
    const row = target instanceof Element ? rowOf(target) : undefined;
    // Stryker disable next-line ConditionalExpression: a list contains no undefined row, so the first test only narrows the type
    if (row !== undefined && area.contains(row) && pointerType === 'mouse') {
      show(row);
    }
  });
  area.addEventListener('pointerleave', () => show(undefined));
  area.addEventListener('focusin', ({ target }) => {
    if (target instanceof Element && target.matches(':focus-visible')) {
      show(rowOf(target));
    }
  });
  area.addEventListener('focusout', () => {
    if (!area.matches(':hover')) {
      show(undefined);
    }
  });
}

/** gives each list under the root, the root among them, its block once, though the page that uses it mounts again */
function scan(root: Element): void {
  for (const [selector, list] of Object.entries(GLIDE_LISTS)) {
    const areas = root.matches(selector)
      ? [
          root,
          ...root.querySelectorAll(selector),
        ]
      : root.querySelectorAll(selector);
    for (const area of areas) {
      if (area instanceof HTMLElement && area.querySelector(':scope > [data-glide]') === null) {
        glide(area, list);
      }
    }
  }
}

/** gives every list on the page, and each one that opens later, its sliding block; called by the page whose lists it serves, once they are hydrated, since React hydrates no element it did not render */
export function useGlide(): void {
  // Stryker disable ArrayDeclaration: the effect reads nothing that changes, so any dependencies that never change run it once
  useEffect((): (() => void) => {
    scan(document.body);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          // Stryker disable next-line StringLiteral: a block matches no list, so scanning one gives nothing; the test only spares the work
          if (node instanceof Element && !node.hasAttribute('data-glide')) {
            scan(node);
          }
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return (): void => observer.disconnect();
  }, []);
  // Stryker restore ArrayDeclaration
}
