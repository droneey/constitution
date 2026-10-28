import type { AbsolutePath } from '#/kernel/value-objects';

interface ExecutablePath {
  readonly find: (name: string) => AbsolutePath | undefined;
  /** what the executable at that path answers to --version; undefined when it answers nothing */
  readonly versionOf: (path: AbsolutePath) => string | undefined;
}

export type { ExecutablePath };
