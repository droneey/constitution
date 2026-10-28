import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';

import { miseBinary } from './mise.fixtures';
import { toolEnvironment } from './package.fixtures';
import { loadOf, widestAppliedUnit } from './preset-load.fixtures';

interface Lint {
  /** the ids of the rules the file breaks, in the order yamllint reports them */
  readonly rules: readonly string[];
  readonly status: number;
}

const yamllint = miseBinary('yamllint');

/**
 * The files yamllint reads in the widest unit that holds the files and follows version control,
 * whose agents' worktrees git ignores, by their paths from it.
 */
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
  /** written into the unit before it is applied; the file the apply writes where absent */
  readonly text?: string;
}

// yamllint's parsable format closes each finding with its rule's id in brackets.
const RULE_ID = /\(([a-z-]+)\)$/;

/** yamllint's strict run over one file of the widest unit, which holds it. */
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
