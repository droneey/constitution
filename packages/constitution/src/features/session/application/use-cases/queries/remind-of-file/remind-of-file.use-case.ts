import { ConfigReadStatus } from '#/kernel/entities';
import { normalizePath } from '#/kernel/utils';
import { AbsolutePath, BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import type { SessionQueryRepository } from '../../../contracts/repositories/queries';
import type { Reminder, SessionAgent } from '../../../../domain/entities';
import { SessionState } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';

interface RemindOfFileInput {
  readonly agent: SessionAgent;
  readonly path: string;
  readonly session: SessionId;
  readonly sessions: SessionQueryRepository;
}

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
        musts: state.mustsBesideCore.filter((must) => BlockId.equals(must.block, block.id)),
      })),
    path,
  };
};

export { remindOfFile };
