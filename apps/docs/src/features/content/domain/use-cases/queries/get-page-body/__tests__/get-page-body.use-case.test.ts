import { describe, expect, it } from 'bun:test';

import { createFakePageBodiesRepository } from '../../../__tests__/page-bodies.repository.fake';
import { createGetPageBody } from '../get-page-body.use-case';

describe('createGetPageBody', () => {
  it.each([
    {
      condition: 'its collection holds it',
      expected: 'body of guide:guides/write-a-pack.md',
      path: 'guides/write-a-pack.md',
    },
    {
      condition: 'its collection holds none at its path',
      expected: undefined,
      path: 'guides/moved.md',
    },
  ])('should find the body of the page when $condition', ({ expected, path }) => {
    // Arrange
    const getPageBody = createGetPageBody(
      createFakePageBodiesRepository([
        {
          collection: 'guide',
          path: 'guides/write-a-pack.md',
        },
      ]),
    );

    // Act
    const body = getPageBody({
      collection: 'guide',
      path,
    });

    // Assert
    expect(body).toBe(expected);
  });
});
