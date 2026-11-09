import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
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

// Why: a script that runs a shell script the release ships gives its scan's flags there.
const commandTextIn = (input: { command: string; unit: string }): string => {
  const program = join(input.unit, input.command.split(' ')[0] ?? '');

  return existsSync(program) ? readFileSync(program, 'utf8') : input.command;
};

const licencesOf = (input: { languages: readonly string[]; script: string }): readonly string[] => {
  const unit = appliedUnit({
    implementations: [
      'js-runtime/bun',
      'osv-scanner',
    ],
    languages: input.languages,
  });
  const listed = LICENCES.exec(
    commandTextIn({
      command:
        manifest.parse(JSON.parse(readFileSync(join(unit, 'package.json'), 'utf8'))).scripts[
          input.script
        ] ?? '',
      unit,
    }),
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
