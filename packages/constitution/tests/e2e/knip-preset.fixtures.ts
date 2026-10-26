import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';

interface Project {
  /** the blocks of the unit beside its language's and knip */
  blocks?: readonly string[];
  files: Readonly<Record<string, string>>;
  production?: boolean;
  scripts?: Readonly<Record<string, string>>;
}

interface Unused {
  binaries: readonly string[];
  exports: readonly string[];
  files: readonly string[];
}

const report = z.object({
  issues: z.array(
    z.object({
      binaries: z.array(
        z.object({
          name: z.string(),
        }),
      ),
      exports: z.array(
        z.object({
          name: z.string(),
        }),
      ),
      file: z.string(),
      files: z.array(z.unknown()),
    }),
  ),
});

const configOf = (blocks: readonly string[]): string =>
  readFileSync(
    join(
      appliedUnit({
        implementations: [
          'knip',
          ...blocks,
        ],
        languages: [
          'typescript',
        ],
      }),
      'knip.jsonc',
    ),
    'utf8',
  );

const repository = join(import.meta.dir, '..', '..');
const knip = join(repository, 'node_modules', '.bin', 'knip');

const unusedCode = (project: Project): Unused => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-knip-'));

  try {
    const files = {
      ...project.files,
      'knip.jsonc': configOf(project.blocks ?? []),
      'package.json': JSON.stringify({
        name: 'fixture',
        scripts: {
          test: 'bun test',
          ...project.scripts,
        },
        type: 'module',
      }),
    };

    for (const [path, text] of Object.entries(files)) {
      mkdirSync(dirname(join(folder, path)), {
        recursive: true,
      });
      writeFileSync(join(folder, path), text);
    }

    const running = spawnSync(
      knip,
      [
        '--reporter',
        'json',
        '--no-config-hints',
        ...(project.production
          ? [
              '--production',
            ]
          : []),
      ],
      {
        cwd: folder,
        encoding: 'utf8',
      },
    );

    const { issues } = report.parse(JSON.parse(running.stdout));

    return {
      binaries: issues.flatMap(({ binaries }) => binaries.map(({ name }) => name)),
      exports: issues.flatMap(({ exports }) => exports.map(({ name }) => name)),
      files: issues.filter(({ files: unused }) => unused.length > 0).map(({ file }) => file),
    };
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

export { unusedCode };
