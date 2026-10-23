import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The program a release ships, built once for the specs of a run as the release builds it: a hook
// finds it on its PATH, as mise puts it there.
const REPOSITORY = join(import.meta.dir, '..', '..');

const build = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-cli-'));
  const run = spawnSync(
    'bun',
    [
      'build',
      '--compile',
      join(REPOSITORY, 'src', 'main.ts'),
      '--outfile',
      join(folder, 'constitution'),
    ],
    {
      encoding: 'utf8',
    },
  );

  if (run.status !== 0) {
    throw new Error(`The program does not build: ${run.stderr}`);
  }

  return folder;
};

const CLI_FOLDER = build();
const CLI_PATH = join(CLI_FOLDER, 'constitution');

export { CLI_FOLDER, CLI_PATH };
