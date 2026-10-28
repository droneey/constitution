import { describe, expect, it } from 'bun:test';

import { Version } from '../../value-objects';
import { Versions } from '../versions.entity';

describe('pageAddressIn', () => {
  it.each([
    {
      address: '/v0.70.0/docs/core/names#main',
      condition: 'a page is asked',
      pageHref: '/docs/core/names#main',
    },
    {
      address: '/v0.70.0/',
      condition: "the site's root is asked",
      pageHref: '/',
    },
  ])(
    "should lead to the same page in the release's site when $condition",
    ({ address, pageHref }) => {
      // Arrange
      const version = Version.create('0.70.0');

      // Act
      const page = Versions.pageAddressIn({
        pageHref,
        version,
      });

      // Assert
      expect(page).toBe(address);
    },
  );
});
