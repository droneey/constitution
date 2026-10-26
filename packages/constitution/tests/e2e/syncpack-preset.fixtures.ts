import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { YAML } from 'bun';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';

interface Manifest {
  dependencies?: Readonly<Record<string, string>>;
  devDependencies?: Readonly<Record<string, string>>;
  name: string;
  peerDependencies?: Readonly<Record<string, string>>;
  version: string;
}

const repository = join(import.meta.dir, '..', '..');
const syncpack = join(repository, 'node_modules', '.bin', 'syncpack');

// A workspace's root of every block whose preset file gives syncpack a group.
const syncpackUnit = (): string =>
  appliedUnit({
    domains: [
      'distribution',
      'workspace',
    ],
    implementations: [
      'bun',
      'syncpack',
    ],
    languages: [
      'json',
      'typescript',
    ],
  });

const CONFIG = '.syncpackrc.yaml';

const workspace = (packages: readonly Manifest[]): Readonly<Record<string, Manifest | object>> => ({
  'package.json': {
    name: 'root',
    private: true,
    version: '1.0.0',
    workspaces: [
      'packages/*',
    ],
  },
  ...Object.fromEntries(
    packages.map((manifest) => [
      `packages/${manifest.name}/package.json`,
      manifest,
    ]),
  ),
});

const versionIssues = (packages: readonly Manifest[]): readonly string[] => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-syncpack-'));

  try {
    for (const [path, manifest] of Object.entries(workspace(packages))) {
      mkdirSync(dirname(join(folder, path)), {
        recursive: true,
      });
      writeFileSync(join(folder, path), JSON.stringify(manifest));
    }

    copyFileSync(join(syncpackUnit(), CONFIG), join(folder, CONFIG));

    const linting = spawnSync(
      syncpack,
      [
        'lint',
      ],
      {
        cwd: folder,
        encoding: 'utf8',
      },
    );

    return [
      ...new Set(
        [
          ...`${linting.stdout}${linting.stderr}`.matchAll(/✘ [^(]*\((\w+)\)/g),
        ].map(([, kind]) => kind ?? ''),
      ),
    ];
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const sortedFields = (): readonly string[] =>
  z
    .object({
      sortAz: z.array(z.string()),
    })
    .parse(YAML.parse(readFileSync(join(syncpackUnit(), CONFIG), 'utf8'))).sortAz;

export { sortedFields, versionIssues };
