import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createFakeActiveRulesSource } from '../../../../../__tests__/active-rules-source.fake';
import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import type { SweepStaleSessionsInput } from '../../../../contracts/repositories/commands';
import { sweepStaleSessions } from '../sweep-stale-sessions.use-case';

describe('sweepStaleSessions', () => {
  it.each<{
    condition: string;
    searchFrom: string;
    swept: readonly SweepStaleSessionsInput[];
  }>([
    {
      condition: 'the session starts in a project, sweeping that project',
      searchFrom: '/work/project/src',
      swept: [
        {
          projectFolderPath: AbsolutePath.create('/work/project'),
          session: keptSession,
        },
      ],
    },
    {
      condition: 'the session starts in no project, sweeping nothing',
      searchFrom: '/tmp',
      swept: [],
    },
  ])('should sweep the stale sessions when $condition', ({ searchFrom, swept }) => {
    // Arrange
    const sweeps: SweepStaleSessionsInput[] = [];
    const gates = {
      ...createFakeGateCommandRepository(),
      sweepStaleSessions: (asked: SweepStaleSessionsInput): void => {
        sweeps.push(asked);
      },
    };

    // Act
    sweepStaleSessions({
      gates,
      searchFrom: AbsolutePath.create(searchFrom),
      session: keptSession,
      source: createFakeActiveRulesSource(),
    });

    // Assert
    expect<readonly SweepStaleSessionsInput[]>(sweeps).toStrictEqual(swept);
  });
});
