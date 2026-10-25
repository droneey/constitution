import type { BlockId } from '#/kernel/value-objects';

import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { AgentId, SessionId } from '../../../value-objects';

interface RecordRemindersInput {
  readonly agent: AgentId | undefined;
  readonly ids: readonly BlockId[];
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
}

/**
 * Records the blocks a reminder named to the session, or to its agent, so none is named twice;
 * records nothing when none was named.
 */
const recordReminders = (input: RecordRemindersInput): void => {
  if (input.ids.length === 0) {
    return;
  }

  input.sessions.addReminded({
    agent: input.agent,
    ids: input.ids,
    session: input.session,
  });
};

export { recordReminders };
