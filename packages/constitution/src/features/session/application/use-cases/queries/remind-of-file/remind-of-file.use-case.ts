import { ConfigReadStatus } from '#/kernel/entities';
import { normalizePath } from '#/kernel/utils';
import { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';

import { Reminder } from '../../../../domain/reminder/entities';
import type { SessionAgent } from '../../../../domain/session/entities';
import type { SessionId } from '../../../../domain/session/value-objects';
import type { WorkingTree } from '../../../contracts';
import { IgnoreStatus } from '../../../contracts';
import type { SessionQueries } from '../../../contracts/repositories/queries';

interface RemindOfFileInput {
  readonly agent: SessionAgent;
  readonly path: string;
  readonly session: SessionId;
  readonly sessionQueries: SessionQueries;
  readonly workingTree: WorkingTree;
}

const remindOfFile = (input: RemindOfFileInput): Reminder | undefined => {
  const state = input.sessionQueries.state(input.session);

  if (state?.status !== ConfigReadStatus.Parsed) {
    return;
  }

  const path = AbsolutePath.is(input.path)
    ? RepositoryRelativePath.fromAbsolute(state.repositoryFolderPath, input.path)
    : normalizePath(input.path);

  if (!RepositoryRelativePath.is(path)) {
    return;
  }

  const filePath = AbsolutePath.join(state.repositoryFolderPath, path);
  const told = input.workingTree.ignoredAmong({
    paths: [
      filePath,
    ],
    repositoryFolderPath: state.repositoryFolderPath,
  });

  if (told.status === IgnoreStatus.Told && told.paths.has(filePath)) {
    return;
  }

  return Reminder.of({
    path,
    reminded: input.sessionQueries.reminded({
      agent: input.agent,
      session: input.session,
    }),
    state,
  });
};

export { remindOfFile };
