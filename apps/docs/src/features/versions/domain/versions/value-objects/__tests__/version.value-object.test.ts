import { describe, expect, it } from 'bun:test';

import { VersionError } from '../../errors';
import { Version } from '../version.value-object';

const failureOf = (create: () => Version): unknown => {
  try {
    return create();
  } catch (error) {
    return error instanceof VersionError
      ? {
          code: error.code,
          details: error.details,
        }
      : error;
  }
};

describe('Version.create', () => {
  it.each([
    '0.70.0',
    '10.20.30',
  ])('should keep %p, a release version', (text) => {
    // Act
    const version = Version.create(text);

    // Assert
    expect<string>(version).toBe(text);
  });

  it.each([
    {
      condition: 'it has a prefix',
      text: 'v0.70.0',
    },
    {
      condition: 'it has a suffix',
      text: '0.70.0-beta',
    },
    {
      condition: 'it has two parts',
      text: '0.70',
    },
    {
      condition: 'it has four parts',
      text: '0.69.2.1',
    },
    {
      condition: 'a part is a letter',
      text: '0.x.0',
    },
    {
      condition: 'a part is empty',
      text: '0..0',
    },
  ])('should refuse the text when $condition', ({ text }) => {
    // Act
    const failure = failureOf(() => Version.create(text));

    // Assert
    expect(failure).toStrictEqual({
      code: 'version-not-semantic',
      details: {
        text,
      },
    });
  });
});
