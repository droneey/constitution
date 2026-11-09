import { describe, expect, it } from 'bun:test';

import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import {
  heldSessionsOf,
  keptSession,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionRepository } from '../../../../../__tests__/session-command-repository.fake';
import { SessionAgent, SessionMark } from '../../../../../domain/session/entities';
import { SessionOrigin } from '../../../../../domain/session-start/entities';
import { HookEventName } from '../../../../../domain/shared/entities';
import { keepSession } from '../keep-session.use-case';

const heldState = sessionStateOf();
const startedState = sessionStateOf({
  repositoryFolderPath: AbsolutePath.create('/work/started'),
});

const heldBefore = {
  reminded: [
    {
      ids: [
        'ui',
      ],
    },
  ],
  state: heldState,
};

describe('keepSession', () => {
  it.each([
    {
      condition: 'a session starts up',
      origin: SessionOrigin.Startup,
      reminded: undefined,
    },
    {
      condition: 'a session resumes',
      origin: SessionOrigin.Resume,
      reminded: new Set([
        BlockId.create('ui'),
      ]),
    },
  ])(
    'should keep the state, and what was reminded only on a resume, when $condition',
    ({ origin, reminded }) => {
      // Arrange
      const store = heldSessionsOf(heldBefore);

      // Act
      keepSession({
        event: HookEventName.SessionStart,
        origin,
        session: keptSession,
        sessionRepository: createFakeSessionRepository(store),
        state: startedState,
      });

      // Assert
      expect({
        reminded: store.get(keptSession)?.reminded.get(SessionAgent.main),
        state: store.get(keptSession)?.state,
      }).toStrictEqual({
        reminded,
        state: startedState,
      });
    },
  );

  it('should keep nothing when a subagent starts', () => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    keepSession({
      event: HookEventName.SubagentStart,
      origin: SessionOrigin.Startup,
      session: keptSession,
      sessionRepository: createFakeSessionRepository(store),
      state: startedState,
    });

    // Assert
    expect({
      isStarted: store.get(keptSession)?.marks.has(SessionMark.Started),
      reminded: store.get(keptSession)?.reminded.get(SessionAgent.main),
      state: store.get(keptSession)?.state,
    }).toStrictEqual({
      isStarted: false,
      reminded: new Set([
        BlockId.create('ui'),
      ]),
      state: heldState,
    });
  });

  it('should record the start and keep no state when the start gave none', () => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    keepSession({
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Startup,
      session: keptSession,
      sessionRepository: createFakeSessionRepository(store),
      state: undefined,
    });

    // Assert
    expect({
      isStarted: store.get(keptSession)?.marks.has(SessionMark.Started),
      state: store.get(keptSession)?.state,
    }).toStrictEqual({
      isStarted: true,
      state: heldState,
    });
  });
});
