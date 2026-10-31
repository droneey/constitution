import { describe, expect, it } from 'bun:test';

import { pagesFixture } from '../../../__tests__/content.fixtures';
import { createFakePagesRepository } from '../../../__tests__/pages.repository.fake';
import { createGetNavigation } from '../get-navigation.use-case';

describe('createGetNavigation', () => {
  it('should read the navigation of every page', async () => {
    // Arrange
    const getNavigation = createGetNavigation(
      createFakePagesRepository({
        pages: pagesFixture(),
      }),
    );

    // Act
    const navigation = await getNavigation();

    // Assert
    expect(navigation).toStrictEqual([
      'guide:guides/write-a-pack.md',
      'overview:README.md',
    ]);
  });
});
