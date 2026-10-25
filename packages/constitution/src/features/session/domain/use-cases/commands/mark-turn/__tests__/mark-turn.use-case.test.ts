import { describe, expect, it } from 'bun:test';

import { createFakeWorkingTree } from '#/__tests__/working-tree.fake';

import { heldSessionsOf, keptSession } from '../../../../../__tests__/session.fixtures';
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
    expect(store.get(keptSession)?.marks.get(SessionMark.Turn)).toBe(FINGERPRINT);
  });

  it('should record nothing when the session kept no state', () => {
    // Arrange
    const store = heldSessionsOf();
    const session = SessionId.create('session-2');

    // Act
    markTurn({
      session,
      sessions: createFakeSessionCommandRepository(store),
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect(store.get(session)).toBeUndefined();
  });
});
