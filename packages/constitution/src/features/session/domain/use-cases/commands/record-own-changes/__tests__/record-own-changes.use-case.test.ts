import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import { notingSessionWritesOf, StoreWrite } from '../../../../../__tests__/gate.fixtures';
import {
  heldSessionsOf,
  keptSession,
  ownChangesIn,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { SessionAgent } from '../../../../entities';
import { recordOwnChanges } from '../record-own-changes.use-case';

describe('recordOwnChanges', () => {
  it.each([
    {
      condition: 'the agent changed files, one through a link',
      own: [
        '/work/project/src/a.ts',
        '/work/project/src/b.ts',
      ],
      paths: [
        '/link/src/a.ts',
        '/work/project/src/b.ts',
      ],
      writes: [
        StoreWrite.AddOwnChanges,
      ],
    },
    {
      condition: 'the agent changed a file git ignores beside one it does not',
      own: [
        '/work/project/src/a.ts',
      ],
      paths: [
        '/work/project/build/out.js',
        '/work/project/src/a.ts',
      ],
      writes: [
        StoreWrite.AddOwnChanges,
      ],
    },
    {
      condition: 'the agent changed only files git ignores',
      own: [],
      paths: [
        '/work/project/build/out.js',
      ],
      writes: [],
    },
    {
      condition: 'the agent changed a file in no project',
      own: [
        '/tmp/notes.md',
      ],
      paths: [
        '/tmp/notes.md',
      ],
      writes: [
        StoreWrite.AddOwnChanges,
      ],
    },
    {
      condition: 'the agent changed nothing',
      own: [],
      paths: [],
      writes: [],
    },
  ])('should note the real paths of what it changed when $condition', ({ own, paths, writes }) => {
    // Arrange
    const held = heldSessionsOf();
    const noted = notingSessionWritesOf(createFakeSessionCommandRepository(held));

    // Act
    recordOwnChanges({
      agent: SessionAgent.main,
      paths: paths.map(AbsolutePath.create),
      session: keptSession,
      sessions: noted.store,
      source: createFakeActiveRulesSource({
        links: {
          '/link/src/a.ts': AbsolutePath.create('/work/project/src/a.ts'),
        },
      }),
      workingTree: createFakeWorkingTree({
        ignored: [
          'build',
        ],
      }),
    });

    // Assert
    expect({
      own: ownChangesIn(held, {
        agent: SessionAgent.main,
        session: keptSession,
      }).toSorted(),
      writes: noted.writes,
    }).toStrictEqual({
      own: own.map(AbsolutePath.create),
      writes,
    });
  });

  it('should note a changed file when git cannot tell whether it ignores it', () => {
    // Arrange
    const held = heldSessionsOf();

    // Act
    recordOwnChanges({
      agent: SessionAgent.main,
      paths: [
        AbsolutePath.create('/work/project/build/out.js'),
      ],
      session: keptSession,
      sessions: createFakeSessionCommandRepository(held),
      source: createFakeActiveRulesSource(),
      workingTree: createFakeWorkingTree({
        ignored: [
          'build',
        ],
        repositoryFolderPath: '/work/elsewhere',
      }),
    });

    // Assert
    expect(
      ownChangesIn(held, {
        agent: SessionAgent.main,
        session: keptSession,
      }),
    ).toStrictEqual([
      AbsolutePath.create('/work/project/build/out.js'),
    ]);
  });
});
