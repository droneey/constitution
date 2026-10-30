import { describe, expect, it } from 'bun:test';

import { pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetPageIndex } from '../get-page-index.use-case';

describe('createGetPageIndex', () => {
  it('should read the index of every page', async () => {
    // Arrange
    const getPageIndex = createGetPageIndex(
      createFakePagesRepository({
        pages: pagesFixture(),
      }),
    );

    // Act
    const index = await getPageIndex();

    // Assert
    expect(index).toBe('guide:guides/write-a-pack.md\noverview:README.md');
  });
});
