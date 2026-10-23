import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, renderHook, screen, waitFor, within } from '@testing-library/react';

import { useGlide } from '../glide.hooks';
import {
  blockOf,
  blocksOf,
  buildElement,
  createBlockStyle,
  GLIDE_LISTS,
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
} from './glide.fixtures';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

const mountVersions = (style = ''): HTMLElement => {
  const nav = mountElement(versionsSpec(style));
  const links = within(nav);

  // The list's own offsets, from the page, count for nothing: the block sits inside the list.
  layOut(nav, {
    left: 500,
    top: 500,
  });

  layOut(
    links.getByRole('link', {
      name: 'v1',
    }),
    {
      left: 4,
      top: 4,
      width: 120,
      height: 32,
      offsetParent: nav,
    },
  );
  layOut(
    links.getByRole('link', {
      name: 'v2',
    }),
    {
      left: 4,
      top: 36,
      width: 100,
      height: 32,
      offsetParent: nav,
    },
  );
  layOut(
    links.getByRole('link', {
      name: 'v3',
    }),
    {
      left: 4,
      top: 68,
      width: 80,
      height: 32,
      offsetParent: nav,
    },
  );

  return nav;
};

const UNDER_V2 = createBlockStyle({
  translate: '4px 36px',
  width: 'calc(100px - 2 * var(--glide-inset))',
  height: 'calc(32px - 2 * var(--glide-inset))',
  opacity: '1',
  transitionProperty: 'opacity',
});

describe('useGlide', () => {
  it('should give every list on the page one hidden block, keeping a list that is already positioned', () => {
    // Arrange
    const versions = mountVersions('position: absolute');
    const toc = mountElement(tocSpec());

    // Act
    renderHook(() => useGlide(GLIDE_LISTS));

    // Assert
    expect([
      blocksOf(versions),
      blocksOf(toc),
      blockOf(versions)?.getAttribute('aria-hidden'),
      blockOf(versions)?.getAttribute('data-glide'),
      versions.style.position,
      versions.style.isolation,
      toc.style.position,
    ]).toStrictEqual([
      1,
      1,
      'true',
      '',
      'absolute',
      'isolate',
      '',
    ]);
  });

  it('should position a static list, so the block sits inside it', () => {
    // Arrange
    const versions = mountVersions('position: static');

    // Act
    renderHook(() => useGlide(GLIDE_LISTS));

    // Assert
    expect(versions.style.position).toBe('relative');
  });

  it('should slide the block under the row the mouse is over', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    pointAt(
      screen.getByRole('link', {
        name: 'v2',
      }),
    );

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(UNDER_V2);
  });

  it('should add up the offsets of every element between the row and the list', () => {
    // Arrange
    const toc = mountElement({
      tag: 'div',
      attributes: {
        'data-toc-list': '',
      },
      children: [
        {
          tag: 'span',
          children: [
            linkSpec('Layers'),
          ],
        },
      ],
    });
    const link = screen.getByRole('link', {
      name: 'Layers',
    });
    const entry = link.parentElement ?? toc;
    layOut(entry, {
      left: 8,
      top: 100,
      offsetParent: toc,
    });
    layOut(link, {
      left: 2,
      top: 3,
      width: 50,
      height: 20,
      offsetParent: entry,
    });
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    pointAt(link);

    // Assert
    expect(styleOf(blockOf(toc))).toStrictEqual(
      createBlockStyle({
        translate: '10px 103px',
        width: 'calc(50px - 2 * var(--glide-inset))',
        height: 'calc(20px - 2 * var(--glide-inset))',
        opacity: '1',
        transitionProperty: 'opacity',
      }),
    );
  });

  it('should fade the block out over a row that shows a fill of its own', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    pointAt(
      screen.getByRole('link', {
        name: 'v1',
      }),
    );

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(
      createBlockStyle({
        translate: '4px 4px',
        width: 'calc(120px - 2 * var(--glide-inset))',
        height: 'calc(32px - 2 * var(--glide-inset))',
        opacity: '0',
        transitionProperty: 'opacity',
      }),
    );
  });

  it.each([
    {
      name: 'the pointer is a touch',
      target: (): Node =>
        screen.getByRole('link', {
          name: 'v2',
        }),
      pointerType: 'touch',
    },
    {
      name: 'the pointer is over no row',
      target: (): Node => screen.getByText('Versions of the Constitution'),
      pointerType: 'mouse',
    },
    {
      name: 'the pointer is over the text of a row',
      target: (): Node =>
        screen.getByRole('link', {
          name: 'v2',
        }).firstChild ?? document,
      pointerType: 'mouse',
    },
  ])('should leave the block where it is when $name', ({ target, pointerType }) => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    pointAt(target(), pointerType);

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should ignore a row outside the list that holds it', () => {
    // Arrange
    const outer = mountElement({
      tag: 'a',
      attributes: {
        href: '#outer',
      },
    });
    const versions = mountElement(versionsSpec(), outer);
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    pointAt(within(versions).getByText('Versions of the Constitution'));

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should fade in on the first row, slide between rows, fade out when the pointer leaves, and fade in again', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));
    const second = screen.getByRole('link', {
      name: 'v2',
    });

    // Act
    pointAt(second);

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(UNDER_V2);

    // Act
    pointAt(
      screen.getByRole('link', {
        name: 'v3',
      }),
    );

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(
      createBlockStyle({
        translate: '4px 68px',
        width: 'calc(80px - 2 * var(--glide-inset))',
        height: 'calc(32px - 2 * var(--glide-inset))',
        opacity: '1',
      }),
    );

    // Act
    versions.dispatchEvent(new PointerEvent('pointerleave'));

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(
      createBlockStyle({
        translate: '4px 68px',
        width: 'calc(80px - 2 * var(--glide-inset))',
        height: 'calc(32px - 2 * var(--glide-inset))',
        opacity: '0',
      }),
    );

    // Act
    pointAt(second);

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(UNDER_V2);
  });

  it('should place the block again when the pointer comes back over the same row', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));
    const second = screen.getByRole('link', {
      name: 'v2',
    });
    pointAt(second);
    layOut(second, {
      left: 6,
      top: 40,
      width: 100,
      height: 32,
      offsetParent: versions,
    });

    // Act
    pointAt(second);

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(
      createBlockStyle({
        ...UNDER_V2,
        translate: '6px 40px',
      }),
    );
  });

  it('should leave a hidden block alone when the pointer leaves a list it never entered', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    versions.dispatchEvent(new PointerEvent('pointerleave'));

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should slide the block under the row the keyboard focuses', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    screen
      .getByRole('link', {
        name: 'v2',
      })
      .focus();

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(UNDER_V2);
  });

  it('should hide the block when the keyboard focuses an element of the list that is no row', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));
    screen
      .getByRole('link', {
        name: 'v2',
      })
      .focus();

    // Act
    screen
      .getByRole('button', {
        name: 'More versions',
      })
      .focus();

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual({
      ...UNDER_V2,
      opacity: '0',
      transitionProperty: '',
    });
  });

  it('should leave the block when focus arrives without being shown', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    screen
      .getByRole('link', {
        name: 'v2',
      })
      .dispatchEvent(
        new FocusEvent('focusin', {
          bubbles: true,
        }),
      );

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should hide the block when focus leaves the list and the pointer is not over it', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));
    const second = screen.getByRole('link', {
      name: 'v2',
    });
    second.focus();

    // Act
    second.blur();

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual({
      ...UNDER_V2,
      opacity: '0',
      transitionProperty: '',
    });
  });

  it('should keep the block when focus leaves the list while the pointer is over it', () => {
    // Arrange
    const versions = mountVersions();
    // The simulated page tracks no pointer, so the list answers :hover as a page under the pointer would.
    const matches = versions.matches.bind(versions);
    Object.defineProperty(versions, 'matches', {
      value: (selector: string): boolean => selector === ':hover' || matches(selector),
    });
    renderHook(() => useGlide(GLIDE_LISTS));
    const second = screen.getByRole('link', {
      name: 'v2',
    });
    second.focus();

    // Act
    second.blur();

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(UNDER_V2);
  });

  it('should place the block under the row a list marks when the list opens', () => {
    // Arrange
    const results = mountElement(searchSpec());
    layOut(
      screen.getByRole('option', {
        name: 'Layers',
      }),
      {
        left: 0,
        top: 40,
        width: 300,
        height: 40,
        offsetParent: results,
      },
    );

    // Act
    renderHook(() => useGlide(GLIDE_LISTS));

    // Assert
    expect(styleOf(blockOf(results))).toStrictEqual(
      createBlockStyle({
        translate: '0px 40px',
        width: 'calc(300px - 2 * var(--glide-inset))',
        height: 'calc(40px - 2 * var(--glide-inset))',
        opacity: '1',
        transitionProperty: 'opacity',
      }),
    );
  });

  it('should follow the mark from row to row, and hide the block when no row is marked', async () => {
    // Arrange
    const results = mountElement(searchSpec());
    const first = screen.getByRole('option', {
      name: 'Placement',
    });
    layOut(first, {
      left: 0,
      top: 0,
      width: 300,
      height: 40,
      offsetParent: results,
    });
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    screen
      .getByRole('option', {
        name: 'Layers',
      })
      .setAttribute('aria-selected', 'false');
    first.setAttribute('aria-selected', 'true');

    // Assert
    await waitFor(() =>
      expect(styleOf(blockOf(results))).toStrictEqual(
        createBlockStyle({
          translate: '0px 0px',
          width: 'calc(300px - 2 * var(--glide-inset))',
          height: 'calc(40px - 2 * var(--glide-inset))',
          opacity: '1',
        }),
      ),
    );

    // Act
    first.setAttribute('aria-selected', 'false');

    // Assert
    await waitFor(() =>
      expect(styleOf(blockOf(results))).toStrictEqual(
        createBlockStyle({
          translate: '0px 0px',
          width: 'calc(300px - 2 * var(--glide-inset))',
          height: 'calc(40px - 2 * var(--glide-inset))',
          opacity: '0',
        }),
      ),
    );
  });

  it('should hide the block when the marked row leaves the list', async () => {
    // Arrange
    const results = mountElement(searchSpec());
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    screen
      .getByRole('option', {
        name: 'Layers',
      })
      .remove();

    // Assert
    await waitFor(() => expect(styleOf(blockOf(results))?.opacity).toBe('0'));
  });

  it('should fade the block of a group of radios out over the checked radio it highlights', () => {
    // Arrange
    mountElement(menuSpec('Dark'));

    // Act
    renderHook(() => useGlide(GLIDE_LISTS));

    // Assert
    expect(
      styleOf(
        blockOf(
          screen.getByRole('group', {
            name: 'Modes',
          }),
        ),
      )?.opacity,
    ).toBe('0');
  });

  it('should show the block under the item a menu highlights', () => {
    // Arrange
    const menu = mountElement(menuSpec('System'));

    // Act
    renderHook(() => useGlide(GLIDE_LISTS));

    // Assert
    expect(styleOf(blockOf(menu))?.opacity).toBe('1');
  });

  it('should give a list that opens later its block, alone, inside another element or deep in the page', async () => {
    // Arrange
    const page = mountElement({
      tag: 'main',
      children: [
        {
          tag: 'section',
        },
      ],
    });
    renderHook(() => useGlide(GLIDE_LISTS));

    // Act
    const versions = mountVersions();
    const panel = mountElement({
      tag: 'aside',
      children: [
        tocSpec(),
      ],
    });
    const results = mountElement(searchSpec(), page.firstElementChild ?? page);

    // Assert
    await waitFor(() =>
      expect([
        blocksOf(versions),
        blocksOf(
          within(panel).getByRole('list', {
            name: 'On this page',
          }),
        ),
        blocksOf(panel),
        blocksOf(results),
      ]).toStrictEqual([
        1,
        1,
        0,
        1,
      ]),
    );
  });

  it('should pass over text that opens beside a list', async () => {
    // Arrange
    renderHook(() => useGlide(GLIDE_LISTS));
    const toc = buildElement(tocSpec());

    // Act
    document.body.append('Loose text', toc);

    // Assert
    await waitFor(() => expect(blocksOf(toc)).toBe(1));
  });

  it('should give a list one block when it is put on the page again', async () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS));
    const mutated = nextMutation();

    // Act
    document.body.append(versions);

    // Assert
    await mutated;
    expect(blocksOf(versions)).toBe(1);
  });

  it('should give a list one block when the page that uses it mounts again', () => {
    // Arrange
    const versions = mountVersions();
    renderHook(() => useGlide(GLIDE_LISTS)).unmount();

    // Act
    renderHook(() => useGlide(GLIDE_LISTS));

    // Assert
    expect(blocksOf(versions)).toBe(1);
  });

  it('should give no block to a list drawn as a picture', () => {
    // Arrange
    const picture = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    picture.setAttribute('role', 'menu');
    document.body.append(picture);

    // Act
    renderHook(() => useGlide(GLIDE_LISTS));

    // Assert
    // biome-ignore lint/plugin/queries-by-role-label-text: the glide is a decoration hidden from assistive technology, which CSS finds by its attribute
    expect(picture.querySelectorAll('[data-glide]').length).toBe(0);
  });

  it('should stop giving blocks once the page that used it is gone', async () => {
    // Arrange
    const { unmount } = renderHook(() => useGlide(GLIDE_LISTS));
    unmount();
    const mutated = nextMutation();

    // Act
    const versions = mountVersions();

    // Assert
    await mutated;
    expect(blocksOf(versions)).toBe(0);
  });
});
