import { projectCheck } from '#/kernel/constants';

/** A command line, as the shell runs it. */
type ShellCommand = string;

const COMMAND_SEPARATOR = /&&|;/;
const RUNNERS: readonly string[] = [
  'bun run ',
  'bunx ',
  'npx ',
  'mise exec -- ',
] as const;

const withoutRunner = (step: string): string => {
  const runner = RUNNERS.find((prefix) => step.startsWith(prefix));

  return runner === undefined ? step : step.slice(runner.length);
};

/** Whether a step of the command, past its runner, is the project's check. */
const runsCheck = (command: ShellCommand): boolean =>
  command.split(COMMAND_SEPARATOR).some((part) => {
    const step = withoutRunner(part.trim());

    return step === projectCheck || step.startsWith(`${projectCheck} `);
  });

const ShellCommand = {
  runsCheck,
} as const;

export { ShellCommand };
