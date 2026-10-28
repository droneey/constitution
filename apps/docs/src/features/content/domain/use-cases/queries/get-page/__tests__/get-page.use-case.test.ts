import { describe, expect, it } from 'bun:test';

import { PageSlugs } from '../../../../value-objects';
import { pageFixture, pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetPage } from '../get-page.use-case';

describe('createGetPage', () => {
  it('should find the page the slugs name', async () => {
    // Arrange
    const getPage = createGetPage(
      createFakePagesRepository({
        pages: pagesFixture(),
      }),
    );

    // Act
    const page = await getPage(
      PageSlugs.create([
        'guides',
        'write-a-pack',
      ]),
    );

    // Assert
    expect(page).toStrictEqual(pageFixture());
  });
});
