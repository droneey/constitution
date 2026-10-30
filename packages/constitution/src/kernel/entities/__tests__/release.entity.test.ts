import { describe, expect, it } from 'bun:test';

import { AbsolutePath, Version } from '../../value-objects';
import { Release, ReleaseStatus } from '../release.entity';

const manifestPath = AbsolutePath.create('/work/project/.droneey/constitution/package.json');
const version = Version.create('1.0.0');

describe('Release.ofManifest', () => {
  it.each<{
    blockFormat: number | undefined;
    condition: string;
    expected: Release;
    version: Version | undefined;
  }>([
    {
      blockFormat: undefined,
      condition: 'the manifest names no block format',
      expected: {
        status: ReleaseStatus.Older,
      },
      version,
    },
    {
      blockFormat: 3,
      condition: 'the block format is older than the oldest this program reads',
      expected: {
        status: ReleaseStatus.Older,
      },
      version,
    },
    {
      blockFormat: 5,
      condition: 'the block format is newer than the newest this program reads',
      expected: {
        format: 5,
        status: ReleaseStatus.Newer,
      },
      version,
    },
    {
      blockFormat: 4,
      condition: 'the manifest names no version',
      expected: {
        manifest: manifestPath,
        status: ReleaseStatus.VersionMissing,
      },
      version: undefined,
    },
    {
      blockFormat: 4,
      condition: 'the block format is one this program reads and a version is named',
      expected: {
        status: ReleaseStatus.Installed,
        version,
      },
      version,
    },
  ])('should give the release when $condition', ({ blockFormat, expected, ...given }) => {
    // Arrange
    const fields = {
      blockFormat,
      manifestPath,
      version: given.version,
    };

    // Act
    const release = Release.ofManifest(fields);

    // Assert
    expect(release).toStrictEqual(expected);
  });
});
