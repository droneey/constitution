import { ConfigReadStatus } from '#/kernel/entities';
import { normalizePath } from '#/kernel/utils';
import { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import type { SessionAgent } from '../../../../domain/entities';
import { Reminder } from '../../../../domain/entities';
import type { SessionId } from '../../../../domain/value-objects';
import type { SessionQueryRepository } from '../../../contracts/repositories/queries';

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

  return Reminder.of({
    path,
    reminded: input.sessions.reminded({
      agent: input.agent,
      session: input.session,
    }),
    state,
  });
};

export { remindOfFile };
