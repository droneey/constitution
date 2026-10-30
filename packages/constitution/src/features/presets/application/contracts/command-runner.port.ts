import type { CommandToRun } from '../../domain/entities';

interface CommandRunner {
  readonly run: (input: CommandToRun) => number;
}

export type { CommandRunner };
