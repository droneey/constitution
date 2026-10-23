import type { SessionCommandRepository } from '../../../contracts/repositories/commands';
import { isPlainName } from '../../../utils';

// Adds the blocks a reminder named to the list of the session, or of its agent, so none is named twice.
const addReminded = (input: {
  agent: string;
  ids: readonly string[];
  session: string;
  sessions: SessionCommandRepository;
}): void => {
  if (
    input.ids.length > 0 &&
    isPlainName(input.session) &&
    (input.agent === '' || isPlainName(input.agent))
  ) {
    input.sessions.addReminded({
      agent: input.agent === '' ? undefined : input.agent,
      ids: input.ids,
      session: input.session,
    });
  }
};

export { addReminded };
