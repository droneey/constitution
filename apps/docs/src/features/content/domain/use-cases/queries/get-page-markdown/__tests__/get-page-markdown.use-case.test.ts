import { describe, expect, it } from 'bun:test';

import { pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetPageMarkdown } from '../get-page-markdown.use-case';

describe('createGetPageMarkdown', () => {
  it.each([
    {
      condition: 'a page has the slugs',
      expected: 'guide:guides/write-a-pack.md',
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
  ])(
    'should read the Markdown of the page the slugs name when $condition',
    async ({ expected, slugs }) => {
      // Arrange
      const getPageMarkdown = createGetPageMarkdown(
        createFakePagesRepository({
          pages: pagesFixture(),
        }),
      );

      // Act
      const markdown = await getPageMarkdown(slugs);

      // Assert
      expect(markdown).toStrictEqual(expected);
    },
  );
});
