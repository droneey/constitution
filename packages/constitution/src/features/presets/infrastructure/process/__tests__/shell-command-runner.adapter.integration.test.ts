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

const outputsOf = (): Parameters<typeof createShellCommandRunner>[0] & {
  readonly written: () => {
    readonly stderr: string;
    readonly stdout: string;
  };
} => {
  const stderr = new PassThrough();
  const stdout = new PassThrough();

  return {
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
});
