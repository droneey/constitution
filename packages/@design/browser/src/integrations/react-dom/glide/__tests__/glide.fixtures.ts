import { within } from '@testing-library/react';

import { GLIDE_TEST_ID } from '../glide.constants';
import type { GlideLists } from '../glide.types';

const GLIDE_LISTS_FIXTURE = {
  "nav[aria-label='Versions']": {
    rowSelector: 'a',
    filledRowSelector: "[aria-current='page']",
  },
  '[data-toc-list]': {
    rowSelector: 'a',
  },
  '#search-list': {
    rowSelector: "[role='option']",
    markAttribute: 'aria-selected',
  },
  "[role='menu']": {
    rowSelector: ":is([role='menuitem'], [role='menuitemradio']):not([role='group'] *)",
    markAttribute: 'data-highlighted',
  },
  "[role='group']:has(> [role='menuitemradio'])": {
    rowSelector: "[role='menuitemradio']",
    markAttribute: 'data-highlighted',
    filledRowSelector: "[aria-checked='true']",
  },
} as const satisfies GlideLists;

interface ElementSpec {
  readonly attributes?: Readonly<Record<string, string>>;
  readonly children?: readonly ElementSpec[];
  readonly tag: string;
  readonly text?: string;
}

/** the simulated page never computes it */
interface ElementLayout {
  readonly height?: number;
  readonly left: number;
  readonly offsetParent?: Element;
  readonly top: number;
  readonly width?: number;
}

interface BlockPlacement {
  readonly height: string;
  readonly translate: string;
  readonly width: string;
}

interface BlockPhase {
  readonly isEntering: boolean;
  readonly isVisible: boolean;
}

type BlockStyle = BlockPlacement & BlockPhase;

const buildElement = ({ tag, attributes = {}, text, children = [] }: ElementSpec): HTMLElement => {
  const element = document.createElement(tag);

  for (const [attributeName, attributeValue] of Object.entries(attributes)) {
    element.setAttribute(attributeName, attributeValue);
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  element.append(...children.map(buildElement));

  return element;
};

const mountElement = (spec: ElementSpec, parent: Element = document.body): HTMLElement => {
  const element = buildElement(spec);

  parent.append(element);

  return element;
};

const linkSpec = (
  text: string,
  attributes: Readonly<Record<string, string>> = {},
): ElementSpec => ({
  tag: 'a',
  attributes: {
    href: `#${text}`,
    ...attributes,
  },
  text,
});

const versionsSpec = (style = ''): ElementSpec => ({
  tag: 'nav',
  attributes: {
    'aria-label': 'Versions',
    style,
  },
  children: [
    linkSpec('v1', {
      'aria-current': 'page',
    }),
    linkSpec('v2'),
    linkSpec('v3'),
    {
      tag: 'button',
      text: 'More versions',
    },
    {
      tag: 'span',
      text: 'Versions of the Constitution',
    },
  ],
});

const searchSpec = (): ElementSpec => ({
  tag: 'div',
  attributes: {
    id: 'search-list',
    role: 'listbox',
    'aria-label': 'Results',
  },
  children: [
    {
      tag: 'div',
      attributes: {
        role: 'option',
        'aria-selected': 'false',
      },
      text: 'Placement',
    },
    {
      tag: 'div',
      attributes: {
        role: 'option',
        'aria-selected': 'true',
      },
      text: 'Layers',
    },
  ],
});

const menuSpec = (highlighted: string): ElementSpec => ({
  tag: 'div',
  attributes: {
    role: 'menu',
    'aria-label': 'Theme',
  },
  children: [
    {
      tag: 'div',
      attributes: {
        role: 'menuitem',
        'data-highlighted': highlighted === 'System' ? '' : 'false',
      },
      text: 'System',
    },
    {
      tag: 'div',
      attributes: {
        role: 'group',
        'aria-label': 'Modes',
      },
      children: [
        {
          tag: 'div',
          attributes: {
            role: 'menuitemradio',
            'aria-checked': 'false',
            'data-highlighted': 'false',
          },
          text: 'Light',
        },
        {
          tag: 'div',
          attributes: {
            role: 'menuitemradio',
            'aria-checked': 'true',
            'data-highlighted': highlighted === 'Dark' ? '' : 'false',
          },
          text: 'Dark',
        },
      ],
    },
  ],
});

const tocSpec = (): ElementSpec => ({
  tag: 'div',
  attributes: {
    'data-toc-list': '',
    role: 'list',
    'aria-label': 'On this page',
  },
  children: [
    linkSpec('Layers'),
  ],
});

const layOut = (
  element: Element,
  { left, top, width = 0, height = 0, offsetParent }: ElementLayout,
): void => {
  Object.defineProperties(element, {
    offsetLeft: {
      configurable: true,
      value: left,
    },
    offsetTop: {
      configurable: true,
      value: top,
    },
    offsetWidth: {
      configurable: true,
      value: width,
    },
    offsetHeight: {
      configurable: true,
      value: height,
    },
    ...(offsetParent === undefined
      ? {}
      : {
          offsetParent: {
            configurable: true,
            value: offsetParent,
          },
        }),
  });
};

const ownBlocksIn = (list: HTMLElement): HTMLElement[] =>
  within(list)
    .queryAllByTestId(GLIDE_TEST_ID)
    .filter((block) => block.parentElement === list);

/** the list's own block; like a `getBy` query, it fails when the list holds none */
const blockOf = (list: HTMLElement): HTMLElement => {
  const [block] = ownBlocksIn(list);

  if (block === undefined) {
    throw new Error('the list holds no block of its own');
  }

  return block;
};

const blockCountOf = (list: HTMLElement): number => ownBlocksIn(list).length;

const placementOf = (block: HTMLElement): BlockPlacement => ({
  translate: block.style.translate,
  width: block.style.width,
  height: block.style.height,
});

/** whether the block is entering, which fades it in, and whether it is drawn */
const phaseOf = (block: HTMLElement): BlockPhase => ({
  isVisible: block.hasAttribute('data-visible'),
  isEntering: block.hasAttribute('data-entering'),
});

const styleOf = (block: HTMLElement): BlockStyle => ({
  ...placementOf(block),
  ...phaseOf(block),
});

const createBlockStyle = (overrides: Partial<BlockStyle> = {}): BlockStyle => ({
  translate: '',
  width: '',
  height: '',
  isVisible: false,
  isEntering: false,
  ...overrides,
});

/** a pointer over a row's text, which userEvent never sends: it always targets an element */
const pointOverTextOf = (row: HTMLElement): void => {
  const [text] = row.childNodes;

  if (text === undefined) {
    throw new Error('the row holds no text');
  }

  text.dispatchEvent(
    new PointerEvent('pointerover', {
      bubbles: true,
      pointerType: 'mouse',
    }),
  );
};

/** a focus that arrives unshown, as a click's does, which userEvent never gives: the simulated page shows every focus as the keyboard's */
const focusUnshown = (element: HTMLElement): void => {
  element.dispatchEvent(
    new FocusEvent('focusin', {
      bubbles: true,
    }),
  );
};

/** the element answers `:hover` as one under the pointer does, which the simulated page never tracks */
const holdPointerOver = (element: HTMLElement): void => {
  const matches = element.matches.bind(element);

  Object.defineProperty(element, 'matches', {
    value: (selector: string): boolean => selector === ':hover' || matches(selector),
  });
};

/** settles once the page has changed and every watcher of the page, the hook's among them, has heard of it */
const nextMutation = (): Promise<void> =>
  new Promise((resolve) => {
    const watcher = new MutationObserver(() => {
      watcher.disconnect();
      resolve();
    });

    watcher.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

export {
  blockCountOf,
  blockOf,
  buildElement,
  createBlockStyle,
  focusUnshown,
  GLIDE_LISTS_FIXTURE,
  holdPointerOver,
  layOut,
  linkSpec,
  menuSpec,
  mountElement,
  nextMutation,
  phaseOf,
  placementOf,
  pointOverTextOf,
  searchSpec,
  styleOf,
  tocSpec,
  versionsSpec,
};
