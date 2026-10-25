import { afterEach, describe, expect, it } from 'bun:test';

import type { ReactNode } from 'react';

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

import { createFakePageSearch } from '#/__tests__/page-search.fake';
import type { SearchState } from '#/libs/ui';

import { SearchResultKind } from '../../../../../domain/entities';
import { createSearchPages } from '../../../../../domain/use-cases';
import { SearchPagesContext } from '../../../../providers';
import { useSearchPages } from '../search-pages.hooks';

afterEach(cleanup);

const searchPages = createSearchPages(
  createFakePageSearch([
    {
      breadcrumbs: [
        'Guides',
      ],
      content: 'Write a pack',
      id: 'pack',
      kind: SearchResultKind.Page,
      url: '/docs/guides/write-a-pack',
    },
    {
      breadcrumbs: [],
      content: 'Pack layout',
      id: 'pack-1',
      kind: SearchResultKind.Heading,
      url: '/docs/guides/write-a-pack#layout',
    },
    {
      breadcrumbs: [],
      content: 'pack | the folder of blocks',
      id: 'pack-2',
      kind: SearchResultKind.Text,
      table: 'parts',
      url: '/docs/guides/write-a-pack#layout',
    },
  ]),
);

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <SearchPagesContext value={searchPages}>{children}</SearchPagesContext>
);

/** the hits as the search found them, without the content Fumadocs parses from them */
const hitsOf = (state: SearchState): readonly unknown[] | undefined =>
  state.data?.items.map((hit) => ({
    ...hit,
    hastContent: undefined,
  }));

describe('useSearchPages', () => {
  it('should hand the search the results that match what the reader types', async () => {
    // Arrange
    const { result: searchState } = renderHook(useSearchPages, {
      wrapper,
    });

    // Act
    act(() => searchState.current.onSearchChange('pack'));

    // Assert
    await waitFor(() =>
      expect(hitsOf(searchState.current)).toStrictEqual([
        {
          breadcrumbs: [
            'Guides',
          ],
          content: 'Write a pack',
          hastContent: undefined,
          id: 'pack',
          type: 'page',
          url: '/docs/guides/write-a-pack',
        },
        {
          content: 'Pack layout',
          hastContent: undefined,
          id: 'pack-1',
          type: 'heading',
          url: '/docs/guides/write-a-pack#layout',
        },
        {
          content: 'pack | the folder of blocks',
          hastContent: undefined,
          id: 'pack-2',
          table: 'parts',
          type: 'text',
          url: '/docs/guides/write-a-pack#layout',
        },
      ]),
    );
  });

  it('should search with the use case the root provides now', async () => {
    // Arrange
    const provided = {
      searchPages: createSearchPages(createFakePageSearch([])),
    };
    const { rerender, result: searchState } = renderHook(useSearchPages, {
      wrapper: ({ children }: { children: ReactNode }): ReactNode => (
        <SearchPagesContext value={provided.searchPages}>{children}</SearchPagesContext>
      ),
    });

    act(() => searchState.current.onSearchChange('layout'));
    await waitFor(() => expect(hitsOf(searchState.current)).toStrictEqual([]));
    provided.searchPages = searchPages;

    // Act
    rerender();

    // Assert
    await waitFor(() =>
      expect(hitsOf(searchState.current)).toStrictEqual([
        {
          content: 'Pack layout',
          hastContent: undefined,
          id: 'pack-1',
          type: 'heading',
          url: '/docs/guides/write-a-pack#layout',
        },
      ]),
    );
  });

  it('should find nothing when the root provides no search', async () => {
    // Arrange
    const { result: searchState } = renderHook(useSearchPages);

    // Act
    act(() => searchState.current.onSearchChange('pack'));

    // Assert
    await waitFor(() => expect(hitsOf(searchState.current)).toStrictEqual([]));
  });
});
