import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { ReleaseStatus } from '#/kernel/entities';
import { ProjectFailure } from '#/kernel/errors';
import { Version } from '#/kernel/value-objects';

import { configPath, manifest, manifestOf } from '../../../../../__tests__/project.fixtures';
import { failureOf } from '../../read-declaration/steps/resolve-declaration/__tests__/resolution.fixtures';
import { readRelease } from '../read-release.use-case';

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
        [manifest]: '{\n  "constitutionFormat": 3,\n  "version": "1.0.0"\n}\n',
      },
    },
    {
      condition: 'the first line naming the format names it twice and a later line names another',
      expected: {
        status: ReleaseStatus.Installed,
        version: Version.create('2.0.0-rc.1'),
      },
      files: {
        [manifest]:
          '{"constitutionFormat": 2, "constitutionFormat"\t:\t3,\n"version" :"2.0.0-rc.1", "x": "y",\n"constitutionFormat": 4, "version": "9.9.9"}\n',
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
      place: projectPlace,
    });

    // Assert
    expect(release).toStrictEqual(expected);
  });

  it.each([
    {
      cause: undefined,
      code: ProjectFailure.ManifestUnreadable,
      condition: 'the release has no manifest',
      files: {},
      unreadable: [],
    },
    {
      cause: expect.any(Error),
      code: ProjectFailure.ManifestUnreadable,
      condition: 'its manifest cannot be read',
      files: {
        [manifest]: manifestOf(),
      },
      unreadable: [
        manifest,
      ],
    },
    {
      cause: undefined,
      code: ProjectFailure.VersionMissing,
      condition: 'its manifest names no version',
      files: {
        [manifest]: '{"constitutionFormat": 3}\n',
      },
      unreadable: [],
    },
    {
      cause: undefined,
      code: ProjectFailure.VersionMissing,
      condition: 'its manifest names an empty version',
      files: {
        [manifest]: '{"constitutionFormat": 3, "version": ""}\n',
      },
      unreadable: [],
    },
    {
      cause: undefined,
      code: ProjectFailure.VersionMissing,
      condition: 'its manifest names a version that is no release version',
      files: {
        [manifest]: '{"constitutionFormat": 3, "version": "next"}\n',
      },
      unreadable: [],
    },
  ])(
    'should fail with $code, keeping why the read failed, when $condition',
    ({ cause, code, files, unreadable }) => {
      // Arrange
      const projectFiles = createFakeProjectFiles({
        files: {
          [`${releaseFolderPath}/blocks/core/core.md`]: '# Core\n',
          ...files,
        },
        unreadable,
      });

      // Act
      const failure = failureOf(() =>
        readRelease({
          files: projectFiles,
          place: projectPlace,
        }),
      );

      // Assert
      expect(failure).toStrictEqual({
        cause,
        code,
        line: undefined,
        path: manifest,
      });
    },
  );
});
