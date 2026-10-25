import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The program a release ships, built once for the specs of a run as the release builds it: a hook
// finds it on its PATH, as mise puts it there.
const workspace = join(import.meta.dir, '..', '..', '..', '..');

const build = (): string => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-cli-'));
  const run = spawnSync(
    'bun',
    [
      'run',
      'build:cli',
      '--outfile',
      join(folder, 'constitution'),
    ],
    {
      cwd: workspace,
      encoding: 'utf8',
    },
  );

  if (run.status !== 0) {
    throw new Error(`The program does not build: ${run.stderr}`);
  }

  return folder;
};

const cliFolder = build();
const cliPath = join(cliFolder, 'constitution');

export { cliFolder, cliPath };
