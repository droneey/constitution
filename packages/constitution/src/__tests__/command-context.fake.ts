import { Command } from 'commander';

import type { CommandContext, CommandPlaces, Report, Task, TaskOutcome } from '#/shared/cli';
import { OUTPUT_FLAGS, outputFlagsOf } from '#/shared/cli';

interface Ran {
  readonly label: string;
  readonly outcome: TaskOutcome;
}

// What a command did through its context: what it wrote to each stream, the steps it ran, the
// reports it printed, and whether it ended the run as failed.
interface CommandRecord {
  readonly failures: number;
  readonly printed: readonly Report[];
  readonly ran: readonly Ran[];
  readonly stderr: string;
  readonly stdout: string;
}

interface FakeContextInput {
  readonly places?: Partial<CommandPlaces>;
  readonly stdin?: string;
}

// The context a command takes from the root, its standard input given, every effect recorded.
const createFakeContext = (
  input: FakeContextInput = {},
): {
  readonly context: CommandContext;
  readonly record: () => CommandRecord;
} => {
  const printed: Report[] = [];
  const ran: Ran[] = [];
  let stderr = '';
  let stdout = '';
  let failures = 0;

  return {
    context: {
      io: {
        readInput: async (): Promise<string> => await Promise.resolve(input.stdin ?? ''),
        write: (text: string): void => {
          stdout += text;
        },
        writeError: (text: string): void => {
          stderr += text;
        },
      },
      places: {
        cwd: '/work/project/package',
        ...input.places,
      },
      renderer: {
        print: async (report: Report): Promise<void> => {
          printed.push(report);
          await Promise.resolve();
        },
        run: async <TResult>(task: Task<TResult>): Promise<TResult> => {
          const returned = await task.run();

          ran.push({
            label: task.label,
            outcome: task.outcomeOf(returned),
          });

          return returned;
        },
      },
      setFailed: (): void => {
        failures += 1;
      },
      helpExamples:
        (examples: readonly string[]): (() => string) =>
        (): string =>
          examples.join('\n'),
    },
    record: (): CommandRecord => ({
      failures,
      printed,
      ran,
      stderr,
      stdout,
    }),
  };
};

interface RunCommandInput {
  readonly args: readonly string[];
  readonly command: Command;
  readonly group?: string;
}

// Runs a command on its argument list as the root runs it: inside a program that takes the output
// flags, whose output goes to the spec's buffers and whose exits are thrown.
const runCommand = async (
  input: RunCommandInput,
): Promise<{
  readonly flags: ReturnType<typeof outputFlagsOf>;
  readonly help: string;
}> => {
  let help = '';
  const program = new Command('constitution').exitOverride().configureOutput({
    writeErr: (text: string): void => {
      help += text;
    },
    writeOut: (text: string): void => {
      help += text;
    },
  });

  for (const flag of OUTPUT_FLAGS) {
    program.option(flag.flags, flag.description);
  }

  const parent = input.group === undefined ? program : new Command(input.group);

  if (parent !== program) {
    parent.copyInheritedSettings(program);
    program.addCommand(parent);
  }

  input.command.copyInheritedSettings(parent);
  parent.addCommand(input.command);
  await program.parseAsync(
    [
      ...(input.group === undefined
        ? []
        : [
            input.group,
          ]),
      input.command.name(),
      ...input.args,
    ],
    {
      from: 'user',
    },
  );

  return {
    flags: outputFlagsOf(program.opts()),
    help,
  };
};

export { createFakeContext, runCommand };
