import { afterEach, describe, expect, it } from 'bun:test';

import { ZodError } from 'zod';

import { taglineOf } from '../brand.adapter';
import { enterRepository } from './repository.fixtures';

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

  it('should fail when the brand has no tagline', () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'brand.yaml': 'version: 1\n',
      },
    }).leave;

    // Act
    const read = (): unknown => taglineOf();

    // Assert
    expect(read).toThrow(ZodError);
  });
});
