import { afterEach, describe, expect, it } from 'bun:test';

import { SourceFailure } from '../../../../domain/source/errors';
import { taglineOf } from '../brand.adapter';
import { enterRepository, failureOf } from './repository.fixtures';

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
});

describe('taglineOf', () => {
  it("should read the tagline from the repository's brand", () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'brand.yaml': 'version: 1\nwordmark:\n  - Constitution\ntagline: Rules\n',
      },
    }).leave;

    // Act
    const tagline = taglineOf();

    // Assert
    expect(tagline).toBe('Rules');
  });

  it.each([
    {
      brand: 'version: 1\n',
      cause: 'ZodError',
      condition: 'has no tagline',
    },
    {
      brand: 'tagline: [Rules\n',
      cause: 'YAMLParseError',
      condition: 'holds no YAML',
    },
    {
      brand: 'tagline: *rules\n',
      cause: 'ReferenceError',
      condition: 'names an anchor it never sets',
    },
  ])('should fail, naming the file, when the brand $condition', ({ brand, cause }) => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'brand.yaml': brand,
      },
    }).leave;

    // Act
    const failure = failureOf(taglineOf);

    // Assert
    expect(failure).toStrictEqual({
      cause,
      code: SourceFailure.FileMalformed,
      details: {
        path: 'brand.yaml',
      },
    });
  });

  it('should let the failure to read a missing brand through as it is', () => {
    // Arrange
    repository.leave = enterRepository({}).leave;

    // Act
    const failure = failureOf(taglineOf);

    // Assert
    expect(failure).toStrictEqual({
      code: 'ENOENT',
    });
  });
});
