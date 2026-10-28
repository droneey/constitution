import { describe, expect, it } from 'bun:test';

import { createFakePageBodiesRepository } from '../../../__tests__/page-bodies.repository.fake';
import { createGetPageBody } from '../get-page-body.use-case';

/** as the fake names the body of the page it holds */
const PAGE_BODY = 'body of guide:guides/write-a-pack.md';

describe('createGetPageBody', () => {
  it('should find the body of the page its collection holds', () => {
    // Arrange
    const page = {
      collection: 'guide',
      path: 'guides/write-a-pack.md',
    };
    const getPageBody = createGetPageBody(
      createFakePageBodiesRepository([
        page,
      ]),
    );

    // Act
    const body = getPageBody(page);

    // Assert
    expect(body).toBe(PAGE_BODY);
  });
});
