import { describe, expect, it } from 'bun:test';

import { heldSessionsOf, keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionRepository } from '../../../../../__tests__/session-command-repository.fake';
import { createFakeWorkingTree } from '../../../../../__tests__/working-tree.fake';
import { SessionMark } from '../../../../../domain/session/entities';
import { markReviewStart } from '../mark-review-start.use-case';

const TREE = 'tree-now';

describe('markReviewStart', () => {
  it.each<{
    agentType: string;
    condition: string;
    marks: readonly SessionMark[];
  }>([
    {
      agentType: 'constitution:reviewer',
      condition: 'the reviewer starts',
      marks: [
        SessionMark.ReviewStarted,
      ],
    },
    {
      agentType: 'Explore',
      condition: 'another agent starts',
      marks: [],
    },
  ])('should mark the tree the review started on only when $condition', ({ agentType, marks }) => {
    // Arrange
    const store = heldSessionsOf();

    // Act
    markReviewStart({
      agentType,
      session: keptSession,
      sessionRepository: createFakeSessionRepository(store),
      workingTree: createFakeWorkingTree({
        state: TREE,
      }),
    });

    // Assert
    expect([
      ...(store.get(keptSession)?.marks.entries() ?? []),
    ]).toStrictEqual(
      marks.map((mark) => [
        mark,
        TREE,
      ]),
    );
  });
});
