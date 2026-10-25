import type { HooksState } from '../entities';

interface GitHooks {
  readonly stateOf: (project: string) => HooksState;
}

export type { GitHooks };
