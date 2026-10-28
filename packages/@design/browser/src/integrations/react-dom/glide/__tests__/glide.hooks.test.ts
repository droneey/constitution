import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, renderHook, screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import userEvent from '@testing-library/user-event';

import { applyStylesheet, removeStylesheets } from '../../__tests__/styles.fixtures';
import { GLIDE_TEST_ID } from '../glide.constants';
import { useGlide } from '../glide.hooks';
import {
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
} from './glide.fixtures';

afterEach(() => {
  cleanup();
  removeStylesheets();
  document.body.replaceChildren();
});

const mountVersions = (style = ''): HTMLElement => {
  const nav = mountElement(versionsSpec(style));
  const links = within(nav);

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

const mountTocBeforeSearch = (): HTMLElement => {
  const toc = mountElement(tocSpec());

  mountElement({
    tag: 'button',
    text: 'Search',
  });

  return toc;
};

const placementUnderV2 = {
  translate: '4px 36px',
  width: 'calc(100px - 2 * var(--glide-inset))',
  height: 'calc(32px - 2 * var(--glide-inset))',
};

const blockStyleUnderV2 = createBlockStyle({
  ...placementUnderV2,
  isVisible: true,
  isEntering: true,
});

describe('useGlide', () => {
  it('should give every list on the page one block, hidden from assistive technology', () => {
    // Arrange
    const versions = mountVersions();
    const toc = mountElement(tocSpec());

    // Act
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Assert
    expect([
      blockCountOf(versions),
      blockCountOf(toc),
      blockOf(versions).getAttribute('aria-hidden'),
    ]).toStrictEqual([
      1,
      1,
      'true',
    ]);
  });

  it.each([
    {
      condition: 'its own styles leave it in the flow',
      style: '',
      position: 'relative',
    },
    {
      condition: 'its own styles position it',
      style: 'position: absolute',
      position: 'absolute',
    },
  ])(
    'should hold the block inside its list, in a stacking context of its own, when $condition',
    async ({ style, position }) => {
      // Arrange
      await applyStylesheet(new URL('../glide.css', import.meta.url));

      const versions = mountVersions(style);

      // Act
      renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

      // Assert
      expect({
        isolation: getComputedStyle(versions).isolation,
        position: getComputedStyle(versions).position,
      }).toStrictEqual({
        isolation: 'isolate',
        position,
      });
    },
  );

  it('should fade the block in where it enters, and slide it from row to row after', async () => {
    // Arrange
    await applyStylesheet(new URL('../glide.css', import.meta.url));

    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    await user.hover(
      screen.getByRole('link', {
        name: 'v2',
      }),
    );

    // Assert
    expect(getComputedStyle(within(versions).getByTestId(GLIDE_TEST_ID)).transitionProperty).toBe(
      'opacity',
    );

    // Act
    await user.hover(
      screen.getByRole('link', {
        name: 'v3',
      }),
    );

    // Assert
    expect(getComputedStyle(within(versions).getByTestId(GLIDE_TEST_ID)).transitionProperty).toBe(
      'translate, width, height, opacity, scale',
    );
  });

  it.each([
    {
      condition: 'a row',
      linkName: 'v2',
      opacity: '1',
    },
    {
      condition: 'a row that shows a fill of its own',
      linkName: 'v1',
      opacity: '0',
    },
  ])(
    'should draw the block at the opacity its stylesheet gives it when the mouse is over $condition',
    async ({ linkName, opacity }) => {
      // Arrange
      await applyStylesheet(new URL('../glide.css', import.meta.url));

      const versions = mountVersions();
      const user = userEvent.setup();

      renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

      // Act
      await user.hover(
        screen.getByRole('link', {
          name: linkName,
        }),
      );

      // Assert
      expect(getComputedStyle(within(versions).getByTestId(GLIDE_TEST_ID)).opacity).toBe(opacity);
    },
  );

  it('should slide the block under the row the mouse is over', async () => {
    // Arrange
    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    await user.hover(
      screen.getByRole('link', {
        name: 'v2',
      }),
    );

    // Assert
    expect(placementOf(blockOf(versions))).toStrictEqual(placementUnderV2);
  });

  it('should add up the offsets of every element between the row and the list', async () => {
    // Arrange
    const toc = mountElement({
      tag: 'div',
      attributes: {
        'data-toc-list': '',
      },
    });
    const entry = mountElement(
      {
        tag: 'span',
      },
      toc,
    );
    const link = mountElement(linkSpec('Layers'), entry);
    const user = userEvent.setup();

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
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    await user.hover(link);

    // Assert
    expect(placementOf(blockOf(toc)).translate).toBe('10px 103px');
  });

  it.each([
    {
      name: 'a touch moves over a row',
      act: (user: UserEvent): Promise<void> =>
        user.pointer([
          {
            keys: '[TouchA>]',
            target: screen.getByText('Versions of the Constitution'),
          },
          {
            pointerName: 'TouchA',
            target: screen.getByRole('link', {
              name: 'v2',
            }),
          },
        ]),
    },
    {
      name: 'the pointer is over no row',
      act: (user: UserEvent): Promise<void> =>
        user.hover(screen.getByText('Versions of the Constitution')),
    },
  ])('should leave the block where it is when $name', async ({ act }) => {
    // Arrange
    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    await act(user);

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should leave the block where it is when the pointer event targets the text of a row', () => {
    // Arrange
    const versions = mountVersions();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    pointOverTextOf(
      screen.getByRole('link', {
        name: 'v2',
      }),
    );

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should ignore a row outside the list that holds it', async () => {
    // Arrange
    const outer = mountElement({
      tag: 'a',
      attributes: {
        href: '#outer',
      },
    });
    const versions = mountElement(versionsSpec(), outer);
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    await user.hover(within(versions).getByText('Versions of the Constitution'));

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should fade in on the first row, slide between rows, fade out when the pointer leaves, and fade in again', async () => {
    // Arrange
    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    const second = screen.getByRole('link', {
      name: 'v2',
    });

    // Act
    await user.hover(second);

    // Assert
    expect(phaseOf(blockOf(versions))).toStrictEqual({
      isEntering: true,
      isVisible: true,
    });

    // Act
    await user.hover(
      screen.getByRole('link', {
        name: 'v3',
      }),
    );

    // Assert
    expect(phaseOf(blockOf(versions))).toStrictEqual({
      isEntering: false,
      isVisible: true,
    });

    // Act
    await user.unhover(versions);

    // Assert
    expect(phaseOf(blockOf(versions))).toStrictEqual({
      isEntering: false,
      isVisible: false,
    });

    // Act
    await user.hover(second);

    // Assert
    expect(phaseOf(blockOf(versions))).toStrictEqual({
      isEntering: true,
      isVisible: true,
    });
  });

  it('should place the block again when the pointer comes back over the same row', async () => {
    // Arrange
    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    const second = screen.getByRole('link', {
      name: 'v2',
    });

    await user.hover(second);
    layOut(second, {
      left: 6,
      top: 40,
      width: 100,
      height: 32,
      offsetParent: versions,
    });
    await user.hover(screen.getByText('Versions of the Constitution'));

    // Act
    await user.hover(second);

    // Assert
    expect(placementOf(blockOf(versions)).translate).toBe('6px 40px');
  });

  it('should leave a hidden block alone when the pointer leaves the list from no row', async () => {
    // Arrange
    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    await user.hover(screen.getByText('Versions of the Constitution'));

    // Act
    await user.unhover(versions);

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should slide the block under the row the keyboard focuses', async () => {
    // Arrange
    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    await user.tab();

    // Act
    await user.tab();

    // Assert
    expect(placementOf(blockOf(versions))).toStrictEqual(placementUnderV2);
  });

  it('should hide the block when the keyboard focuses an element of the list that is no row', async () => {
    // Arrange
    const versions = mountVersions();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    await user.tab();
    await user.tab();
    await user.tab();

    // Act
    await user.tab();

    // Assert
    expect(styleOf(blockOf(versions)).isVisible).toBe(false);
  });

  it('should leave the block when focus arrives without being shown', () => {
    // Arrange
    const versions = mountVersions();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    focusUnshown(
      screen.getByRole('link', {
        name: 'v2',
      }),
    );

    // Assert
    expect(styleOf(blockOf(versions))).toStrictEqual(createBlockStyle());
  });

  it('should hide the block when focus leaves the list and the pointer is not over it', async () => {
    // Arrange
    const toc = mountTocBeforeSearch();
    const user = userEvent.setup();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    await user.tab();

    // Act
    await user.tab();

    // Assert
    expect(styleOf(blockOf(toc)).isVisible).toBe(false);
  });

  it('should keep the block when focus leaves the list while the pointer is over it', async () => {
    // Arrange
    const toc = mountTocBeforeSearch();
    const user = userEvent.setup();

    holdPointerOver(toc);
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    await user.tab();

    // Act
    await user.tab();

    // Assert
    expect(styleOf(blockOf(toc)).isVisible).toBe(true);
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
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Assert
    expect(placementOf(blockOf(results))).toStrictEqual({
      translate: '0px 40px',
      width: 'calc(300px - 2 * var(--glide-inset))',
      height: 'calc(40px - 2 * var(--glide-inset))',
    });
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
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    screen
      .getByRole('option', {
        name: 'Layers',
      })
      .setAttribute('aria-selected', 'false');

    // Act
    first.setAttribute('aria-selected', 'true');

    // Assert
    await waitFor(() =>
      expect(placementOf(blockOf(results))).toStrictEqual({
        translate: '0px 0px',
        width: 'calc(300px - 2 * var(--glide-inset))',
        height: 'calc(40px - 2 * var(--glide-inset))',
      }),
    );

    // Act
    first.setAttribute('aria-selected', 'false');

    // Assert
    await waitFor(() => expect(styleOf(blockOf(results)).isVisible).toBe(false));
  });

  it('should hide the block when the marked row leaves the list', async () => {
    // Arrange
    const results = mountElement(searchSpec());

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Act
    screen
      .getByRole('option', {
        name: 'Layers',
      })
      .remove();

    // Assert
    await waitFor(() => expect(styleOf(blockOf(results)).isVisible).toBe(false));
  });

  it('should fade the block of a group of radios out over the checked radio it highlights', () => {
    // Arrange
    mountElement(menuSpec('Dark'));

    // Act
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Assert
    expect(
      styleOf(
        blockOf(
          screen.getByRole('group', {
            name: 'Modes',
          }),
        ),
      ).isVisible,
    ).toBe(false);
  });

  it.each([
    {
      condition: 'alone',
      mount: (): HTMLElement => mountVersions(),
    },
    {
      condition: 'inside another element',
      mount: (): HTMLElement =>
        within(
          mountElement({
            tag: 'aside',
            children: [
              tocSpec(),
            ],
          }),
        ).getByRole('list', {
          name: 'On this page',
        }),
    },
    {
      condition: 'deep in the page',
      mount: (): HTMLElement =>
        mountElement(
          searchSpec(),
          mountElement(
            {
              tag: 'section',
            },
            screen.getByRole('main'),
          ),
        ),
    },
  ])(
    'should give a list that opens later its block when it opens $condition',
    async ({ mount }) => {
      // Arrange
      mountElement({
        tag: 'main',
      });
      renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

      // Act
      const list = mount();

      // Assert
      await waitFor(() => expect(blockCountOf(list)).toBe(1));
    },
  );

  it('should pass over text that opens beside a list', async () => {
    // Arrange
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    const toc = buildElement(tocSpec());

    // Act
    document.body.append('Loose text', toc);

    // Assert
    await waitFor(() => expect(blockCountOf(toc)).toBe(1));
  });

  it('should give a list one block when it is put on the page again', async () => {
    // Arrange
    const versions = mountVersions();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    const mutated = nextMutation();

    // Act
    document.body.append(versions);

    // Assert
    await mutated;
    expect(blockCountOf(versions)).toBe(1);
  });

  it('should give a list one block when the page that uses it mounts again', () => {
    // Arrange
    const versions = mountVersions();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE)).unmount();

    // Act
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Assert
    expect(blockCountOf(versions)).toBe(1);
  });

  it('should give no block to a list drawn as a picture', () => {
    // Arrange
    const figure = mountElement({
      tag: 'figure',
    });
    const picture = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    picture.setAttribute('role', 'menu');

    figure.append(picture);

    // Act
    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    // Assert
    expect(within(figure).queryAllByTestId(GLIDE_TEST_ID)).toStrictEqual([]);
  });

  it("should give a block no block of its own when a list's selector matches it too", async () => {
    // Arrange
    renderHook(() =>
      useGlide({
        div: {
          rowSelector: 'a',
        },
      }),
    );

    const mutated = nextMutation();

    // Act
    const list = mountElement({
      tag: 'div',
    });

    // Assert
    await mutated;
    expect(blockCountOf(blockOf(list))).toBe(0);
  });

  it.each([
    {
      act: (user: UserEvent): Promise<void> =>
        user.hover(
          screen.getByRole('link', {
            name: 'v3',
          }),
        ),
      event: 'the pointer moves over a row',
    },
    {
      act: (user: UserEvent): Promise<void> => user.unhover(screen.getByRole('navigation')),
      event: 'the pointer leaves',
    },
    {
      act: (user: UserEvent): Promise<void> => user.tab(),
      event: 'the keyboard focuses a row',
    },
    {
      act: async (user: UserEvent): Promise<void> => {
        await user.tab();
        await user.click(document.body);
      },
      event: 'focus leaves',
    },
  ])(
    'should take the block off a list, and leave it as it was when $event, once the page that used it is gone',
    async ({ act }) => {
      // Arrange
      const versions = mountVersions();
      const user = userEvent.setup();
      const { unmount } = renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

      await user.hover(
        screen.getByRole('link', {
          name: 'v2',
        }),
      );

      const block = blockOf(versions);

      unmount();

      // Act
      await act(user);

      // Assert
      expect({
        blocks: blockCountOf(versions),
        style: styleOf(block),
      }).toStrictEqual({
        blocks: 0,
        style: blockStyleUnderV2,
      });
    },
  );

  it('should stop following the mark once the page that used it is gone', async () => {
    // Arrange
    const results = mountElement(searchSpec());
    const { unmount } = renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    const block = blockOf(results);

    unmount();

    const mutated = nextMutation();

    // Act
    screen
      .getByRole('option', {
        name: 'Layers',
      })
      .remove();

    // Assert
    await mutated;
    expect({
      blocks: blockCountOf(results),
      isVisible: styleOf(block).isVisible,
    }).toStrictEqual({
      blocks: 0,
      isVisible: true,
    });
  });

  it('should take the block off a list that opened later once the page that used it is gone', async () => {
    // Arrange
    const { unmount } = renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));
    const mutated = nextMutation();
    const toc = mountElement(tocSpec());

    await mutated;

    // Act
    unmount();

    // Assert
    expect(blockCountOf(toc)).toBe(0);
  });

  it('should take the block off a list that leaves the page', async () => {
    // Arrange
    const versions = mountVersions();

    renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    const mutated = nextMutation();

    // Act
    versions.remove();

    // Assert
    await mutated;
    expect(blockCountOf(versions)).toBe(0);
  });

  it('should stop giving blocks once the page that used it is gone', async () => {
    // Arrange
    const { unmount } = renderHook(() => useGlide(GLIDE_LISTS_FIXTURE));

    unmount();

    const mutated = nextMutation();

    // Act
    const versions = mountVersions();

    // Assert
    await mutated;
    expect(blockCountOf(versions)).toBe(0);
  });
});
