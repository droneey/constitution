import type { CommandToRun } from '../entities';

/** Gives the command's exit code; its output is the user's. */
interface CommandRunner {
  readonly run: (input: CommandToRun) => number;
}

export type { CommandRunner };
