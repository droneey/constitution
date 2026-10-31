import { describe, expect, it } from 'bun:test';

import { createFakeSearchIndex } from '../../../__tests__/search-index.fake';
import { createGetSearchIndex } from '../get-search-index.use-case';

describe('createGetSearchIndex', () => {
  it('should read the index the search exports', async () => {
    // Arrange
    const getSearchIndex = createGetSearchIndex(
      createFakeSearchIndex({
        type: 'simple',
      }),
    );

    // Act
    const index = await getSearchIndex();

    // Assert
    expect(index).toStrictEqual({
      type: 'simple',
    });
  });
});
