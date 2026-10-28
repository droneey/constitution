import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';
import { toolEnvironment } from './package.fixtures';

const osvScanner = miseBinary('osv-scanner');
const REFUSED = /not recognized as spdx: (?<ids>.+)$/m;
const ACCEPTED = 'cannot retrieve licenses locally';

interface Verdict {
  accepted: boolean;
  refused: readonly string[];
}

const LICENCES = /--licenses="([^"]+)"/;
const manifest = z.object({
  scripts: z.record(z.string(), z.string()),
});

const licencesOf = (input: { languages: readonly string[]; script: string }): readonly string[] => {
  const listed = LICENCES.exec(
    manifest.parse(
      JSON.parse(
        readFileSync(
          join(
            appliedUnit({
              implementations: [
                'bun',
                'osv-scanner',
              ],
              languages: input.languages,
            }),
            'package.json',
          ),
          'utf8',
        ),
      ),
    ).scripts[input.script] ?? '',
  )?.[1];

  return listed === undefined ? [] : listed.split(',');
};

const allowlist = licencesOf({
  languages: [
    'typescript',
  ],
  script: 'check:audit',
});

const imageLicences = licencesOf({
  languages: [
    'dockerfile',
  ],
  script: 'check:audit-image',
});

// Why: offline, osv-scanner still validates the list, then stops at the licences it would fetch
// from deps.dev; that stop shows the list was accepted.
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
        env: toolEnvironment(),
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

export { allowlist, imageLicences, verdictOn };
