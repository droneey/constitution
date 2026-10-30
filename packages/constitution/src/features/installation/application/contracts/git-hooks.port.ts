import type { AbsolutePath } from '#/kernel/value-objects';

import type { HooksState } from '../../domain/entities';

interface GitHooks {
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => HooksState;
}

export type { GitHooks };
