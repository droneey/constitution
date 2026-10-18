import { afterEach, describe, expect, it } from 'bun:test';

import { ZodError } from 'zod';

import { releaseOf } from '../release.adapter';
import { enterRepository } from './repository.fixtures';

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
});

describe('releaseOf', () => {
  it("should read the release from the Constitution's package", () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'packages/constitution/package.json':
          '{ "name": "@droneey/constitution", "version": "1.2.3" }',
      },
    }).leave;

    // Act
    const release = releaseOf();

    // Assert
    expect(release).toBe('1.2.3');
  });

  it.each([
    {
      condition: 'the package has no version',
      manifest: '{ "name": "@droneey/constitution" }',
    },
    {
      condition: 'its version is not a release',
      manifest: '{ "version": "next" }',
    },
  ])('should fail when $condition', ({ manifest }) => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'packages/constitution/package.json': manifest,
      },
    }).leave;

    // Act
    const read = (): unknown => releaseOf();

    // Assert
    expect(read).toThrow(ZodError);
  });
});
