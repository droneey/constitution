import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { stringify } from 'smol-toml';
import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import type { Files } from './python-project.fixtures';
import { inPythonProject } from './python-project.fixtures';
import { uvBinary } from './uv.fixtures';

interface Project {
  /** the blocks of the unit beside its language's and ruff */
  blocks: readonly string[];
  source: string;
}

const report = z.array(
  z.object({
    code: z.string().nullable(),
  }),
);

const ruff = uvBinary('ruff');
const MODULE = 'src/shop/orders.py';
const FAILED = 2;

const pyproject = z.object({
  tool: z.object({
    ruff: z.record(z.string(), z.unknown()),
  }),
});
const PROJECT = '[project]\nname = "shop"\nversion = "0.0.0"\nrequires-python = ">=3.14"\n';

const ruffTable = (blocks: readonly string[]): string =>
  stringify({
    tool: {
      ruff: pyproject.parse(
        Bun.TOML.parse(
          readFileSync(
            join(
              appliedUnit({
                implementations: [
                  'ruff',
                  ...blocks,
                ],
                languages: [
                  'python',
                ],
              }),
              'pyproject.toml',
            ),
            'utf8',
          ),
        ),
      ).tool.ruff,
    },
  });

const filesOf = (project: Project): Files => ({
  [MODULE]: project.source,
  'pyproject.toml': `${PROJECT}\n${ruffTable(project.blocks)}\n`,
});

const ruffRun = (input: { args: readonly string[]; project: Project }): SpawnSyncReturns<string> =>
  inPythonProject({
    files: filesOf(input.project),
    run: (folder) => {
      const running = spawnSync(
        ruff,
        [
          ...input.args,
          '--no-cache',
          '.',
        ],
        {
          cwd: folder,
          encoding: 'utf8',
        },
      );

      if (running.status === FAILED) {
        throw new Error(`ruff did not run: ${running.stderr}`);
      }

      return running;
    },
  });

const lintCodes = (project: Project): readonly string[] => {
  const linting = ruffRun({
    args: [
      'check',
      '--output-format',
      'json',
    ],
    project,
  });

  return [
    ...new Set(
      report.parse(JSON.parse(linting.stdout)).flatMap(({ code }) =>
        code === null
          ? []
          : [
              code,
            ],
      ),
    ),
  ].toSorted((left, right) => left.localeCompare(right));
};

const isFormatted = (project: Project): boolean =>
  ruffRun({
    args: [
      'format',
      '--check',
    ],
    project,
  }).status === 0;

export { isFormatted, lintCodes };
