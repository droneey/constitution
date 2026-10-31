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
});
