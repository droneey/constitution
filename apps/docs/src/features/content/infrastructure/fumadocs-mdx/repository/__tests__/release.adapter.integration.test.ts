import { afterEach, describe, expect, it } from 'bun:test';

import { SourceFailure } from '../../../../domain/source/errors';
import { releaseOf } from '../release.adapter';
import { enterRepository, failureOf } from './repository.fixtures';

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
      cause: 'ZodError',
      condition: 'the package has no version',
      manifest: '{ "name": "@droneey/constitution" }',
    },
    {
      cause: 'ZodError',
      condition: 'its version is not a release',
      manifest: '{ "version": "next" }',
    },
    {
      cause: 'ZodError',
      condition: 'its version carries a prefix',
      manifest: '{ "version": "v1.2.3" }',
    },
    {
      cause: 'ZodError',
      condition: 'its version carries a suffix',
      manifest: '{ "version": "1.2.3-next" }',
    },
    {
      cause: 'SyntaxError',
      condition: 'the package holds no JSON',
      manifest: '{ "version": ',
    },
  ])('should fail, naming the file, when $condition', ({ cause, manifest }) => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        'packages/constitution/package.json': manifest,
      },
    }).leave;

    // Act
    const failure = failureOf(releaseOf);

    // Assert
    expect(failure).toStrictEqual({
      cause,
      code: SourceFailure.FileMalformed,
      details: {
        path: 'packages/constitution/package.json',
      },
    });
  });
});
