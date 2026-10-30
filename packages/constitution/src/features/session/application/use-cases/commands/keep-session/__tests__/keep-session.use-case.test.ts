import { describe, expect, it } from 'bun:test';

import { AbsolutePath, BlockId } from '#/kernel/value-objects';

import {
  heldSessionsOf,
  keptSession,
  sessionStateOf,
} from '../../../../../__tests__/session.fixtures';
import { createFakeSessionCommandRepository } from '../../../../../__tests__/session-command-repository.fake';
import { SessionAgent } from '../../../../../domain/session/entities';
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
        sessions: createFakeSessionCommandRepository(store),
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

  it.each([
    {
      condition: 'a subagent starts',
      event: HookEventName.SubagentStart,
      state: startedState,
    },
    {
      condition: 'the start gave no state',
      event: HookEventName.SessionStart,
      state: undefined,
    },
  ])('should keep nothing when $condition', ({ event, state }) => {
    // Arrange
    const store = heldSessionsOf(heldBefore);

    // Act
    keepSession({
      event,
      origin: SessionOrigin.Startup,
      session: keptSession,
      sessions: createFakeSessionCommandRepository(store),
      state,
    });

    // Assert
    expect({
      reminded: store.get(keptSession)?.reminded.get(SessionAgent.main),
      state: store.get(keptSession)?.state,
    }).toStrictEqual({
      reminded: new Set([
        BlockId.create('ui'),
      ]),
      state: heldState,
    });
  });
});
