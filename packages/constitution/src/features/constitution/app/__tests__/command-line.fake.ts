import type { CLI } from '@bunli/core';
import { createCLI } from '@bunli/core';

import type { CommandPlaces, CommandRun } from '../types';

type TerminalDeps = NonNullable<Parameters<typeof createCLI>[1]>;
type PromptSession = ReturnType<NonNullable<TerminalDeps['createPromptSession']>>;

// A command that prompts fails its spec: no command of the program asks.
const refusePrompt = (): never => {
  throw new Error('A command prompted: no command of the program asks');
};

const promptSession: PromptSession = {
  dispose: async (): Promise<void> => {
    await Promise.resolve();
  },
  initialize: async (): Promise<void> => {
    await Promise.resolve();
  },
  prompt: Object.assign(refusePrompt, {
    cancel: refusePrompt,
    confirm: refusePrompt,
    filter: refusePrompt,
    group: refusePrompt,
    intro: refusePrompt,
    isCancel: (_candidate: unknown): _candidate is never => false,
    log: {
      error: refusePrompt,
      info: refusePrompt,
      message: refusePrompt,
      step: refusePrompt,
      success: refusePrompt,
      warn: refusePrompt,
    },
    multiselect: refusePrompt,
    note: refusePrompt,
    outro: refusePrompt,
    pager: refusePrompt,
    password: refusePrompt,
    select: refusePrompt,
    spinner: refusePrompt,
    text: refusePrompt,
  }),
  spinner: refusePrompt,
};

// A terminal that is no TTY, as the hooks and a pipeline run the program.
const TERMINAL: TerminalDeps = {
  createPromptSession: (): PromptSession => promptSession,
  getTerminalInfo: () => ({
    height: 24,
    // biome-ignore lint/style/useNamingConvention: bunli names the field isCI
    isCI: true,
    isInteractive: false,
    supportsColor: false,
    supportsMouse: false,
    width: 80,
  }),
};

// The program with the one command, over the fake terminal.
const commandLineOf = async (command: Parameters<CLI['command']>[0]): Promise<CLI> => {
  const cli = await createCLI(
    {
      description: 'The command under its spec',
      name: 'constitution',
      version: '0.0.0',
    },
    TERMINAL,
  );

  cli.command(command);

  return cli;
};

// What a command did through its run: what it wrote to each stream, the prefixes its work ran
// under, and how many times it ended the run as failed.
interface CommandRecord {
  readonly errors: readonly string[];
  readonly failures: number;
  readonly prefixes: readonly string[];
  readonly written: readonly string[];
}

// The run a command takes from the root, its standard input given, every effect recorded.
const createFakeCommandRun = (
  input: { places?: Partial<CommandPlaces>; stdin?: string } = {},
): {
  readonly record: () => CommandRecord;
  readonly run: CommandRun;
} => {
  const errors: string[] = [];
  const prefixes: string[] = [];
  const written: string[] = [];
  let failures = 0;

  return {
    record: (): CommandRecord => ({
      errors,
      failures,
      prefixes,
      written,
    }),
    run: {
      io: {
        readInput: async (): Promise<string> => await Promise.resolve(input.stdin ?? ''),
        write: (text: string): void => {
          written.push(text);
        },
        writeError: (text: string): void => {
          errors.push(text);
        },
      },
      places: {
        cwd: '/work/package',
        projectDir: '',
        ...input.places,
      },
      run: async (command): Promise<void> => {
        prefixes.push(command.prefix);
        await command.work();
      },
      setFailed: (): void => {
        failures += 1;
      },
    },
  };
};

export { commandLineOf, createFakeCommandRun };
