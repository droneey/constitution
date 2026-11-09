import { describe, expect, it } from 'bun:test';

import { ValueFailure } from '../../../shared/errors';
import { failureOf } from '../../../shared/errors/__tests__/invalid-value.fixtures';
import { SiteBasePath } from '../site-base-path.value-object';

describe('SiteBasePath.create', () => {
  it.each([
    {
      condition: 'the site is served at the host root',
      text: '/',
    },
    {
      condition: "the site is served under a release's folder",
      text: '/v0.83.0/',
    },
  ])('should keep the address when $condition', ({ text }) => {
    // Act
    const path = SiteBasePath.create(text);

    // Assert
    expect<string>(path).toBe(text);
  });

  it.each([
    {
      condition: 'does not open with a slash',
      text: 'v0.83.0/',
    },
    {
      condition: 'does not end with a slash',
      text: '/v0.83.0',
    },
  ])('should refuse the address when it $condition', ({ text }) => {
    // Act
    const failure = failureOf(() => SiteBasePath.create(text));

    // Assert
    expect(failure).toStrictEqual({
      code: ValueFailure.SiteBasePathInvalid,
      details: {
        value: text,
      },
    });
  });
});

describe('SiteBasePath.is', () => {
  it.each([
    {
      candidate: '/v0.83.0/',
      condition: 'an address that opens and ends with a slash',
      expected: true,
    },
    {
      candidate: 1,
      condition: 'no text',
      expected: false,
    },
  ])('should answer $expected when the candidate is $condition', ({ candidate, expected }) => {
    // Act
    const isBasePath = SiteBasePath.is(candidate);

    // Assert
    expect(isBasePath).toBe(expected);
  });
});
