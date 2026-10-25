import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import { heldSessionsOf, keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import type { StopJudgement } from '../../../../entities';
import { SessionMark, StopVerdict } from '../../../../entities';
import { recordJudgement } from '../record-judgement.use-case';

const NOW = '3287646509';
const EARLIER = '1';

// The tree was last reviewed, and the gate last blocked, on an earlier tree.
const heldBefore = {
  marks: [
    {
      mark: SessionMark.Reviewed,
      value: EARLIER,
    },
    {
      mark: SessionMark.Blocked,
      value: EARLIER,
    },
  ],
};

describe('recordJudgement', () => {
  it.each<{
    condition: string;
    judgement: StopJudgement;
    marks: {
      blocked: string;
      reviewed: string;
    };
  }>([
    {
      condition: 'the reviewer finished',
      judgement: {
        fingerprint: NOW,
        verdict: StopVerdict.Reviewed,
      },
      marks: {
        blocked: EARLIER,
        reviewed: NOW,
      },
    },
    {
      condition: 'the gate blocked the hand-back',
      judgement: {
        check: 'bun run check',
        fingerprint: NOW,
        verdict: StopVerdict.Blocked,
      },
      marks: {
        blocked: NOW,
        reviewed: EARLIER,
      },
    },
  ])('should record the tree judged when $condition', ({ judgement, marks }) => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    recordJudgement({
      judgement,
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
    });

    // Assert
    expect({
      blocked: store.get(keptSession)?.marks.get(SessionMark.Blocked),
      reviewed: store.get(keptSession)?.marks.get(SessionMark.Reviewed),
    }).toStrictEqual(marks);
  });

  it('should record nothing when the gate asked for a review', () => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    recordJudgement({
      judgement: {
        blocks: [
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      },
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
    });

    // Assert
    expect({
      blocked: store.get(keptSession)?.marks.get(SessionMark.Blocked),
      reviewed: store.get(keptSession)?.marks.get(SessionMark.Reviewed),
    }).toStrictEqual({
      blocked: EARLIER,
      reviewed: EARLIER,
    });
  });
});
