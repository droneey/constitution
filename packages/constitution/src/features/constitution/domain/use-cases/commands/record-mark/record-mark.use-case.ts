import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import type { SessionMark } from '../../../entities';
import { isPlainName } from '../../../utils';

// Records the fingerprint of the tree at one of the session's marks.
const recordMark = (input: {
  mark: SessionMark;
  session: string;
  sessions: SessionCommandRepository;
  value: string;
}): void => {
  if (isPlainName(input.session)) {
    input.sessions.recordMark({
      mark: input.mark,
      session: input.session,
      value: input.value,
    });
  }
};

export { recordMark };
