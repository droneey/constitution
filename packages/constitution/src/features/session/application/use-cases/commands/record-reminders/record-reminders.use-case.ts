import type { BlockId } from '#/kernel/value-objects';

import type { SessionAgent } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import type { SessionCommandRepository } from '../../../contracts/repositories/commands';

interface RecordRemindersInput {
  readonly agent: SessionAgent;
  readonly ids: readonly BlockId[];
  readonly session: SessionId;
  readonly sessions: SessionCommandRepository;
}

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
