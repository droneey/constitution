interface ElementSpec {
  readonly attributes?: Readonly<Record<string, string>>;
  readonly children?: readonly ElementSpec[];
  readonly isRow?: boolean;
  readonly tag: string;
  readonly text?: string;
}

/** where a list's block sits, read from its inline style */
interface BlockPlace {
  readonly opacity: string | undefined;
  readonly row: string | undefined;
}

const ROW_HEIGHT = 40;

const rowSpec = (
  tag: string,
  text: string,
  attributes: Readonly<Record<string, string>>,
): ElementSpec => ({
  tag,
  attributes,
  text,
  isRow: true,
});

const versionsMarkup = (): ElementSpec => ({
  tag: 'nav',
  attributes: {
    'aria-label': 'Versions',
  },
  children: [
    {
      tag: 'ul',
      children: [
        {
          tag: 'li',
          children: [
            rowSpec('a', 'v0.70.0', {
              href: '/docs',
              'aria-current': 'page',
            }),
          ],
        },
        {
          tag: 'li',
          children: [
            rowSpec('a', 'v0.69.2', {
              href: '/v0.69.2/docs',
            }),
          ],
        },
      ],
    },
  ],
});

const tocMarkup = (): ElementSpec => ({
  tag: 'div',
  attributes: {
    'data-toc-list': '',
  },
  children: [
    rowSpec('a', 'Placement', {
      href: '#placement',
    }),
    rowSpec('a', 'Layers', {
      href: '#layers',
    }),
  ],
});

const searchMarkup = (selected: string): ElementSpec => ({
  tag: 'div',
  attributes: {
    id: 'fd-search-list',
    role: 'listbox',
  },
  children: [
    'Placement',
    'Layers',
  ].map((title) =>
    rowSpec('div', title, {
      role: 'option',
      'aria-selected': String(title === selected),
    }),
  ),
});

/** the simulated page ignores `[attribute]` before a `:not()`, so a row not highlighted carries `'false'`, which the hook reads as unmarked */
const markHighlighted = (isHighlighted: boolean): Readonly<Record<string, string>> => ({
  'data-highlighted': isHighlighted ? '' : 'false',
});

/** the theme menu: an item, then the modes as a group of radio items */
const themeMenuMarkup = (highlighted: string): ElementSpec => ({
  tag: 'div',
  attributes: {
    role: 'menu',
  },
  children: [
    rowSpec('div', 'System', {
      role: 'menuitem',
      ...markHighlighted(highlighted === 'System'),
    }),
    {
      tag: 'div',
      attributes: {
        role: 'group',
      },
      children: [
        rowSpec('div', 'Light', {
          role: 'menuitemradio',
          'aria-checked': 'false',
          ...markHighlighted(highlighted === 'Light'),
        }),
        rowSpec('div', 'Dark', {
          role: 'menuitemradio',
          'aria-checked': 'true',
          ...markHighlighted(highlighted === 'Dark'),
        }),
      ],
    },
  ],
});

/** the simulated page lays nothing out, so each row is placed by hand, a row's height below the one before */
const mountList = (spec: ElementSpec): HTMLElement => {
  const rows: HTMLElement[] = [];
  const build = ({
    tag,
    attributes = {},
    text,
    children = [],
    isRow,
  }: ElementSpec): HTMLElement => {
    const element = document.createElement(tag);

    for (const [name, attribute] of Object.entries(attributes)) {
      element.setAttribute(name, attribute);
    }
    element.textContent = text ?? '';
    element.append(...children.map(build));
    if (isRow === true) {
      rows.push(element);
    }

    return element;
  };
  const list = build(spec);

  for (const [index, row] of rows.entries()) {
    Object.defineProperty(row, 'offsetTop', {
      configurable: true,
      value: (index + 1) * ROW_HEIGHT,
    });
  }
  document.body.append(list);

  return list;
};

const pointAt = (row: Element): void => {
  row.dispatchEvent(
    new PointerEvent('pointerover', {
      bubbles: true,
      pointerType: 'mouse',
    }),
  );
};

const placeOf = (list: HTMLElement): BlockPlace => {
  // biome-ignore lint/plugin/queries-by-role-label-text: the block is a decoration hidden from assistive technology, which CSS finds by its attribute
  const found = list.querySelector(':scope > [data-glide]');
  const block = found instanceof HTMLElement ? found : undefined;
  const top = Number.parseFloat(block?.style.translate.split(' ')[1] ?? '');
  const row = [
    ...list.getElementsByTagName('*'),
  ].find((element) => element instanceof HTMLElement && element.offsetTop === top);

  return {
    opacity: block?.style.opacity,
    row: row?.textContent ?? undefined,
  };
};

export { mountList, placeOf, pointAt, searchMarkup, themeMenuMarkup, tocMarkup, versionsMarkup };
