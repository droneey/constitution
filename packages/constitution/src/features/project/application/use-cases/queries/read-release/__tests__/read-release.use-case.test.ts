import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { ReleaseStatus } from '#/kernel/entities';
import { AbsolutePath, Version } from '#/kernel/value-objects';

import {
  configPath,
  manifest,
  manifestOf,
  parsers,
} from '../../../../../__tests__/project.fixtures';
import { readRelease } from '../read-release.use-case';

const manifestPath = AbsolutePath.create(manifest);

describe('readRelease', () => {
  it.each([
    {
      condition: 'no release is installed',
      expected: {
        status: ReleaseStatus.Missing,
      },
      files: {
        [configPath]: 'axes: []\n',
      },
    },
    {
      condition: 'the release is of a newer block format',
      expected: {
        format: 12,
        status: ReleaseStatus.Newer,
      },
      files: {
        [manifest]: '{"version": "1.0.0", "constitutionFormat":12}\n',
      },
    },
    {
      condition: 'the release is of an older block format',
      expected: {
        status: ReleaseStatus.Older,
      },
      files: {
        [manifest]: manifestOf({
          format: 2,
        }),
      },
    },
    {
      condition: 'the release names no block format',
      expected: {
        status: ReleaseStatus.Older,
      },
      files: {
        [manifest]: '{\n  "version": "1.0.0"\n}\n',
      },
    },
    {
      condition: 'the release is of the block format this program reads',
      expected: {
        status: ReleaseStatus.Installed,
        version: Version.create('1.0.0'),
      },
      files: {
        [manifest]: '{\n  "constitutionFormat": 4,\n  "version": "1.0.0"\n}\n',
      },
    },
  ])('should give the release the project pins when $condition', ({ expected, files }) => {
    // Arrange
    const projectFiles = createFakeProjectFiles({
      files,
    });

    // Act
    const release = readRelease({
      files: projectFiles,
      manifestParser: parsers().manifestParser,
      place: projectPlace,
    });

    // Assert
    expect(release).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'the release has no manifest',
      expected: {
        manifest: manifestPath,
        status: ReleaseStatus.ManifestUnreadable,
      },
      files: {},
      unreadable: [],
    },
    {
      condition: 'its manifest cannot be read',
      expected: {
        manifest: manifestPath,
        status: ReleaseStatus.ManifestUnreadable,
      },
      files: {
        [manifest]: manifestOf(),
      },
      unreadable: [
        manifest,
      ],
    },
    {
      condition: 'its manifest is no JSON',
      expected: {
        manifest: manifestPath,
        status: ReleaseStatus.ManifestNotObject,
      },
      files: {
        [manifest]: '{"constitutionFormat": 4,\n',
      },
      unreadable: [],
    },
    {
      condition: 'its manifest gives its version in another form',
      expected: {
        fields: [
          'version',
        ],
        manifest: manifestPath,
        status: ReleaseStatus.ManifestMalformed,
      },
      files: {
        [manifest]: '{"constitutionFormat": 4, "version": 1}\n',
      },
      unreadable: [],
    },
    {
      condition: 'its manifest names no version',
      expected: {
        manifest: manifestPath,
        status: ReleaseStatus.VersionMissing,
      },
      files: {
        [manifest]: '{"constitutionFormat": 4}\n',
      },
      unreadable: [],
    },
  ])(
    'should give why the release cannot be read when $condition',
    ({ expected, files, unreadable }) => {
      // Arrange
      const projectFiles = createFakeProjectFiles({
        files: {
          [`${releaseFolderPath}/blocks/core/core.md`]: '# Core\n',
          ...files,
        },
        unreadable,
      });

      // Act
      const release = readRelease({
        files: projectFiles,
        manifestParser: parsers().manifestParser,
        place: projectPlace,
      });

      // Assert
      expect(release).toStrictEqual(expected);
    },
  );
});
