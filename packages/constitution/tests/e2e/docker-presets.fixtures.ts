import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { miseBinary } from './mise.fixtures';

interface Lint {
  codes: readonly string[];
  exitCode: number | undefined;
}

const hadolintReport = z.array(
  z.object({
    code: z.string(),
  }),
);

const dclintReport = z.array(
  z.object({
    messages: z.array(
      z.object({
        rule: z.string(),
      }),
    ),
  }),
);

const repository = join(import.meta.dir, '..', '..');
const dclint = join(repository, 'node_modules', '.bin', 'dclint');

const dockerUnit = (): string =>
  appliedUnit({
    implementations: [
      'compose',
      'dclint',
      'hadolint',
    ],
    languages: [
      'dockerfile',
      'yaml',
    ],
  });

const hadolint = miseBinary('hadolint');

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
        hadolint,
        [
          '--format',
          'json',
          '--config',
          join(dockerUnit(), '.hadolint.yaml'),
          path,
        ],
        {
          encoding: 'utf8',
        },
      );

      return {
        codes: hadolintReport.parse(JSON.parse(run.stdout)).map(({ code }) => code),
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
        dclint,
        [
          '--formatter',
          'json',
          '--config',
          join(dockerUnit(), '.dclintrc.yaml'),
          path,
        ],
        {
          encoding: 'utf8',
        },
      );

      return {
        codes: dclintReport
          .parse(JSON.parse(run.stdout))
          .flatMap(({ messages }) => messages.map(({ rule }) => rule)),
        exitCode: run.status ?? undefined,
      };
    },
    text,
  });

export { lintCompose, lintDockerfile };
