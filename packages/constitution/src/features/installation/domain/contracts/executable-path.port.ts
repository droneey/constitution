interface ExecutablePath {
  readonly find: (name: string) => string | undefined;
  /** what the executable at that path answers to --version; undefined when it answers nothing */
  readonly versionOf: (path: string) => string | undefined;
}

export type { ExecutablePath };
