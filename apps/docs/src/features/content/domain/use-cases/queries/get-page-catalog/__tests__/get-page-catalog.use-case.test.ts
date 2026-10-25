import { describe, expect, it } from 'bun:test';

import { pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetPageCatalog } from '../get-page-catalog.use-case';

describe('createGetPageCatalog', () => {
  it('should read every page by its slugs', async () => {
    // Arrange
    const getPageCatalog = createGetPageCatalog(
      createFakePagesRepository({
        pages: pagesFixture(),
      }),
    );

    // Act
    const catalog = await getPageCatalog();

    // Assert
    expect(catalog).toStrictEqual(Object.fromEntries(pagesFixture()));
  });
});
