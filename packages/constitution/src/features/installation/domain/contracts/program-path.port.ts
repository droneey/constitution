interface ProgramPath {
  readonly find: (name: string) => string | undefined;
  /** what the program at that path answers to --version; undefined when it answers nothing */
  readonly versionOf: (path: string) => string | undefined;
}

export type { ProgramPath };
