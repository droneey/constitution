import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  watch,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { toolEnvironment } from './package.fixtures';

const packageFolder = join(import.meta.dir, '..', '..');
const EXECUTABLE = 'constitution';
const FAILED = 'failed';
const BUILD_WAIT_MS = 300_000;
const BUILD_SCRIPT = 'build';

const buildInto = (folder: string): void => {
  const pending = join(folder, `${EXECUTABLE}.${String(process.pid)}.tmp`);
  const run = spawnSync(
    'bun',
    [
      'run',
      BUILD_SCRIPT,
      '--outfile',
      pending,
    ],
    {
      cwd: packageFolder,
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  );

  if (run.status !== 0) {
    writeFileSync(join(folder, FAILED), run.stderr);

    throw new Error(`The executable does not build: ${run.stderr}`);
  }

  renameSync(pending, join(folder, EXECUTABLE));
};

const sharedFolder = (): string | undefined => {
  if (process.env['BUN_TEST_WORKER_ID'] === undefined) {
    return undefined;
  }

  const started = spawnSync(
    'ps',
    [
      '-o',
      'lstart=',
      '-p',
      String(process.ppid),
    ],
    {
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  ).stdout.trim();

  return started === ''
    ? undefined
    : join(tmpdir(), `constitution-cli-${String(process.ppid)}-${Bun.hash(started).toString(36)}`);
};

const isBuilt = (folder: string): boolean => {
  if (existsSync(join(folder, EXECUTABLE))) {
    return true;
  }

  if (existsSync(join(folder, FAILED))) {
    throw new Error(`The executable does not build: ${readFileSync(join(folder, FAILED), 'utf8')}`);
  }

  return false;
};

// Why: the folder is watched before it is first looked at, so a build that ends between the two is
// still seen; the building worker renames the executable into it, or writes the failure there.
const awaitBuild = (folder: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const watcher = watch(folder);

    const settle = (error?: unknown): void => {
      clearTimeout(deadline);
      watcher.close();

      if (error === undefined) {
        resolve();
      } else {
        reject(error);
      }
    };

    const look = (): void => {
      try {
        if (isBuilt(folder)) {
          settle();
        }
      } catch (error) {
        settle(error);
      }
    };

    const deadline = setTimeout(() => {
      settle(new Error(`No worker built the executable into ${folder}`));
    }, BUILD_WAIT_MS);

    watcher.on('change', look);
    watcher.on('error', settle);
    look();
  });

const hasCode = (error: unknown, code: string): boolean =>
  error instanceof Error && 'code' in error && error.code === code;

const remove = (folder: string): void => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
};

// Why: signal 0 tests whether the process is there and sends nothing; only ESRCH says it is gone,
// so a folder is kept on any other answer.
const isRunning = (pid: number): boolean => {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    return !hasCode(error, 'ESRCH');
  }
};

const removeFinishedRuns = (): void => {
  for (const name of readdirSync(tmpdir())) {
    const coordinator = /^constitution-cli-(\d+)-/.exec(name)?.[1];

    if (coordinator !== undefined && !isRunning(Number(coordinator))) {
      remove(join(tmpdir(), name));
    }
  }
};

const claims = (folder: string): boolean => {
  try {
    mkdirSync(folder);

    return true;
  } catch (error) {
    if (hasCode(error, 'EEXIST')) {
      return false;
    }

    throw error;
  }
};

const build = async (): Promise<string> => {
  const shared = sharedFolder();

  if (shared === undefined) {
    const folder = mkdtempSync(join(tmpdir(), 'constitution-cli-'));

    process.once('exit', () => {
      remove(folder);
    });
    buildInto(folder);

    return folder;
  }

  if (claims(shared)) {
    removeFinishedRuns();
    buildInto(shared);
  } else {
    await awaitBuild(shared);
  }

  return shared;
};

const cliFolder = await build();
const cliPath = join(cliFolder, EXECUTABLE);

export { cliFolder, cliPath };
