import type { BlockId } from '#/kernel/value-objects';

import type { SessionAgent } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { SessionRepository } from '../../../contracts/repositories/commands';

interface RecordRemindersInput {
  readonly agent: SessionAgent;
  readonly ids: readonly BlockId[];
  readonly session: SessionId;
  readonly sessionRepository: SessionRepository;
}

const recordReminders = (input: RecordRemindersInput): void => {
  if (input.ids.length === 0) {
    return;
  }

  input.sessionRepository.addReminded({
    agent: input.agent,
    ids: input.ids,
    session: input.session,
  });
};

export { recordReminders };
