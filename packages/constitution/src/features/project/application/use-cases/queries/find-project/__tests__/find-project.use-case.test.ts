import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { AbsolutePath } from '#/kernel/value-objects';

import { findProject } from '../find-project.use-case';

describe('findProject', () => {
  it.each([
    {
      condition: 'the start folder holds constitution.yaml',
      expected: {
        releaseFolderPath: '/work/project/.droneey/constitution',
        repositoryFolderPath: '/work/project',
      },
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'only the root of its repository holds it',
      expected: {
        releaseFolderPath: '/work/project/.droneey/constitution',
        repositoryFolderPath: '/work/project',
      },
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/apps/web/package.json': '{}\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project/apps/web',
    },
    {
      condition: 'a member and the root of its repository both hold one',
      expected: {
        releaseFolderPath: '/work/project/.droneey/constitution',
        repositoryFolderPath: '/work/project',
      },
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/apps/web/constitution.yaml': 'axes: []\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project/apps/web',
    },
    {
      condition: 'only a folder above its repository holds it',
      expected: undefined,
      files: {
        '/work/constitution.yaml': 'axes: []\n',
        '/work/project/.git': 'gitdir: /work/main/.git/worktrees/project\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'no repository holds the start folder, which holds it',
      expected: {
        releaseFolderPath: '/work/project/.droneey/constitution',
        repositoryFolderPath: '/work/project',
      },
      files: {
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'no repository holds the start folder and only a folder above holds it',
      expected: undefined,
      files: {
        '/work/constitution.yaml': 'axes: []\n',
        '/work/project/README.md': '# Project\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'the start folder is reached through a link',
      expected: {
        releaseFolderPath: '/work/project/.droneey/constitution',
        repositoryFolderPath: '/work/project',
      },
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {
        '/home/me/project': '/work/project',
      },
      start: '/home/me/project',
    },
    {
      condition: 'the repository is the root folder',
      expected: {
        releaseFolderPath: '/.droneey/constitution',
        repositoryFolderPath: '/',
      },
      files: {
        '/.git/HEAD': 'ref: refs/heads/main\n',
        '/constitution.yaml': 'axes: []\n',
        '/work/README.md': '# Work\n',
      },
      links: {},
      start: '/work',
    },
    {
      condition: 'the start is no folder',
      expected: undefined,
      files: {
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project/constitution.yaml',
    },
  ])(
    'should find the project around the start folder when $condition',
    ({ expected, files, links, start }) => {
      // Arrange
      const projectFiles = createFakeProjectFiles({
        files,
        links,
      });

      // Act
      const place = findProject({
        files: projectFiles,
        startFolderPath: AbsolutePath.create(start),
      });

      // Assert
      expect<object | undefined>(place).toStrictEqual(expected);
    },
  );
});
