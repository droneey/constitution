import { describe, expect, it } from 'bun:test';

import { PageSlugs } from '../../../../../domain/page/value-objects';
import { pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetPageMarkdown } from '../get-page-markdown.use-case';

describe('createGetPageMarkdown', () => {
  it('should read the Markdown of the page the slugs name', async () => {
    // Arrange
    const getPageMarkdown = createGetPageMarkdown(
      createFakePagesRepository({
        pages: pagesFixture(),
      }),
    );

    // Act
    const markdown = await getPageMarkdown(
      PageSlugs.create([
        'guides',
        'write-a-pack',
      ]),
    );

    // Assert
    expect(markdown).toBe('guide:guides/write-a-pack.md');
  });
});
