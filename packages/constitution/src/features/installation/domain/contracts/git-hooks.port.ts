import type { AbsolutePath } from '#/kernel/value-objects';

import type { HooksState } from '../entities';

interface GitHooks {
  readonly stateOf: (repositoryFolderPath: AbsolutePath) => HooksState;
}

export type { GitHooks };
