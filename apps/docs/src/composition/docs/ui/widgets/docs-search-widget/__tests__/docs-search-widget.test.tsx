import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createFakePageSearch } from '#/__tests__/page-search.fake';
import type { SearchPages, SearchResult } from '#/features/content';
import { createSearchPages, SearchResultKind } from '#/features/content';
import { FullSearchTrigger } from '#/libs/ui';

import { componentViolationsIn } from '../../../../__tests__/axe.fixtures';
import { renderInDocs } from '../../../../__tests__/docs.fixtures';

const PARTS_TABLE = '| Part | Meaning |\n| --- | --- |';

const pageResult = (content: string, breadcrumbs: string[] = []): SearchResult => ({
  breadcrumbs,
  content,
  id: content,
  kind: SearchResultKind.Page,
  url: '/docs/guides/write-a-pack',
});

/** a row of the parts table, as the index holds it: the row under its table's header */
const partRow = (row: string): SearchResult => ({
  breadcrumbs: [],
  content: `${PARTS_TABLE}\n${row}`,
  id: row,
  kind: SearchResultKind.Text,
  table: 'parts',
  url: '/docs/guides/write-a-pack#parts',
});

const searchPagesOf = (results: readonly SearchResult[]): SearchPages =>
  createSearchPages(createFakePageSearch(results));

const guides = searchPagesOf([
  pageResult('Write a pack'),
  pageResult('Choose blocks'),
]);

afterEach(cleanup);

const openSearch = async (providers: { searchPages?: SearchPages | undefined }): Promise<void> => {
  await renderInDocs(<FullSearchTrigger />, providers);
  await userEvent.click(screen.getByRole('button'));
  await screen.findByRole('dialog');
};

const typeQuery = async (query: string): Promise<void> => {
  await userEvent.type(
    screen.getByRole('combobox', {
      name: 'Search',
    }),
    query,
  );
};

const optionTexts = (): (string | undefined)[] =>
  screen.queryAllByRole('option').map((option) => option.textContent ?? undefined);

describe('DocsSearchWidget', () => {
  it('should list the pages that match when the reader types a query', async () => {
    // Arrange
    await openSearch({
      searchPages: guides,
    });

    // Act
    await typeQuery('pack');

    // Assert
    await waitFor(() =>
      expect(optionTexts()).toStrictEqual([
        'Write a pack',
      ]),
    );
  });

  it('should show the breadcrumbs of a page that has some', async () => {
    // Arrange
    await openSearch({
      searchPages: searchPagesOf([
        pageResult('Write a pack', [
          'Guides',
          'Packs',
        ]),
      ]),
    });

    // Act
    await typeQuery('pack');

    // Assert
    await waitFor(() =>
      expect(optionTexts()).toStrictEqual([
        'GuidesPacksWrite a pack',
      ]),
    );
  });

  it('should gather the rows of one table under its header', async () => {
    // Arrange
    await openSearch({
      searchPages: searchPagesOf([
        partRow('| pack | the folder of blocks |'),
        partRow('| passport | the card of a block |'),
      ]),
    });

    // Act
    await typeQuery('pa');

    // Assert
    await waitFor(() =>
      expect(
        screen.getAllByRole('group').map((table) => within(table).getAllByRole('option').length),
      ).toStrictEqual([
        2,
      ]),
    );
  });

  it('should find nothing when the root provides no search', async () => {
    // Arrange
    await openSearch({
      searchPages: undefined,
    });

    // Act
    await typeQuery('pack');

    // Assert
    expect(await screen.findByText('No results found')).not.toBeNull();
  });

  it('should search with the new search when the root provides another', async () => {
    // Arrange
    const providers = {
      searchPages: searchPagesOf([]),
    };
    const rendered = await renderInDocs(<FullSearchTrigger />, providers);

    await userEvent.click(screen.getByRole('button'));
    await typeQuery('pack');
    await screen.findByText('No results found');
    providers.searchPages = guides;

    // Act
    rendered.rerender(<FullSearchTrigger />);

    // Assert
    await waitFor(() =>
      expect(optionTexts()).toStrictEqual([
        'Write a pack',
      ]),
    );
  });

  it('should close when the reader presses close', async () => {
    // Arrange
    await openSearch({
      searchPages: guides,
    });

    // Act
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Close Search',
      }),
    );

    // Assert
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it.each([
    {
      searchPages: guides,
      settled: (): Promise<unknown> => screen.findAllByRole('option'),
      state: 'it lists results',
    },
    {
      searchPages: searchPagesOf([
        partRow('| pack | the folder of blocks |'),
        partRow('| passport | the card of a block |'),
      ]),
      settled: (): Promise<unknown> => screen.findAllByRole('group'),
      state: 'it gathers the rows of a table',
    },
    {
      searchPages: searchPagesOf([]),
      settled: (): Promise<unknown> => screen.findByText('No results found'),
      state: 'it finds nothing',
    },
  ])('should pass the WCAG 2.2 A and AA scan when $state', async ({ searchPages, settled }) => {
    // Arrange
    await openSearch({
      searchPages,
    });
    await typeQuery('pa');
    await settled();

    // Act
    const violations = await componentViolationsIn();

    // Assert
    expect(violations).toStrictEqual([]);
  });
});
