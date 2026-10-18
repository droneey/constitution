/** an element to build: its tag, attributes, text and children */
interface ElementSpec {
  readonly attributes?: Readonly<Record<string, string>>;
  readonly children?: readonly ElementSpec[];
  readonly tag: string;
  readonly text?: string;
}

/** where the layout put an element, which the simulated page never computes */
interface ElementLayout {
  readonly height?: number;
  readonly left: number;
  readonly offsetParent?: Element;
  readonly top: number;
  readonly width?: number;
}

/** the look the block took, read from its inline style */
interface BlockStyle {
  readonly height: string;
  readonly opacity: string;
  readonly transitionProperty: string;
  readonly translate: string;
  readonly width: string;
}

const buildElement = ({ tag, attributes = {}, text, children = [] }: ElementSpec): HTMLElement => {
  const element = document.createElement(tag);

  for (const [name, attribute] of Object.entries(attributes)) {
    element.setAttribute(name, attribute);
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

/** the versions' navigation: three links, the first the current page */
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

/** the search's results, the second marked as selected */
const searchSpec = (): ElementSpec => ({
  tag: 'div',
  attributes: {
    id: 'fd-search-list',
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

/** a menu of one item, System, and a group of two radios, Light and Dark, the second checked; the row named highlighted is marked */
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

/** gives an element the offsets and the size the layout would */
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

/** the block a list was given, the one element the hook adds, which CSS finds by its attribute */
const blockOf = (list: Element): HTMLElement | undefined =>
  list.querySelector<HTMLElement>(':scope > [data-glide]') ?? undefined;

const blocksOf = (list: Element): number => list.querySelectorAll(':scope > [data-glide]').length;

const styleOf = (block: HTMLElement | undefined): BlockStyle | undefined =>
  block === undefined
    ? undefined
    : {
        translate: block.style.translate,
        width: block.style.width,
        height: block.style.height,
        opacity: block.style.opacity,
        transitionProperty: block.style.transitionProperty,
      };

const createBlockStyle = (overrides: Partial<BlockStyle> = {}): BlockStyle => ({
  translate: '',
  width: '',
  height: '',
  opacity: '',
  transitionProperty: '',
  ...overrides,
});

const pointAt = (target: Node, pointerType = 'mouse'): void => {
  target.dispatchEvent(
    new PointerEvent('pointerover', {
      bubbles: true,
      pointerType,
    }),
  );
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
  blockOf,
  blocksOf,
  buildElement,
  createBlockStyle,
  layOut,
  linkSpec,
  menuSpec,
  mountElement,
  nextMutation,
  pointAt,
  searchSpec,
  styleOf,
  tocSpec,
  versionsSpec,
};
