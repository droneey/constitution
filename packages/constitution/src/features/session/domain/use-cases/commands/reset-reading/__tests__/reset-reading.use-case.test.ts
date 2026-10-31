import { describe, expect, it } from 'bun:test';

import { RuleSlug } from '#/kernel/value-objects';

import { createFakeGateCommandRepository } from '../../../../../__tests__/gate-command-repository.fake';
import { keptSession } from '../../../../../__tests__/session.fixtures';
import { HookEventName, SessionAgent, SessionOrigin } from '../../../../entities';
import { RuleHash } from '../../../../value-objects';
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
      const gates = createFakeGateCommandRepository();

      gates.addRulesRead({
        agent: SessionAgent.main,
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
        gates,
        origin,
        session: keptSession,
      });

      // Assert
      expect(
        gates.rulesRead({
          agent: SessionAgent.main,
          session: keptSession,
        }).size,
      ).toBe(read);
    },
  );
});
