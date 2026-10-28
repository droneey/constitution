import { ConfigReadStatus } from '#/kernel/entities';
import { normalizePath } from '#/kernel/utils';
import { AbsolutePath, BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { Reminder } from '../../../entities';
import { SessionState } from '../../../entities';
import type { AgentId, SessionId } from '../../../value-objects';

interface RemindOfFileInput {
  readonly agent: AgentId | undefined;
  readonly path: string;
  readonly session: SessionId;
  readonly sessions: SessionQueryRepository;
}

/**
 * The blocks that govern a file the agent touched and that the session, or its agent, was not yet
 * reminded of; undefined when the session keeps no rules or the file lies outside its project.
 */
const remindOfFile = (input: RemindOfFileInput): Reminder | undefined => {
  const state = input.sessions.state(input.session);

  if (state?.status !== ConfigReadStatus.Parsed) {
    return undefined;
  }

  const path = AbsolutePath.is(input.path)
    ? RepositoryRelativePath.fromAbsolute(state.repositoryFolderPath, input.path)
    : normalizePath(input.path);

  if (!RepositoryRelativePath.is(path)) {
    return undefined;
  }

  const reminded = input.sessions.reminded({
    agent: input.agent,
    session: input.session,
  });

  return {
    blocks: SessionState.governing(state, path)
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
