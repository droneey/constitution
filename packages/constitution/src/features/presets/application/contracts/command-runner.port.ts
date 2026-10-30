import type { CommandToRun } from '../../domain/run-plan/entities';

interface CommandRunner {
  readonly run: (input: CommandToRun) => number;
}

export type { CommandRunner };
