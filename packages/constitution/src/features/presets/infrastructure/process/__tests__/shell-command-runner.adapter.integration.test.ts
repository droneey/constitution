import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

import { createShellCommandRunner } from '../shell-command-runner.adapter';

let folder = '';

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), 'command-runner-'));
});

afterEach(() => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
});

const SYSTEM_PATH = '/usr/bin:/bin';
const ESCAPE = '\u001B';
const pathOnly = Object.fromEntries([
  [
    'PATH',
    SYSTEM_PATH,
  ],
]);

const outputsOf = (
  given: Partial<
    Pick<Parameters<typeof createShellCommandRunner>[0], 'environment' | 'isColoured'>
  > = {},
): Parameters<typeof createShellCommandRunner>[0] & {
  readonly written: () => {
    readonly stderr: string;
    readonly stdout: string;
  };
} => {
  const stderr = new PassThrough();
  const stdout = new PassThrough();

  return {
    environment: given.environment ?? pathOnly,
    isColoured: given.isColoured ?? ((): boolean => false),
    stderr,
    stdout,
    written: () => ({
      stderr: String(stderr.read() ?? ''),
      stdout: String(stdout.read() ?? ''),
    }),
  };
};

describe('createShellCommandRunner', () => {
  it('should run the command through the shell in the folder and give its exit code', async () => {
    // Act
    const ran = await createShellCommandRunner(outputsOf()).run({
      command: 'pwd > where.txt && exit 3',
      folderPath: AbsolutePath.create(folder),
    });

    // Assert
    expect({
      code: ran.code,
      where: readFileSync(join(folder, 'where.txt'), 'utf8')
        .trim()
        .endsWith(folder.split('/').at(-1) ?? ''),
    }).toStrictEqual({
      code: 3,
      where: true,
    });
  });

  it('should pass what the command writes to each output on, and give it all as its output', async () => {
    // Arrange
    const outputs = outputsOf();

    // Act
    const ran = await createShellCommandRunner(outputs).run({
      command: 'echo out && echo err >&2',
      folderPath: AbsolutePath.create(folder),
    });

    // Assert
    expect({
      output: ran.output.split('\n').toSorted(),
      written: outputs.written(),
    }).toStrictEqual({
      output: [
        '',
        'err',
        'out',
      ],
      written: {
        stderr: 'err\n',
        stdout: 'out\n',
      },
    });
  });

  it.each([
    {
      command: 'kill -TERM $$',
      condition: 'a signal ends it',
      folderPath: () => folder,
    },
    {
      command: 'echo never',
      condition: 'it cannot start',
      folderPath: () => join(folder, 'missing'),
    },
  ])('should count a command as failed with no output when $condition', async (given) => {
    // Act
    const ran = await createShellCommandRunner(outputsOf()).run({
      command: given.command,
      folderPath: AbsolutePath.create(given.folderPath()),
    });

    // Assert
    expect(ran).toStrictEqual({
      code: 1,
      output: '',
    });
  });

  it.each([
    {
      condition: 'it prints in colour',
      isColoured: true,
      variables: '1 1 unset',
    },
    {
      condition: 'it prints without colour',
      isColoured: false,
      variables: 'unset unset 1',
    },
  ])('should hand each command the colour choice of the program when $condition', async (given) => {
    // Arrange
    const outputs = outputsOf({
      environment: Object.fromEntries([
        [
          'CLICOLOR_FORCE',
          '0',
        ],
        [
          'FORCE_COLOR',
          '3',
        ],
        [
          'NO_COLOR',
          '',
        ],
        [
          'PATH',
          SYSTEM_PATH,
        ],
      ]),
      isColoured: (): boolean => given.isColoured,
    });

    // Act
    const ran = await createShellCommandRunner(outputs).run({
      command:
        'printf "%s %s %s" "${FORCE_COLOR-unset}" "${CLICOLOR_FORCE-unset}" "${NO_COLOR-unset}"',
      folderPath: AbsolutePath.create(folder),
    });

    // Assert
    expect(ran.output).toBe(given.variables);
  });

  it('should pass the colours a command prints on, and give its output without them', async () => {
    // Arrange
    const outputs = outputsOf();

    // Act
    const ran = await createShellCommandRunner(outputs).run({
      command: `printf '${ESCAPE}[1;91mF401${ESCAPE}[0m'`,
      folderPath: AbsolutePath.create(folder),
    });

    // Assert
    expect({
      output: ran.output,
      written: outputs.written().stdout,
    }).toStrictEqual({
      output: 'F401',
      written: `${ESCAPE}[1;91mF401${ESCAPE}[0m`,
    });
  });
});
