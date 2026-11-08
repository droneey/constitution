import { describe, expect, it } from 'bun:test';

import { RuleSlug } from '#/kernel/value-objects';

import { createFakeGateRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { RuleHash } from '../../../../../domain/gate/value-objects';
import { SessionAgent } from '../../../../../domain/session/entities';
import { SessionOrigin } from '../../../../../domain/session-start/entities';
import { HookEventName } from '../../../../../domain/shared/entities';
import { resetReading } from '../reset-reading.use-case';

describe('resetReading', () => {
  it.each([
    {
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Compact,
      read: 0,
    },
    {
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Clear,
      read: 0,
    },
    {
      event: HookEventName.SessionStart,
      origin: SessionOrigin.Resume,
      read: 1,
    },
    {
      event: HookEventName.SubagentStart,
      origin: SessionOrigin.Compact,
      read: 1,
    },
  ])(
    'should leave $read rules read after the $event of origin $origin',
    ({ event, origin, read }) => {
      // Arrange
      const gateRepository = createFakeGateRepository();

      gateRepository.addRulesRead({
        agent: SessionAgent.main,
        definitions: [],
        rules: [
          {
            hash: RuleHash.create('0123456789abcdef'),
            slug: RuleSlug.create('name-reveals-intent'),
          },
        ],
        session: keptSession,
      });

      // Act
      resetReading({
        event,
        gateRepository,
        origin,
        session: keptSession,
      });

      // Assert
      expect(
        gateRepository.rulesRead({
          agent: SessionAgent.main,
          session: keptSession,
        }).rules.size,
      ).toBe(read);
    },
  );
});
