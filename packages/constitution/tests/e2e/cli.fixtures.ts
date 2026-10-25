import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The program a release ships, built once for the specs of a run as the release builds it: a hook
// finds it on its PATH, as mise puts it there.
const workspace = join(import.meta.dir, '..', '..', '..', '..');
const PROGRAM = 'constitution';
const FAILED = 'failed';
const BUILD_WAIT_MS = 300_000;
const POLL_MS = 100;

/** @throws Error when the program does not build. */
const buildInto = (folder: string): void => {
  const pending = join(folder, `${PROGRAM}.${String(process.pid)}.tmp`);
  const run = spawnSync(
    'bun',
    [
      'run',
      'build:cli',
      '--outfile',
      pending,
    ],
    {
      cwd: workspace,
      encoding: 'utf8',
    },
  );

  if (run.status !== 0) {
    writeFileSync(join(folder, FAILED), run.stderr);

    throw new Error(`The program does not build: ${run.stderr}`);
  }

  renameSync(pending, join(folder, PROGRAM));
};

// The workers of one --parallel run share a folder named by their coordinator, its process id and
// the time it started, which no later run repeats.
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
    },
  ).stdout.trim();

  return started === ''
    ? undefined
    : join(tmpdir(), `constitution-cli-${String(process.ppid)}-${Bun.hash(started).toString(36)}`);
};

/** @throws Error when the worker that builds the program fails or takes past the deadline. */
const awaitBuild = async (input: { deadline: number; folder: string }): Promise<void> => {
  if (existsSync(join(input.folder, PROGRAM))) {
    return;
  }

  if (existsSync(join(input.folder, FAILED))) {
    throw new Error(
      `The program does not build: ${readFileSync(join(input.folder, FAILED), 'utf8')}`,
    );
  }

  if (Date.now() > input.deadline) {
    throw new Error(`No worker built the program into ${input.folder}`);
  }

  await Bun.sleep(POLL_MS);
  await awaitBuild(input);
};

const hasCode = (error: unknown, code: string): boolean =>
  error instanceof Error && 'code' in error && error.code === code;

const remove = (folder: string): void => {
  rmSync(folder, {
    force: true,
    recursive: true,
  });
};

// Signal 0 tests whether the process is there and sends nothing; only ESRCH says it is gone, so a
// folder is kept on any other answer.
const isRunning = (pid: number): boolean => {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    return !hasCode(error, 'ESRCH');
  }
};

// A shared folder outlives its run, so the next run removes those of coordinators that have exited.
const removeFinishedRuns = (): void => {
  for (const name of readdirSync(tmpdir())) {
    const coordinator = /^constitution-cli-(\d+)-/.exec(name)?.[1];

    if (coordinator !== undefined && !isRunning(Number(coordinator))) {
      remove(join(tmpdir(), name));
    }
  }
};

// Only the first worker to ask makes the folder.
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

// The worker that claims the shared folder builds into it; the others wait for its build.
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
    await awaitBuild({
      deadline: Date.now() + BUILD_WAIT_MS,
      folder: shared,
    });
  }

  return shared;
};

const cliFolder = await build();
const cliPath = join(cliFolder, PROGRAM);

export { cliFolder, cliPath };
