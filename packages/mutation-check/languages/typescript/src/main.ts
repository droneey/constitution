#!/usr/bin/env -S bun --no-env-file
import { GitError } from '#/libs/git';
import { ConfigurationError, ExitCode, runMutationCheck } from '#/root';

// What git and Stryker need of the environment; no other variable reaches them.
const CHILD_VARIABLES = [
  'HOME',
  'PATH',
  'TMPDIR',
] as const;

const env = Object.fromEntries(
  CHILD_VARIABLES.flatMap((name) => {
    const setting = process.env[name];

    return setting === undefined
      ? []
      : [
          [
            name,
            setting,
          ],
        ];
  }),
);

const failureOf = (error: unknown): string => {
  if (error instanceof GitError) {
    return `${error.message}; fetch origin/main, and run the check inside the repository`;
  }

  if (error instanceof ConfigurationError) {
    return error.message;
  }

  return `the check stopped on an error of its own, ${String(error)}; report it`;
};

try {
  process.exitCode = await runMutationCheck({
    args: process.argv.slice(2),
    env,
    folder: process.cwd(),
    write: (text) => {
      process.stdout.write(text);
    },
  });
} catch (error) {
  process.stderr.write(`mutation: ${failureOf(error)}\n`);
  process.exitCode = ExitCode.Stopped;
}
