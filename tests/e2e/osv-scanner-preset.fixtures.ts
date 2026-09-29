import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

const REPORT = z.object({
  results: z.array(
    z.object({
      packages: z.array(
        z.object({
          // biome-ignore lint/style/useNamingConvention: osv-scanner names the field license_violations
          license_violations: z.array(z.string()).optional(),
          package: z.object({
            name: z.string(),
          }),
        }),
      ),
    }),
  ),
});

const REPOSITORY = join(import.meta.dir, '..', '..');
const OSV_SCANNER = miseBinary('osv-scanner');

const ALLOWLIST = readFileSync(
  join(REPOSITORY, 'presets', 'osv-scanner', 'foundation', 'core.txt'),
  'utf8',
)
  .trim()
  .split('\n')
  .join(',');

const licenceViolations = (
  packages: Readonly<Record<string, string>>,
): readonly string[] => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-osv-scanner-'));

  writeFileSync(
    join(folder, 'package-lock.json'),
    JSON.stringify({
      lockfileVersion: 3,
      name: 'fixture',
      packages: {
        '': {
          dependencies: packages,
          name: 'fixture',
        },
        ...Object.fromEntries(
          Object.entries(packages).map(([name, version]) => [
            `node_modules/${name}`,
            {
              version,
            },
          ]),
        ),
      },
      requires: true,
    }),
  );

  const scanning = spawnSync(
    OSV_SCANNER,
    [
      'scan',
      'source',
      `--licenses=${ALLOWLIST}`,
      '--format',
      'json',
      '.',
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  rmSync(folder, {
    force: true,
    recursive: true,
  });

  return REPORT.parse(JSON.parse(scanning.stdout)).results.flatMap(
    ({ packages: scanned }) =>
      scanned
        .filter(({ license_violations: found }) => (found ?? []).length > 0)
        .map(({ package: { name } }) => name),
  );
};

export { licenceViolations };
