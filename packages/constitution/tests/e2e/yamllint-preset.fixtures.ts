import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';

import { miseBinary } from './mise.fixtures';
import { toolEnvironment } from './package.fixtures';
import { loadOf, widestAppliedUnit } from './preset-load.fixtures';

interface Lint {
  readonly rules: readonly string[];
  readonly status: number;
}

const yamllint = miseBinary('yamllint');

const lintedFiles = (files: Readonly<Record<string, string>>): readonly string[] =>
  spawnSync(
    yamllint,
    [
      '--list-files',
      '.',
    ],
    {
      cwd: widestAppliedUnit('yamllint', {
        blocks: [
          'version-control',
        ],
        files,
      }),
      encoding: 'utf8',
      env: toolEnvironment(),
    },
  )
    .stdout.split('\n')
    .filter((line) => line !== '')
    .map((line) => relative('.', line))
    .toSorted((left, right) => left.localeCompare(right));

interface LintedFile {
  readonly path: string;
  readonly text?: string;
}

const RULE_ID = /\(([a-z-]+)\)$/;

const lintFile = async (input: LintedFile): Promise<Lint> => {
  const { output, status } = await loadOf('yamllint', {
    command: [
      yamllint,
      '--strict',
      '--format',
      'parsable',
      input.path,
    ],
    ...(input.text === undefined
      ? {}
      : {
          files: {
            [input.path]: input.text,
          },
        }),
  });

  return {
    rules: output.map((line) => RULE_ID.exec(line)?.[1] ?? line),
    status,
  };
};

export { lintedFiles, lintFile };
