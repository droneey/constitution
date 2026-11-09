import { spawn } from 'node:child_process';
import { stripVTControlCharacters } from 'node:util';

import type { CommandRunner } from '../../application/contracts';
import type { CommandRan } from '../../domain/run-plan/entities';

type Environment = Readonly<Record<string, string | undefined>>;

interface ShellCommandRunnerInput {
  readonly environment: Environment;
  readonly isColoured: () => boolean;
  readonly stderr: NodeJS.WritableStream;
  readonly stdout: NodeJS.WritableStream;
}

const SHELL = 'sh';
const NO_CODE = 1;

// Why: a tool writing into a pipe prints no colour unless forced, and tools disagree on the
// variable that forces it, some reading only one of the two.
const forcingVariables: readonly string[] = [
  'CLICOLOR_FORCE',
  'FORCE_COLOR',
];
const NO_COLOUR_VARIABLE = 'NO_COLOR';
const colourVariables: ReadonlySet<string> = new Set([
  ...forcingVariables,
  NO_COLOUR_VARIABLE,
]);
const SET = '1';

const environmentOf = (input: ShellCommandRunnerInput): Environment => {
  const chosen = input.isColoured()
    ? forcingVariables
    : [
        NO_COLOUR_VARIABLE,
      ];

  return Object.fromEntries([
    ...Object.entries(input.environment).filter(([name]) => !colourVariables.has(name)),
    ...chosen.map((name) => [
      name,
      SET,
    ]),
  ]);
};

const createShellCommandRunner = (input: ShellCommandRunnerInput): CommandRunner => ({
  run: ({ command, folderPath }) =>
    new Promise<CommandRan>((resolve) => {
      const chunks: Buffer[] = [];
      const child = spawn(
        SHELL,
        [
          '-c',
          command,
        ],
        {
          cwd: folderPath,
          env: environmentOf(input),
          // Stryker disable next-line ArrayDeclaration: the command reads the user's terminal, which no spec feeds, and its outputs are piped either way
          stdio: [
            'inherit',
            'pipe',
            'pipe',
          ],
        },
      );

      const passTo =
        (output: NodeJS.WritableStream) =>
        (chunk: Buffer): void => {
          chunks.push(chunk);
          output.write(chunk);
        };

      child.stdout.on('data', passTo(input.stdout));
      child.stderr.on('data', passTo(input.stderr));
      child.once('error', () => {
        resolve({
          code: NO_CODE,
          output: '',
        });
      });
      child.once('close', (code: number | null) => {
        resolve({
          code: code ?? NO_CODE,
          output: stripVTControlCharacters(Buffer.concat(chunks).toString()),
        });
      });
    }),
});

export { createShellCommandRunner };
