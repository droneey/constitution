import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '../../../value-objects';
import type { ProjectFolder } from '../project-place.entity';
import { ProjectPlace } from '../project-place.entity';

interface FolderFixture {
  readonly config?: boolean;
  readonly path: string;
  readonly repository?: boolean;
}

const foldersOf = (fixtures: readonly FolderFixture[]): readonly ProjectFolder[] =>
  fixtures.map((fixture) => ({
    folderPath: AbsolutePath.create(fixture.path),
    holdsConfig: fixture.config ?? false,
    holdsRepository: fixture.repository ?? false,
  }));

describe('ProjectPlace.find', () => {
  it.each<{
    condition: string;
    expected: string | undefined;
    folders: readonly FolderFixture[];
  }>([
    {
      condition: 'the start folder is the root of its repository and holds the configuration',
      expected: '/work/project',
      folders: [
        {
          config: true,
          path: '/work/project',
          repository: true,
        },
        {
          path: '/work',
        },
        {
          path: '/',
        },
      ],
    },
    {
      condition: 'a member and the root of its repository both hold one',
      expected: '/work/project',
      folders: [
        {
          config: true,
          path: '/work/project/apps/web',
        },
        {
          path: '/work/project/apps',
        },
        {
          config: true,
          path: '/work/project',
          repository: true,
        },
        {
          path: '/work',
        },
        {
          path: '/',
        },
      ],
    },
    {
      condition: 'only a member below the root of its repository holds one',
      expected: '/work/project/apps/web',
      folders: [
        {
          config: true,
          path: '/work/project/apps/web',
        },
        {
          config: false,
          path: '/work/project',
          repository: true,
        },
        {
          path: '/',
        },
      ],
    },
    {
      condition: 'only a folder above its repository holds one',
      expected: undefined,
      folders: [
        {
          path: '/work/project',
          repository: true,
        },
        {
          config: true,
          path: '/work',
        },
        {
          path: '/',
        },
      ],
    },
    {
      condition: 'no repository holds the start folder, which holds one',
      expected: '/work/project',
      folders: [
        {
          config: true,
          path: '/work/project',
        },
        {
          path: '/work',
        },
        {
          path: '/',
        },
      ],
    },
    {
      condition: 'no repository holds the start folder and only a folder above holds one',
      expected: undefined,
      folders: [
        {
          path: '/work/project',
        },
        {
          config: true,
          path: '/work',
        },
        {
          path: '/',
        },
      ],
    },
    {
      condition: 'no folder is given',
      expected: undefined,
      folders: [],
    },
  ])(
    'should place the project in its outermost folder when $condition',
    ({ expected, folders }) => {
      // Arrange
      const given = foldersOf(folders);

      // Act
      const place = ProjectPlace.find(given);

      // Assert
      expect<object | undefined>(place).toStrictEqual(
        expected === undefined
          ? undefined
          : {
              releaseFolderPath: `${expected}/.droneey/constitution`,
              repositoryFolderPath: expected,
            },
      );
    },
  );
});
