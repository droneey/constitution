import { withoutDotSlash } from '#/kernel/utils';
import { BlockId } from '#/kernel/value-objects';

import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { Reminder } from '../../../entities';
import type { AgentId, SessionId } from '../../../value-objects';
import { governingOf } from '../shared/governing';

/**
 * The blocks that govern a file the agent touched and that the session, or its agent, was not yet
 * reminded of; undefined when the session keeps no state or the file lies outside its project.
 */
const remindOfFile = (input: {
  agent: AgentId | undefined;
  path: string;
  session: SessionId;
  sessions: SessionQueryRepository;
}): Reminder | undefined => {
  const state = input.sessions.state(input.session);

  if (state === undefined) {
    return undefined;
  }

  const isOutside = input.path.startsWith('/') && !input.path.startsWith(`${state.project}/`);

  if (isOutside) {
    return undefined;
  }

  const relative = input.path.startsWith('/')
    ? input.path.slice(state.project.length + 1)
    : input.path;
  const path = withoutDotSlash(relative);
  const reminded = input.sessions.reminded({
    agent: input.agent,
    session: input.session,
  });

  return {
    blocks: governingOf({
      active: state.active,
      path,
    })
      .filter((block) => !reminded.has(block.id))
      .map((block) => ({
        files: block.files,
        id: block.id,
        musts: state.musts.filter((must) => BlockId.equals(must.block, block.id)),
      })),
    path,
  };
};

export { remindOfFile };
