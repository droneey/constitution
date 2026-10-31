import { describe, expect, it } from 'bun:test';

import { ConfigReadStatus } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

import {
  heldSessionsOf,
  keptSession,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { SessionMark } from '../../../../../domain/session/entities';
import { SessionId } from '../../../../../domain/session/value-objects';
import { TreeStateStatus } from '../../../../../domain/tree-state/entities';
import { recordCheck } from '../record-check.use-case';

const TREE = 'tree-now';

describe('recordCheck', () => {
  it.each([
    {
      checked: TREE,
      command: 'constitution run check',
      condition: 'the command is the check',
    },
    {
      checked: undefined,
      command: 'constitution run checkout',
      condition: 'the command only starts with the check',
    },
  ])(
    'should leave $checked as the tree checked when $condition, as the command tells',
    ({ checked, command }) => {
      // Arrange
      const store = heldSessionsOf();

      // Act
      recordCheck({
        command,
        session: keptSession,
        sessions: createFakeSessionCommandRepository(store),
        workingTree: createFakeWorkingTree({
          state: TREE,
        }),
      });

      // Assert
      expect(store.get(keptSession)?.marks.get(SessionMark.Checked)).toBe(checked);
    },
  );

  it.each([
    {
      condition: 'the session kept no state',
      session: SessionId.create('session-2'),
      state: sessionStateOf(),
      tree: TREE,
    },
    {
      condition: 'constitution.yaml did not parse',
      session: keptSession,
      state: {
        repositoryFolderPath: AbsolutePath.create('/work/project'),
        status: ConfigReadStatus.Unparsed,
      },
      tree: TREE,
    },
    {
      condition: 'git cannot report the tree',
      session: keptSession,
      state: sessionStateOf(),
      tree: {
        reason: 'fatal: bad config',
        status: TreeStateStatus.Failed,
      },
    },
  ])('should record nothing when $condition', ({ session, state, tree }) => {
    // Arrange
    const store = heldSessionsOf({
      state,
    });

    // Act
    recordCheck({
      command: 'constitution run check',
      session,
      sessions: createFakeSessionCommandRepository(store),
      workingTree: createFakeWorkingTree({
        state: tree,
      }),
    });

    // Assert
    expect([
      ...(store.get(session)?.marks.keys() ?? []),
    ]).toStrictEqual([]);
  });
});
