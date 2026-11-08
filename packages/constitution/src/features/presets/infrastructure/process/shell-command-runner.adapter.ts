import { spawn } from 'node:child_process';

import type { CommandRunner } from '../../application/contracts';
import type { CommandRan } from '../../domain/run-plan/entities';

interface CommandOutputs {
  readonly stderr: NodeJS.WritableStream;
  readonly stdout: NodeJS.WritableStream;
}

const SHELL = 'sh';
const NO_CODE = 1;

const createShellCommandRunner = (outputs: CommandOutputs): CommandRunner => ({
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

      child.stdout.on('data', passTo(outputs.stdout));
      child.stderr.on('data', passTo(outputs.stderr));
      child.once('error', () => {
        resolve({
          code: NO_CODE,
          output: '',
        });
      });
      child.once('close', (code: number | null) => {
        resolve({
          code: code ?? NO_CODE,
          output: Buffer.concat(chunks).toString(),
        });
      });
    }),
});

export { createShellCommandRunner };
