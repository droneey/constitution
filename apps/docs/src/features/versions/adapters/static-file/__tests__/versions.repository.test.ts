import { describe, expect, it } from 'bun:test';

import { ZodError } from 'zod';

import { VersionError } from '../../../domain/errors';
import { createVersion } from '../../../domain/value-objects';
import { createStaticFileVersionsRepository } from '../versions.repository';
import { transportServing, versionsFileOf } from './versions.repository.fixtures';

describe('createStaticFileVersionsRepository', () => {
  it('should read the releases when the file lists them', async () => {
    // Arrange
    const repository = createStaticFileVersionsRepository(
      '/versions.json',
      transportServing({
        '/versions.json': {
          body: versionsFileOf(),
          status: 200,
        },
      }),
    );

    // Act
    const versions = await repository.read(new AbortController().signal);

    // Assert
    expect(versions).toStrictEqual({
      latest: createVersion('0.70.0'),
      versions: [
        createVersion('0.70.0'),
        createVersion('0.69.2'),
        createVersion('0.9.10'),
      ],
    });
  });

  it('should read the releases when every part holds several digits', async () => {
    // Arrange
    const repository = createStaticFileVersionsRepository(
      '/versions.json',
      transportServing({
        '/versions.json': {
          body: versionsFileOf({
            latest: '10.20.30',
            versions: [
              '10.20.30',
            ],
          }),
          status: 200,
        },
      }),
    );

    // Act
    const versions = await repository.read(new AbortController().signal);

    // Assert
    expect(versions).toStrictEqual({
      latest: createVersion('10.20.30'),
      versions: [
        createVersion('10.20.30'),
      ],
    });
  });

  it('should fail with the status when the site answers no file', async () => {
    // Arrange
    const repository = createStaticFileVersionsRepository(
      '/versions.json',
      transportServing({
        '/other.json': {
          body: versionsFileOf(),
          status: 200,
        },
      }),
    );

    // Act
    const read = repository.read(new AbortController().signal);

    // Assert
    await expect(read).rejects.toThrow(new Error('/versions.json answered 404'));
  });

  it('should fail when the caller has aborted the read', async () => {
    // Arrange
    const repository = createStaticFileVersionsRepository(
      '/versions.json',
      transportServing({
        '/versions.json': {
          body: versionsFileOf(),
          status: 200,
        },
      }),
    );
    const controller = new AbortController();
    controller.abort(new Error('left the page'));

    // Act
    const read = repository.read(controller.signal);

    // Assert
    await expect(read).rejects.toThrow(new Error('left the page'));
  });

  it.each([
    {
      condition: 'the latest is no release version',
      file: versionsFileOf({
        latest: 'v0.70.0',
      }),
    },
    {
      condition: 'a release is no release version',
      file: versionsFileOf({
        versions: [
          '0.69.2.1',
        ],
      }),
    },
  ])('should refuse the file with the version when $condition', async ({ file }) => {
    // Arrange
    const repository = createStaticFileVersionsRepository(
      '/versions.json',
      transportServing({
        '/versions.json': {
          body: file,
          status: 200,
        },
      }),
    );

    // Act
    const read = repository.read(new AbortController().signal);

    // Assert
    await expect(read).rejects.toBeInstanceOf(VersionError);
  });

  it.each([
    {
      condition: 'the latest is missing',
      file: versionsFileOf({
        latest: undefined,
      }),
    },
    {
      condition: 'the releases are not a list',
      file: versionsFileOf({
        versions: '0.69.2',
      }),
    },
  ])('should refuse the file when $condition', async ({ file }) => {
    // Arrange
    const repository = createStaticFileVersionsRepository(
      '/versions.json',
      transportServing({
        '/versions.json': {
          body: file,
          status: 200,
        },
      }),
    );

    // Act
    const read = repository.read(new AbortController().signal);

    // Assert
    await expect(read).rejects.toBeInstanceOf(ZodError);
  });
});
