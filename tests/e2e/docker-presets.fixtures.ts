import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import { miseBinary } from './mise.fixtures';

interface Lint {
  codes: readonly string[];
  exitCode: number | undefined;
}

const HADOLINT_REPORT = z.array(
  z.object({
    code: z.string(),
  }),
);

const DCLINT_REPORT = z.array(
  z.object({
    messages: z.array(
      z.object({
        rule: z.string(),
      }),
    ),
  }),
);

const REPOSITORY = join(import.meta.dir, '..', '..');
const PRESETS = join(REPOSITORY, 'presets');
const DCLINT = join(REPOSITORY, 'node_modules', '.bin', 'dclint');
const HADOLINT = miseBinary('hadolint');

const inFolder = <TResult>(input: {
  file: string;
  run: (path: string) => TResult;
  text: string;
}): TResult => {
  const folder = mkdtempSync(join(tmpdir(), 'constitution-docker-'));
  const path = join(folder, input.file);

  try {
    writeFileSync(path, input.text);

    return input.run(path);
  } finally {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
};

const lintDockerfile = (text: string): Lint =>
  inFolder({
    file: 'Dockerfile',
    run: (path: string): Lint => {
      const run = spawnSync(
        HADOLINT,
        [
          '--format',
          'json',
          '--config',
          join(PRESETS, 'common', 'hadolint', 'foundation', 'docker.yaml'),
          path,
        ],
        {
          encoding: 'utf8',
        },
      );

      return {
        codes: HADOLINT_REPORT.parse(JSON.parse(run.stdout)).map(
          ({ code }) => code,
        ),
        exitCode: run.status ?? undefined,
      };
    },
    text,
  });

const lintCompose = (text: string): Lint =>
  inFolder({
    file: 'compose.yaml',
    run: (path: string): Lint => {
      const run = spawnSync(
        DCLINT,
        [
          '--formatter',
          'json',
          '--config',
          join(PRESETS, 'common', 'dclint', 'foundation', 'docker.yaml'),
          path,
        ],
        {
          encoding: 'utf8',
        },
      );

      return {
        codes: DCLINT_REPORT.parse(JSON.parse(run.stdout)).flatMap(
          ({ messages }) => messages.map(({ rule }) => rule),
        ),
        exitCode: run.status ?? undefined,
      };
    },
    text,
  });

export { lintCompose, lintDockerfile };
