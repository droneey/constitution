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
  it.each([
    '1.2.3',
    '10.20.30',
  ])("should read the release %s from the Constitution's package", (version) => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'packages/constitution/package.json': `{ "name": "@droneey/constitution", "version": "${version}" }`,
      },
    }).leave;

    // Act
    const release = releaseOf();

    // Assert
    expect(release).toBe(version);
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
    {
      condition: 'its version carries a prefix',
      manifest: '{ "version": "v1.2.3" }',
    },
    {
      condition: 'its version carries a suffix',
      manifest: '{ "version": "1.2.3-next" }',
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
