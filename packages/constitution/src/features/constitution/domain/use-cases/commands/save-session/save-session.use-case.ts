import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { SessionState } from '../../../entities';
import { isPlainName } from '../../../utils';

// Keeps what a session's later hooks read; a session that resumes keeps what it was reminded of.
const saveSession = (input: {
  isReminderKept: boolean;
  session: string;
  sessions: SessionCommandRepository;
  state: SessionState;
}): void => {
  if (isPlainName(input.session)) {
    input.sessions.saveState({
      isReminderKept: input.isReminderKept,
      session: input.session,
      state: input.state,
    });
  }
};

export { saveSession };
