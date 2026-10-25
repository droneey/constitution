import { describe, expect, it } from 'bun:test';

import { createFakeWorkingTree } from '#/__tests__/working-tree.fake';

import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { SessionMark } from '../../../../entities';
import { SessionId } from '../../../../value-objects';
import { markTurn } from '../mark-turn.use-case';

// The tree's state reads "hello", whose POSIX cksum is 3287646509.
const TREE = 'hello';
const FINGERPRINT = '3287646509';

describe('markTurn', () => {
  it('should record the fingerprint of the tree as the turn when the session keeps its state', () => {
    // Arrange
    const store = createFakeSessionCommandRepository();

    // Act
    markTurn({
      session: keptSession,
      sessions: store.sessions,
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(store.writes.recorded).toStrictEqual([
      {
        mark: SessionMark.Turn,
        session: keptSession,
        value: FINGERPRINT,
      },
    ]);
  });

  it('should record nothing when the session kept no state', () => {
    // Arrange
    const store = createFakeSessionCommandRepository();

    // Act
    markTurn({
      session: SessionId.create('session-2'),
      sessions: store.sessions,
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(store.writes.recorded).toStrictEqual([]);
  });
});
