import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { describe, expect, test } from 'bun:test';

interface Check {
  changes: Readonly<Record<string, string>>;
  config?: Readonly<Record<string, string>>;
  mainline?: Readonly<Record<string, string>>;
  mode?: 'all';
  // A workspace's other files, committed with the unit's before the change.
  neighbours?: Readonly<Record<string, string>>;
  unit?: string;
}

interface Outcome {
  output: string;
  strykerArguments: string | undefined;
}

const MAIN = resolve(import.meta.dirname, '../main.ts');

const SOURCE = {
  'src/order.utils.ts': 'export const total = 1;\nexport const count = 2;\n',
};

const CONFIG = {
  'stryker.config.mjs': "export default { mutate: ['src/**/*.ts', '!src/**/__tests__/**'] };\n",
};

const CHANGE = {
  'src/order.utils.ts': 'export const total = 1;\nexport const count = 3;\n',
};

const git = (input: { args: readonly string[]; folder: string }): void => {
  spawnSync('git', input.args, {
    cwd: input.folder,
  });
};

const commit = (folder: string): void => {
  git({
    args: [
      'add',
      '.',
    ],
    folder,
  });
  git({
    args: [
      '-c',
      'user.name=test',
      '-c',
      'user.email=test@example.com',
      'commit',
      '--quiet',
      '--no-verify',
      '-m',
      'change',
    ],
    folder,
  });
};

const moveMainOn = (input: { files: Readonly<Record<string, string>>; folder: string }): void => {
  writeFiles(input);
  commit(input.folder);
  git({
    args: [
      'update-ref',
      'refs/remotes/origin/main',
      'HEAD',
    ],
    folder: input.folder,
  });
  git({
    args: [
      'reset',
      '--quiet',
      '--hard',
      'HEAD~1',
    ],
    folder: input.folder,
  });
};

const writeFiles = (input: { files: Readonly<Record<string, string>>; folder: string }): void => {
  for (const [path, text] of Object.entries(input.files)) {
    mkdirSync(dirname(join(input.folder, path)), {
      recursive: true,
    });
    writeFileSync(join(input.folder, path), text);
  }
};

const runCheck = (check: Check): Outcome => {
  const folder = mkdtempSync(join(tmpdir(), 'devkit-mutation-check-'));
  const unit = join(folder, check.unit ?? '');
  const bin = join(folder, '.bin');

  writeFiles({
    files: {
      ...SOURCE,
      ...(check.config ?? CONFIG),
    },
    folder: unit,
  });
  writeFiles({
    files: check.neighbours ?? {},
    folder,
  });
  git({
    args: [
      'init',
      '--quiet',
    ],
    folder,
  });
  commit(folder);
  git({
    args: [
      'update-ref',
      'refs/remotes/origin/main',
      'HEAD',
    ],
    folder,
  });

  if (check.mainline !== undefined) {
    moveMainOn({
      files: check.mainline,
      folder,
    });
  }

  writeFiles({
    files: check.changes,
    folder: unit,
  });
  mkdirSync(bin);
  writeFileSync(join(bin, 'stryker'), '#!/bin/sh\nprintf "%s " "$@" > "$PWD/.stryker-arguments"\n');
  chmodSync(join(bin, 'stryker'), 0o755);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
  };

  env['PATH'] = `${bin}:${process.env['PATH'] ?? ''}`;

  const running = spawnSync(
    'bun',
    [
      MAIN,
      ...(check.mode === undefined
        ? []
        : [
            check.mode,
          ]),
    ],
    {
      cwd: unit,
      encoding: 'utf8',
      env,
    },
  );
  const recorded = join(unit, '.stryker-arguments');
  const strykerArguments = existsSync(recorded) ? readFileSync(recorded, 'utf8').trim() : undefined;

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return {
    output: running.stdout,
    strykerArguments,
  };
};

describe('mutation-check', () => {
  test('should mutate the changed line and the new file when a change touches both', () => {
    // Arrange
    const check = {
      changes: {
        'src/line.utils.ts': 'export const line = 1;\n',
        'src/order.utils.ts': 'export const total = 1;\nexport const count = 3;\n',
      },
    };

    // Act
    const { strykerArguments } = runCheck(check);

    // Assert
    expect(strykerArguments).toBe('run --mutate src/line.utils.ts,src/order.utils.ts:2-2');
  });

  test("should mutate only the branch's lines when the main line moved on after the branch began", () => {
    // Arrange
    const check = {
      changes: CHANGE,
      mainline: {
        'src/order.utils.ts': 'export const total = 5;\nexport const count = 2;\n',
      },
    };

    // Act
    const { strykerArguments } = runCheck(check);

    // Assert
    expect(strykerArguments).toBe('run --mutate src/order.utils.ts:2-2');
  });

  test('should mutate the changed line when the configuration is JSON', () => {
    // Arrange
    const check = {
      changes: CHANGE,
      config: {
        'stryker.config.json': '{ "mutate": ["src/**/*.ts"] }\n',
      },
    };

    // Act
    const { strykerArguments } = runCheck(check);

    // Assert
    expect(strykerArguments).toBe('run --mutate src/order.utils.ts:2-2');
  });

  test.each([
    {
      condition: 'names no patterns',
      config: 'export default {};\n',
    },
    {
      condition: 'names a pattern that is not text',
      config: "export default { mutate: ['src/**/*.ts', 1] };\n",
    },
    {
      condition: 'exports nothing by default',
      config: 'export const mutate = [];\n',
    },
  ])('should run no mutant when the configuration $condition', ({ config }) => {
    // Arrange
    const check = {
      changes: CHANGE,
      config: {
        'stryker.config.mjs': config,
      },
    };

    // Act
    const { strykerArguments } = runCheck(check);

    // Assert
    expect(strykerArguments).toBeUndefined();
  });

  test('should run no mutant when a change only reformats a mutated file', () => {
    // Arrange
    const check = {
      changes: {
        'src/order.utils.ts': 'export const total = 1;\n\nexport const count = 2;\n',
      },
    };

    // Act
    const { strykerArguments } = runCheck(check);

    // Assert
    expect(strykerArguments).toBeUndefined();
  });

  test('should run no mutant when no mutated line changed', () => {
    // Arrange
    const check = {
      changes: {
        'src/__tests__/helpers.ts': 'export const helper = 1;\n',
      },
    };

    // Act
    const outcome = runCheck(check);

    // Assert
    expect(outcome).toStrictEqual({
      output: 'mutation: no line to mutate changed\n',
      strykerArguments: undefined,
    });
  });

  test("should mutate the unit's changed line when the check runs from a unit of a workspace", () => {
    // Arrange
    const check = {
      changes: {
        ...CHANGE,
        '../web/src/order.utils.ts': 'export const total = 4;\n',
      },
      neighbours: {
        'packages/web/src/order.utils.ts': 'export const total = 1;\n',
      },
      unit: 'packages/api',
    };

    // Act
    const { strykerArguments } = runCheck(check);

    // Assert
    expect(strykerArguments).toBe('run --mutate src/order.utils.ts:2-2');
  });

  test('should run no mutant when a change only reformats a file of the unit the check runs from', () => {
    // Arrange
    const check = {
      changes: {
        'src/order.utils.ts': 'export const total = 1;\n\nexport const count = 2;\n',
      },
      unit: 'packages/api',
    };

    // Act
    const outcome = runCheck(check);

    // Assert
    expect(outcome).toStrictEqual({
      output: 'mutation: no line to mutate changed\n',
      strykerArguments: undefined,
    });
  });

  test('should mutate everything the configuration names when the check runs in all mode', () => {
    // Arrange
    const check = {
      changes: {},
      mode: 'all' as const,
    };

    // Act
    const { strykerArguments } = runCheck(check);

    // Assert
    expect(strykerArguments).toBe('run');
  });
});
