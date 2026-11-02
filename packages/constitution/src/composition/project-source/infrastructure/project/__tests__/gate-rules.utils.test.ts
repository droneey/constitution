import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import type { ActiveRead } from '#/features/session';
import { ActiveReadStatus } from '#/features/session';
import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { readActiveOf, realPathOf, rulesInOf } from '../gate-rules.utils';
import {
  chapterPath,
  chapterText,
  projectPortsOf,
  projectTreeOf,
  UNPARSED_CONFIG,
} from './project-ports.fixtures';

describe('realPathOf', () => {
  const files = createFakeProjectFiles({
    files: {
      [`${PROJECT}/src/a.ts`]: '',
    },
    links: {
      '/link': PROJECT,
    },
  });

  it.each([
    {
      condition: 'a file through a link',
      path: '/link/src/a.ts',
      real: `${PROJECT}/src/a.ts`,
    },
    {
      condition: 'a file not yet written in a folder through a link',
      path: '/link/src/new/b.ts',
      real: `${PROJECT}/src/new/b.ts`,
    },
    {
      condition: 'a path no folder of exists',
      path: '/nowhere/a.ts',
      real: '/nowhere/a.ts',
    },
  ])('should resolve the folders of $condition', ({ path, real }) => {
    // Act
    const resolved = realPathOf(files, AbsolutePath.create(path));

    // Assert
    expect<string>(resolved).toBe(real);
  });
});

describe('rulesInOf', () => {
  it('should give the rules a block file words, its code samples left out', () => {
    // Arrange
    const files = createFakeProjectFiles({
      files: {
        [chapterPath]: chapterText,
      },
    });

    // Act
    const rules = rulesInOf(files, AbsolutePath.create(chapterPath));

    // Assert
    expect(rules).toStrictEqual([
      {
        slug: RuleSlug.create('name-reveals-intent'),
        statedLevel: Level.Must,
        statement: 'A name says what the thing is for.',
        why: 'a reader learns it from the name.',
      },
      {
        slug: RuleSlug.create('name-reveals-more'),
        statement: 'A name says more.',
        tightens: RuleSlug.create('name-reveals-intent'),
        why: 'more is clearer.',
      },
    ]);
  });

  it('should give no rules when the file cannot be read', () => {
    // Act
    const rules = rulesInOf(
      createFakeProjectFiles({
        files: {},
      }),
      AbsolutePath.create(chapterPath),
    );

    // Assert
    expect(rules).toBeUndefined();
  });
});

describe('readActiveOf', () => {
  it.each([
    {
      condition: 'constitution.yaml does not parse',
      ports: projectPortsOf(
        projectTreeOf({
          config: UNPARSED_CONFIG,
        }),
      ),
      status: ActiveReadStatus.Unparsed,
    },
    {
      condition: 'no release is installed',
      ports: projectPortsOf({
        files: {
          [`${PROJECT}/constitution.yaml`]: 'axes: []\n',
        },
      }),
      status: ActiveReadStatus.NoRelease,
    },
    {
      condition: "the release's blocks cannot be listed",
      ports: projectPortsOf({
        files: {
          [`${PROJECT}/constitution.yaml`]: 'axes: []\n',
          [`${releaseFolderPath}/package.json`]: '{}\n',
        },
      }),
      status: ActiveReadStatus.Failed,
    },
  ])('should give $status when $condition', ({ ports, status }) => {
    // Act
    const read = readActiveOf(ports, projectPlace);

    // Assert
    expect(read.status).toBe(status);
  });
});

const levelsOf = (read: ActiveRead): ReadonlyMap<string, Level> | undefined =>
  read.status === ActiveReadStatus.Read ? read.rules.levels : undefined;

describe('readActiveOf, with a rule and a failure of its own', () => {
  it("should give each rule's level as the release reads it", () => {
    // Arrange
    const ports = projectPortsOf(
      projectTreeOf({
        files: {
          [chapterPath]: chapterText,
        },
      }),
    );

    // Act
    const read = readActiveOf(ports, projectPlace);

    // Assert
    expect(levelsOf(read)).toStrictEqual(
      new Map([
        [
          RuleSlug.create('name-reveals-intent'),
          Level.Must,
        ],
        [
          RuleSlug.create('name-reveals-more'),
          Level.Must,
        ],
      ]),
    );
  });

  it('should let through a failure that is no failure to read the project', () => {
    // Arrange
    const ports = {
      ...projectPortsOf(),
      configParser: {
        parse: () => {
          throw new TypeError('a defect');
        },
      },
    };

    // Act
    const read = (): unknown => readActiveOf(ports, projectPlace);

    // Assert
    expect(read).toThrow(new TypeError('a defect'));
  });
});
