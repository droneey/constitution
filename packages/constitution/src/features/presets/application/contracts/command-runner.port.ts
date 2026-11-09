import type { CommandRan, CommandToRun } from '../../domain/run-plan/entities';

interface CommandRunner {
  readonly run: (input: CommandToRun) => Promise<CommandRan>;
}

export type { CommandRunner };
