import { describe, expect, it } from 'bun:test';

import { pageFixture, pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetPage } from '../get-page.use-case';

describe('createGetPage', () => {
  it.each([
    {
      condition: 'a page has the slugs',
      expected: pageFixture(),
      slugs: [
        'guides',
        'write-a-pack',
      ],
    },
    {
      condition: 'no page has them',
      expected: undefined,
      slugs: [
        'guides',
        'moved',
      ],
    },
  ])('should find the page the slugs name when $condition', async ({ expected, slugs }) => {
    // Arrange
    const getPage = createGetPage(
      createFakePagesRepository({
        pages: pagesFixture(),
      }),
    );

    // Act
    const page = await getPage(slugs);

    // Assert
    expect(page).toStrictEqual(expected);
  });
});
