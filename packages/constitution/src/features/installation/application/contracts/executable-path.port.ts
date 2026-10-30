import type { AbsolutePath } from '#/kernel/value-objects';

interface ExecutablePath {
  readonly find: (name: string) => AbsolutePath | undefined;
  readonly versionOf: (path: AbsolutePath) => string | undefined;
}

export type { ExecutablePath };
