import { afterAll, afterEach, beforeAll, describe, expect, test } from 'bun:test';

import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createSearchAPI } from 'fumadocs-core/search/server';

import { FullSearchTrigger } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';

/** the index the site prerenders at /api/search, over two pages */
const searchIndex = createSearchAPI('simple', {
  indexes: [
    {
      content: 'A pack holds the blocks of a project.',
      title: 'Write a pack',
      url: '/docs/guides/write-a-pack',
    },
    {
      content: 'Choose the blocks a repository follows.',
      title: 'Choose blocks',
      url: '/docs/guides/choose-blocks',
    },
  ],
});

const refusingFetch = globalThis.fetch;

/** serves the prerendered index at its address and nothing else */
const servePrerenderedIndex = async (input: RequestInfo | URL): Promise<Response> =>
  input === '/api/search'
    ? searchIndex.staticGET()
    : new Response(undefined, {
        status: 404,
      });

beforeAll(() => {
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: servePrerenderedIndex,
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: refusingFetch,
    writable: true,
  });
});

afterEach(cleanup);

/** the reader opens search from the sidebar's field */
const openSearch = async (): Promise<void> => {
  renderInDocs(<FullSearchTrigger />);
  await userEvent.click(screen.getByRole('button'));
  await screen.findByRole('dialog');
};

describe('DocsSearchWidget', () => {
  test('should list the pages that match when the reader types a query', async () => {
    // Arrange
    await openSearch();

    // Act
    await userEvent.type(
      screen.getByRole('combobox', {
        name: 'Search',
      }),
      'pack',
    );

    // Assert
    expect(
      (await screen.findAllByRole('option')).map((option) => option.textContent),
    ).toStrictEqual([
      'Write a pack',
    ]);
  });

  test('should close when the reader presses close', async () => {
    // Arrange
    await openSearch();

    // Act
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Close Search',
      }),
    );

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  test('should pass the WCAG 2.2 A and AA scan when it lists results', async () => {
    // Arrange
    await openSearch();
    await userEvent.type(
      screen.getByRole('combobox', {
        name: 'Search',
      }),
      'pack',
    );
    await screen.findAllByRole('option');

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
