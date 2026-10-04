import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { describe, expect, test } from 'bun:test';

import type { DryRunOptions, MutantRunResult, TestRunner } from '@stryker-mutator/api/test-runner';
import { DryRunStatus, MutantRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';

import bunTest from '../../../../presets/typescript/stryker/foundation/bun-test.mjs';
import { strykerPlugins } from '../runner.ts';

type Files = Readonly<Record<string, string>>;

const ACTIVE = "process.env['__STRYKER_ACTIVE_MUTANT__']";

// The mutant `1` drops the rate; any other mutant leaves the code as it was.
const PROJECT: Files = {
  'bunfig.mutation.toml': '[test]\nroot = "."\npathIgnorePatterns = ["tests/e2e/**"]\n',
  'node_modules/shop/__tests__/rate.test.ts': `import { expect, test } from 'bun:test';\nimport { RATE } from '../../../src/rate.ts';\n\ntest('should keep the rate', () => {\n  expect(${ACTIVE}).toBeUndefined();\n  expect(RATE).toBe(0.5);\n});\n`,
  'src/__tests__/other.test.ts': `import { expect, test } from 'bun:test';\n\ntest('should run with no mutant', () => {\n  expect(${ACTIVE}).toBeUndefined();\n});\n`,
  'src/__tests__/total.test.ts': `import { expect, test } from 'bun:test';\nimport { total } from '../total.ts';\n\ntest('should add the rate', () => {\n  expect(total(2)).toBe(3);\n});\n`,
  'src/__tests__/wait.test.ts': `import { test } from 'bun:test';\nimport { wait } from '../wait.ts';\n\ntest('should wait', () => wait(), 60_000);\n`,
  'src/data.json': '{}\n',
  'src/lonely.ts': 'export const lonely = 1;\n',
  'src/rate.ts': `import data from './data.json';\n\nexport const RATE = ${ACTIVE} === '1' ? Object.keys(data).length : 0.5;\n`,
  'src/total.ts':
    "import { RATE } from './rate.ts';\n\nexport const total = (price: number): number => price + price * RATE;\n",
  'src/wait.ts': `export const wait = (): Promise<void> => Bun.sleep(${ACTIVE} === '9' ? 60_000 : 0);\n`,
  'tests/e2e/total.e2e.test.ts': `import { expect, test } from 'bun:test';\nimport { total } from '../../src/total.ts';\n\ntest('should run with no mutant', () => {\n  expect(${ACTIVE}).toBeUndefined();\n  expect(total(2)).toBe(3);\n});\n`,
};

const [plugin] = strykerPlugins;

const DRY_RUN: DryRunOptions = {
  coverageAnalysis: 'off',
  disableBail: false,
  timeout: 60_000,
};

const inProject = async <T>(
  files: Files,
  act: (runner: TestRunner, folder: string) => Promise<T>,
): Promise<T> => {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), 'mutation-check-runner-')));
  const home = process.cwd();

  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(folder, path)), {
      recursive: true,
    });
    writeFileSync(join(folder, path), text);
  }

  process.chdir(folder);

  try {
    const runner = plugin.factory();

    await runner.init?.();

    return await act(runner, folder);
  } finally {
    process.chdir(home);
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const mutantRun = (input: {
  file: string;
  folder: string;
  id: string;
  runner: TestRunner;
}): Promise<MutantRunResult> =>
  input.runner.mutantRun({
    activeMutant: {
      fileName: join(input.folder, input.file),
      id: input.id,
      location: {
        end: {
          column: 1,
          line: 1,
        },
        start: {
          column: 0,
          line: 1,
        },
      },
      mutatorName: 'ConditionalExpression',
      replacement: 'true',
    },
    disableBail: false,
    mutantActivation: 'runtime',
    reloadEnvironment: true,
    sandboxFileName: join(input.folder, input.file),
    timeout: 60_000,
  });

describe('the specs runner', () => {
  test('should register under the name the preset gives Stryker', () => {
    expect(plugin.name).toBe(bunTest.testRunner);
  });

  test('should ask for a new process for each run', () => {
    expect(plugin.factory().capabilities()).toStrictEqual({
      reloadEnvironment: true,
    });
  });

  test('should complete the dry run when every spec passes', async () => {
    expect(await inProject(PROJECT, (runner) => runner.dryRun(DRY_RUN))).toStrictEqual({
      status: DryRunStatus.Complete,
      tests: [
        {
          id: 'all',
          name: 'All specs',
          status: TestStatus.Success,
          timeSpentMs: 0,
        },
      ],
    });
  });

  test('should report the failure when a spec fails in the dry run', async () => {
    expect(
      await inProject(
        {
          ...PROJECT,
          'src/__tests__/total.test.ts':
            "import { test } from 'bun:test';\n\ntest('should fail', () => {\n  throw new Error('broken');\n});\n",
        },
        (runner) => runner.dryRun(DRY_RUN),
      ),
    ).toStrictEqual({
      errorMessage: expect.stringContaining('broken'),
      status: DryRunStatus.Error,
    });
  });

  test('should kill a mutant when a spec that loads its file fails', async () => {
    expect(
      await inProject(PROJECT, (runner, folder) =>
        mutantRun({
          file: 'src/rate.ts',
          folder,
          id: '1',
          runner,
        }),
      ),
    ).toStrictEqual({
      failureMessage: expect.stringContaining('should add the rate'),
      killedBy: [
        'src/__tests__/total.test.ts',
      ],
      nrOfTests: 1,
      status: MutantRunStatus.Killed,
    });
  });

  test('should let a mutant survive when the specs that load its file pass, whatever the others do', async () => {
    expect(
      await inProject(PROJECT, (runner, folder) =>
        mutantRun({
          file: 'src/rate.ts',
          folder,
          id: '2',
          runner,
        }),
      ),
    ).toStrictEqual({
      nrOfTests: 1,
      status: MutantRunStatus.Survived,
    });
  });

  test('should let a mutant survive when no spec loads its file', async () => {
    expect(
      await inProject(PROJECT, (runner, folder) =>
        mutantRun({
          file: 'src/lonely.ts',
          folder,
          id: '1',
          runner,
        }),
      ),
    ).toStrictEqual({
      nrOfTests: 0,
      status: MutantRunStatus.Survived,
    });
  });

  test('should take the specs from the project root when the configuration names none', async () => {
    expect(
      await inProject(
        {
          ...PROJECT,
          'bunfig.mutation.toml': '[run]\nbun = true\n',
        },
        (runner, folder) =>
          mutantRun({
            file: 'src/total.ts',
            folder,
            id: '2',
            runner,
          }),
      ),
    ).toHaveProperty('status', MutantRunStatus.Killed);
  });

  test('should stop the running specs when Stryker disposes of the runner', async () => {
    const started = performance.now();
    const stopped = await inProject(PROJECT, (runner, folder) => {
      const running = mutantRun({
        file: 'src/wait.ts',
        folder,
        id: '9',
        runner,
      });

      return (runner.dispose?.() ?? Promise.resolve()).then(() => running);
    });

    expect(stopped.status).toBe(MutantRunStatus.Killed);
    expect(performance.now() - started).toBeLessThan(10_000);
  });
});
