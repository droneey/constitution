import {
  ENTERING_ATTRIBUTE,
  GLIDE_ATTRIBUTE,
  GLIDE_TEST_ID,
  VISIBLE_ATTRIBUTE,
} from './glide.constants';
import type { GlideList, GlideLists } from './glide.types';

function followMark(
  area: HTMLElement,
  { markAttribute, rowSelector }: Required<Pick<GlideList, 'markAttribute' | 'rowSelector'>>,
  show: (row: HTMLElement | undefined) => void,
): () => void {
  const markedRowSelector = `:is(${rowSelector})[${markAttribute}]:not([${markAttribute}='false'])`;

  const showMarkedRow = (): void =>
    show(area.querySelector<HTMLElement>(markedRowSelector) ?? undefined);

  const watcher = new MutationObserver(showMarkedRow);
  watcher.observe(area, {
    attributes: true,
    attributeFilter: [
      markAttribute,
    ],
    childList: true,
    subtree: true,
  });

  showMarkedRow();

  return (): void => watcher.disconnect();
}

function followPointerAndFocus(
  area: HTMLElement,
  rowSelector: string,
  show: (row: HTMLElement | undefined) => void,
): () => void {
  const listening = new AbortController();
  const { signal } = listening;

  const rowOf = (target: Element): HTMLElement | undefined =>
    target.closest<HTMLElement>(rowSelector) ?? undefined;

  area.addEventListener(
    'pointerover',
    ({ target, pointerType }) => {
      if (!(target instanceof Element) || pointerType !== 'mouse') {
        return;
      }

      const row = target.closest<HTMLElement>(rowSelector);

      if (area.contains(row)) {
        show(row ?? undefined);
      }
    },
    {
      signal,
    },
  );
  area.addEventListener('pointerleave', () => show(undefined), {
    signal,
  });
  area.addEventListener(
    'focusin',
    ({ target }) => {
      if (target instanceof Element && target.matches(':focus-visible')) {
        show(rowOf(target));
      }
    },
    {
      signal,
    },
  );
  area.addEventListener(
    'focusout',
    () => {
      if (!area.matches(':hover')) {
        show(undefined);
      }
    },
    {
      signal,
    },
  );

  return (): void => listening.abort();
}

const isFilled = (row: HTMLElement, filledRowSelector: string | undefined): boolean => {
  switch (filledRowSelector) {
    // Stryker disable next-line ConditionalExpression: a row asked to match "undefined" matches no tag a list holds, so falling through to the match changes nothing
    case undefined:
      return false;
    default:
      return row.matches(filledRowSelector);
  }
};

function glide(
  area: HTMLElement,
  { rowSelector, markAttribute, filledRowSelector }: GlideList,
): () => void {
  const block = document.createElement('div');
  block.toggleAttribute(GLIDE_ATTRIBUTE, true);
  block.setAttribute('data-testid', GLIDE_TEST_ID);
  block.setAttribute('aria-hidden', 'true');

  area.append(block);

  let currentRow: HTMLElement | undefined;

  // Why: offsets, unlike a bounding box, ignore a popup's opening scale.
  const place = (row: HTMLElement): void => {
    let leftPx = 0;
    let topPx = 0;
    let offsetAncestor: Element | undefined = row;

    while (offsetAncestor instanceof HTMLElement && offsetAncestor !== area) {
      leftPx += offsetAncestor.offsetLeft;
      topPx += offsetAncestor.offsetTop;
      offsetAncestor = offsetAncestor.offsetParent ?? undefined;
    }

    block.style.translate = `${leftPx}px ${topPx}px`;
    block.style.width = `calc(${row.offsetWidth}px - 2 * var(--glide-inset))`;
    block.style.height = `calc(${row.offsetHeight}px - 2 * var(--glide-inset))`;
    block.toggleAttribute(VISIBLE_ATTRIBUTE, !isFilled(row, filledRowSelector));
  };

  const show = (row: HTMLElement | undefined): void => {
    if (row === currentRow) {
      if (row !== undefined) {
        place(row);
      }

      return;
    }

    block.toggleAttribute(ENTERING_ATTRIBUTE, currentRow === undefined);
    currentRow = row;

    if (row === undefined) {
      block.removeAttribute(VISIBLE_ATTRIBUTE);
    } else {
      place(row);
    }
  };

  const stop =
    markAttribute === undefined
      ? followPointerAndFocus(area, rowSelector, show)
      : followMark(
          area,
          {
            markAttribute,
            rowSelector,
          },
          show,
        );

  return (): void => {
    stop();
    block.remove();
  };
}

const holdsGlideBlock = (area: HTMLElement): boolean =>
  area.querySelector(`:scope > [${GLIDE_ATTRIBUTE}]`) !== null;

function scan(root: Element, lists: GlideLists, releases: Map<HTMLElement, () => void>): void {
  for (const [listSelector, list] of Object.entries(lists)) {
    const areas = root.matches(listSelector)
      ? [
          root,
          ...root.querySelectorAll(listSelector),
        ]
      : root.querySelectorAll(listSelector);

    for (const area of areas) {
      if (area instanceof HTMLElement && !holdsGlideBlock(area)) {
        releases.set(area, glide(area, list));
      }
    }
  }
}

function glideAll(lists: GlideLists): () => void {
  const releases = new Map<HTMLElement, () => void>();

  scan(document.body, lists, releases);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node instanceof Element && !node.hasAttribute(GLIDE_ATTRIBUTE)) {
          scan(node, lists, releases);
        }
      }
    }

    for (const [area, release] of releases) {
      if (!area.isConnected) {
        release();
        // Stryker disable next-line CallExpression: a release takes off what is already off when run again, so a list kept after it left the page only holds memory
        releases.delete(area);
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return (): void => {
    observer.disconnect();

    for (const release of releases.values()) {
      release();
    }
  };
}

export { glideAll };
