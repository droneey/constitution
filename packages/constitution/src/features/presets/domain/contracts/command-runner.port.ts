interface CommandToRun {
  readonly command: string;
  /** absolute */
  readonly folder: string;
}

/** Gives the command's exit code; its output is the user's. */
interface CommandRunner {
  readonly run: (input: CommandToRun) => number;
}

export type { CommandRunner, CommandToRun };
