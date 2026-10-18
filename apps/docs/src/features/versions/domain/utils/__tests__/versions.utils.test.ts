import { describe, expect, it } from 'bun:test';

import { addressIn } from '../versions.utils';

describe('addressIn', () => {
  it.each([
    {
      address: '/docs/core/names',
      condition: 'the latest is asked from its own site',
      path: '/docs/core/names',
      version: '0.70.0',
    },
    {
      address: '/docs/core/names',
      condition: 'the latest is asked from an older site',
      path: '/v0.69.2/docs/core/names',
      version: '0.70.0',
    },
    {
      address: '/v0.69.2/docs/core/names',
      condition: 'an older release is asked from the latest',
      path: '/docs/core/names',
      version: '0.69.2',
    },
    {
      address: '/v0.9.10/docs',
      condition: 'an older release is asked from another older one',
      path: '/v10.11.12/docs',
      version: '0.9.10',
    },
    {
      address: '/',
      condition: 'the latest is asked from an older site root',
      path: '/v0.69.2',
      version: '0.70.0',
    },
    {
      address: '/v0.69.2/',
      condition: 'an older release is asked from the latest root',
      path: '/',
      version: '0.69.2',
    },
    {
      address: '/v0.69.2x/docs',
      condition: 'the first segment only starts like a release',
      path: '/v0.69.2x/docs',
      version: '0.70.0',
    },
    {
      address: '/docs/v0.69.2',
      condition: 'a release appears deeper in the path',
      path: '/docs/v0.69.2',
      version: '0.70.0',
    },
    {
      address: '/v0.69/docs',
      condition: 'the first segment has two parts',
      path: '/v0.69/docs',
      version: '0.70.0',
    },
    {
      address: '/v0a69a2/docs',
      condition: 'the first segment parts are not split by dots',
      path: '/v0a69a2/docs',
      version: '0.70.0',
    },
    {
      address: '/0.69.2/docs',
      condition: 'the first segment has no v',
      path: '/0.69.2/docs',
      version: '0.70.0',
    },
  ])('should lead to the page when $condition', ({ address, path, version }) => {
    // Arrange
    const latest = '0.70.0';

    // Act
    const page = addressIn({
      latest,
      path,
      version,
    });

    // Assert
    expect(page).toBe(address);
  });
});
