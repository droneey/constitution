import { describe, expect, it } from 'bun:test';

import { createVersion } from '../../../../value-objects';
import { createGetVersions } from '../get-versions.use-case';
import { createFakeVersionsRepository } from './versions.repository.fake';

describe('createGetVersions', () => {
  it('should read the releases the repository holds', async () => {
    // Arrange
    const getVersions = createGetVersions(
      createFakeVersionsRepository({
        latest: createVersion('0.70.0'),
        versions: [
          createVersion('0.70.0'),
          createVersion('0.69.2'),
        ],
      }),
    );

    // Act
    const versions = await getVersions(new AbortController().signal);

    // Assert
    expect(versions).toStrictEqual({
      latest: createVersion('0.70.0'),
      versions: [
        createVersion('0.70.0'),
        createVersion('0.69.2'),
      ],
    });
  });

  it('should hand the signal to the repository when it reads', async () => {
    // Arrange
    const repository = createFakeVersionsRepository({
      latest: createVersion('0.70.0'),
      versions: [
        createVersion('0.70.0'),
      ],
    });
    const { signal } = new AbortController();

    // Act
    await createGetVersions(repository)(signal);

    // Assert
    expect(repository.signals).toStrictEqual([
      signal,
    ]);
  });

  it('should fail with the repository error when the read fails', async () => {
    // Arrange
    const getVersions = createGetVersions(createFakeVersionsRepository(new Error('unreadable')));

    // Act
    const read = getVersions(new AbortController().signal);

    // Assert
    await expect(read).rejects.toThrow(new Error('unreadable'));
  });
});
