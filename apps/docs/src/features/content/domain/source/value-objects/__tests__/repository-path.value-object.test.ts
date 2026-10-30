import { describe, expect, it } from 'bun:test';

import { ValueFailure } from '../../../shared/errors';
import { failureOf } from '../../../shared/errors/__tests__/invalid-value.fixtures';
import { RepositoryPath } from '../repository-path.value-object';

describe('RepositoryPath.create', () => {
  it.each([
    'docs/guides/upgrade.md',
    '',
    '..notes.md',
  ])('should keep %p, a path inside the repository', (text) => {
    // Act
    const path = RepositoryPath.create(text);

    // Assert
    expect<string>(path).toBe(text);
  });

  it.each([
    {
      condition: 'it starts from the root of the file system',
      text: '/repository/README.md',
    },
    {
      condition: 'it leaves the repository',
      text: '../outside.md',
    },
    {
      condition: 'it names the folder above the repository',
      text: '..',
    },
    {
      condition: 'it climbs out of the repository below its first folder',
      text: 'docs/../../outside.md',
    },
  ])('should refuse the text when $condition', ({ text }) => {
    // Act
    const failure = failureOf(() => RepositoryPath.create(text));

    // Assert
    expect(failure).toStrictEqual({
      code: ValueFailure.PathOutsideRepository,
      details: {
        value: text,
      },
    });
  });
});

describe('RepositoryPath.is', () => {
  it.each([
    {
      candidate: 'README.md',
      condition: 'a path inside the repository',
      expected: true,
    },
    {
      candidate: '/README.md',
      condition: 'a path from the root of the file system',
      expected: false,
    },
    {
      candidate: undefined,
      condition: 'no text',
      expected: false,
    },
  ])('should answer $expected when the candidate is $condition', ({ candidate, expected }) => {
    // Act
    const isInside = RepositoryPath.is(candidate);

    // Assert
    expect(isInside).toBe(expected);
  });
});

describe('RepositoryPath.pathBelow', () => {
  it.each([
    {
      condition: 'the path lies in the folder',
      expected: 'guides/upgrade.md',
      path: 'docs/guides/upgrade.md',
    },
    {
      condition: "the path's first folder only starts like the folder",
      expected: undefined,
      path: 'docs-old/upgrade.md',
    },
    {
      condition: 'the path names the folder further down',
      expected: undefined,
      path: 'packages/docs/upgrade.md',
    },
  ])('should give $expected when $condition', ({ expected, path }) => {
    // Arrange
    const folderPath = RepositoryPath.create('docs');
    const repositoryPath = RepositoryPath.create(path);

    // Act
    const below = RepositoryPath.pathBelow(folderPath, repositoryPath);

    // Assert
    expect(below).toBe(expected);
  });
});
