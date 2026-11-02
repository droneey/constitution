import { describe, expect, it } from 'bun:test';

import { Version } from '../../../../../domain/versions/value-objects';
import { createGetVersions } from '../get-versions.use-case';
import { createFakeVersionQueries } from './versions.repository.fake';

describe('createGetVersions', () => {
  it('should read the releases the repository holds, under the caller’s signal', async () => {
    // Arrange
    const versionQueries = createFakeVersionQueries({
      latest: Version.create('0.70.0'),
      versions: [
        Version.create('0.70.0'),
      ],
    });
    const { signal } = new AbortController();

    // Act
    const versions = await createGetVersions(versionQueries)(signal);

    // Assert
    expect({
      signals: versionQueries.signals,
      versions,
    }).toStrictEqual({
      signals: [
        signal,
      ],
      versions: {
        latest: Version.create('0.70.0'),
        versions: [
          Version.create('0.70.0'),
        ],
      },
    });
  });
});
