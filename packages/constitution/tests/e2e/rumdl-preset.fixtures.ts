import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';

interface Lint {
  codes: readonly string[];
  exitCode: number | undefined;
}

const rumdlReport = z.array(
  z.object({
    rule: z.string(),
  }),
);

const rumdl = miseBinary('rumdl');

const inProject = <TResult>(input: {
  files: Readonly<Record<string, string>>;
  run: (folder: string) => TResult;
}): TResult => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-rumdl-'));

  try {
    copyFileSync(
      join(
        appliedUnit({
          implementations: [
            'rumdl',
          ],
          languages: [
            'markdown',
          ],
        }),
        '.rumdl.toml',
      ),
      join(folder, '.rumdl.toml'),
    );

    for (const [path, text] of Object.entries(input.files)) {
      mkdirSync(dirname(join(folder, path)), {
        recursive: true,
      });
      writeFileSync(join(folder, path), text);
    }

    return input.run(folder);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const lintDocuments = (files: Readonly<Record<string, string>>): Lint =>
  inProject({
    files,
    run: (folder: string): Lint => {
      const run = spawnSync(
        rumdl,
        [
          'check',
          '--output-format',
          'json',
          '.',
        ],
        {
          cwd: folder,
          encoding: 'utf8',
        },
      );

      return {
        codes: [
          ...new Set(rumdlReport.parse(JSON.parse(run.stdout)).map(({ rule }) => rule)),
        ].toSorted((left, right) => left.localeCompare(right)),
        exitCode: run.status ?? undefined,
      };
    },
  });

export { lintDocuments };
