import { describe, expect, it } from 'bun:test';

import { createFakePageSearch } from '#/__tests__/page-search.fake';

import { SearchResultKind } from '../../../../entities';
import { createSearchPages } from '../search-pages.use-case';

const packPage = {
  breadcrumbs: [],
  content: 'Write a pack',
  id: '/docs/guides/write-a-pack',
  kind: SearchResultKind.Page,
  url: '/docs/guides/write-a-pack',
};

describe('createSearchPages', () => {
  it('should find the results that match the query', async () => {
    // Arrange
    const searchPages = createSearchPages(
      createFakePageSearch([
        packPage,
        {
          ...packPage,
          content: 'Choose blocks',
          id: '/docs/guides/choose-blocks',
          url: '/docs/guides/choose-blocks',
        },
      ]),
    );

    // Act
    const results = await searchPages('pack');

    // Assert
    expect(results).toStrictEqual([
      packPage,
    ]);
  });
});
