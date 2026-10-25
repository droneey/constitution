import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { miseBinary } from './mise.fixtures';

const repository = join(import.meta.dir, '..', '..');
const osvScanner = miseBinary('osv-scanner');
const REFUSED = /not recognized as spdx: (?<ids>.+)$/m;
const ACCEPTED = 'cannot retrieve licenses locally';

interface Verdict {
  accepted: boolean;
  refused: readonly string[];
}

const allowlist = readFileSync(
  join(repository, 'presets', 'common', 'osv-scanner', 'foundation', 'core.txt'),
  'utf8',
)
  .trim()
  .split('\n');

// Offline, osv-scanner still validates the list, then stops at the licences it
// would fetch from deps.dev; that stop shows the list was accepted.
const verdictOn = (licences: readonly string[]): Verdict => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-osv-scanner-'));

  try {
    const scanning = spawnSync(
      osvScanner,
      [
        'scan',
        'source',
        '--offline',
        `--licenses=${licences.join(',')}`,
        '.',
      ],
      {
        cwd: folder,
        encoding: 'utf8',
      },
    );

    return {
      accepted: scanning.stderr.includes(ACCEPTED),
      refused: REFUSED.exec(scanning.stderr)?.groups?.ids?.split(',') ?? [],
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export { allowlist, verdictOn };
