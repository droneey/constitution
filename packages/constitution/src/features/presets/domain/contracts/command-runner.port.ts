import type { CommandToRun } from '../entities';

interface CommandRunner {
  readonly run: (input: CommandToRun) => number;
}

export type { CommandRunner };
