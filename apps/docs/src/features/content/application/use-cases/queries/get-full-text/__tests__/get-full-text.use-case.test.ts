import { describe, expect, it } from 'bun:test';

import { pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetFullText } from '../get-full-text.use-case';

describe('createGetFullText', () => {
  it('should read the text of every page', async () => {
    // Arrange
    const getFullText = createGetFullText(
      createFakePagesRepository({
        pages: pagesFixture(),
      }),
    );

    // Act
    const text = await getFullText();

    // Assert
    expect(text).toBe('guide:guides/write-a-pack.md\n\noverview:README.md');
  });
});
