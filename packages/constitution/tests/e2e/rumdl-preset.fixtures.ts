import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

interface Lint {
  codes: readonly string[];
  exitCode: number | undefined;
}

const RUMDL_REPORT = z.array(
  z.object({
    rule: z.string(),
  }),
);

const REPOSITORY = join(import.meta.dir, '..', '..');
const PRESET = join(REPOSITORY, 'presets', 'markdown', 'rumdl', 'foundation', 'core.toml');
const RUMDL = miseBinary('rumdl');

// A project whose .rumdl.toml extends the archive's preset, with its documents.
const inProject = <TResult>(input: {
  files: Readonly<Record<string, string>>;
  run: (folder: string) => TResult;
}): TResult => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-rumdl-'));

  try {
    writeFileSync(join(folder, '.rumdl.toml'), `extends = ${JSON.stringify(PRESET)}\n`);
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
        RUMDL,
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
          ...new Set(RUMDL_REPORT.parse(JSON.parse(run.stdout)).map(({ rule }) => rule)),
        ].toSorted(),
        exitCode: run.status ?? undefined,
      };
    },
  });

export { lintDocuments };
