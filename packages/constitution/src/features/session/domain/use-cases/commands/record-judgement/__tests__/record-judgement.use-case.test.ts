import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import { keptSession } from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import type { StopJudgement } from '../../../../entities';
import { SessionMark, StopVerdict } from '../../../../entities';
import { recordJudgement } from '../record-judgement.use-case';

const NOW = '3287646509';

describe('recordJudgement', () => {
  it.each<{
    condition: string;
    judgement: StopJudgement;
    mark: SessionMark;
  }>([
    {
      condition: 'the reviewer finished',
      judgement: {
        fingerprint: NOW,
        verdict: StopVerdict.Reviewed,
      },
      mark: SessionMark.Reviewed,
    },
    {
      condition: 'the gate blocked the hand-back',
      judgement: {
        check: 'bun run check',
        fingerprint: NOW,
        verdict: StopVerdict.Blocked,
      },
      mark: SessionMark.Blocked,
    },
  ])('should record the tree judged when $condition', ({ judgement, mark }) => {
    // Arrange
    const store = createFakeSessionCommandRepository();

    // Act
    recordJudgement({
      judgement,
      session: keptSession,
      sessions: store.sessions,
    });

    // Assert
    expect(store.writes.recorded).toStrictEqual([
      {
        mark,
        session: keptSession,
        value: NOW,
      },
    ]);
  });

  it('should record nothing when the gate asked for a review', () => {
    // Arrange
    const store = createFakeSessionCommandRepository();

    // Act
    recordJudgement({
      judgement: {
        blocks: [
          BlockId.create('ui'),
        ],
        verdict: StopVerdict.Review,
      },
      session: keptSession,
      sessions: store.sessions,
    });

    // Assert
    expect(store.writes.recorded).toStrictEqual([]);
  });
});
