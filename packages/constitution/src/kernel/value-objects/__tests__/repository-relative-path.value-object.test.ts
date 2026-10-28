import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { AbsolutePath } from '../absolute-path.value-object';
import { RepositoryRelativePath } from '../repository-relative-path.value-object';

describe('RepositoryRelativePath', () => {
  it.each([
    {
      condition: "it names a file below the repository's folder",
      given: 'apps/web/biome.json',
      isRelative: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isRelative: true,
    },
    {
      condition: 'it opens with a slash',
      given: '/apps/web/biome.json',
      isRelative: false,
    },
    {
      condition: 'it leaves the folder',
      given: '../web/biome.json',
      isRelative: false,
    },
    {
      condition: 'it names the parent folder',
      given: '..',
      isRelative: false,
    },
    {
      condition: 'it is written with an empty part',
      given: 'apps//biome.json',
      isRelative: false,
    },
    {
      condition: 'it takes a part back',
      given: 'apps/web/../biome.json',
      isRelative: false,
    },
    {
      condition: 'it only starts with two dots',
      given: '..config/biome.json',
      isRelative: true,
    },
    {
      condition: 'it is no text',
      given: 42,
      isRelative: false,
    },
  ])('should say $isRelative when $condition', ({ given, isRelative }) => {
    // Act
    const answer = RepositoryRelativePath.is(given);

    // Assert
    expect(answer).toBe(isRelative);
  });

  it('should refuse a path that leaves the folder', () => {
    // Arrange
    const text = '../apps/web';

    // Act
    const create = (): RepositoryRelativePath => RepositoryRelativePath.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.RepositoryRelativePath,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'the folder is a member',
      expected: 'apps/web/presets/biome.yaml',
      folder: 'apps/web',
    },
    {
      condition: "the folder is the repository's own",
      expected: 'presets/biome.yaml',
      folder: '',
    },
  ])('should join a folder and a relative path when $condition', ({ expected, folder }) => {
    // Arrange
    const folderPath = RepositoryRelativePath.create(folder);

    // Act
    const joined = RepositoryRelativePath.join(folderPath, 'presets/biome.yaml');

    // Assert
    expect<string>(joined).toBe(expected);
  });

  it.each([
    {
      condition: 'the path lies in the folder',
      expected: 'apps/web/biome.json',
      path: '/work/project/apps/web/biome.json',
    },
    {
      condition: 'the path is the folder itself',
      expected: undefined,
      path: '/work/project',
    },
    {
      condition: "the path only starts with the folder's name",
      expected: undefined,
      path: '/work/project-old/biome.json',
    },
    {
      condition: 'the rest of the path opens with another slash',
      expected: undefined,
      path: '/work/project//biome.json',
    },
    {
      condition: 'the path leaves the folder',
      expected: undefined,
      path: '/work/project/../biome.json',
    },
  ])('should give the path from the folder when $condition', ({ expected, path }) => {
    // Arrange
    const repositoryFolderPath = AbsolutePath.create('/work/project');

    // Act
    const fromRepository = RepositoryRelativePath.fromAbsolute(repositoryFolderPath, path);

    // Assert
    expect<string | undefined>(fromRepository).toBe(expected);
  });
});
