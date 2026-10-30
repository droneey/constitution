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
import { SessionMark } from '../../../../../domain/entities';
import { SessionId } from '../../../../../domain/value-objects';
import { TreeStateStatus } from '../../../../contracts';
import { markTurn } from '../mark-turn.use-case';

const TREE = 'tree-now';

describe('markTurn', () => {
  it('should record the fingerprint of the tree as the turn when the session keeps its state', () => {
    // Arrange
    const store = heldSessionsOf();

    // Act
    markTurn({
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(store.get(keptSession)?.marks.get(SessionMark.Turn)).toBe(TREE);
  });

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
  ])('should record no turn when $condition', ({ session, state, tree }) => {
    // Arrange
    const store = heldSessionsOf({
      state,
    });

    // Act
    markTurn({
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
