import type { SpawnSyncReturns } from 'node:child_process';
import { spawnSync } from 'node:child_process';

import { z } from 'zod';

import type { Files } from './python-project.fixtures';
import { inPythonProject } from './python-project.fixtures';
import { uvBinary } from './uv.fixtures';

interface Project {
  // the part the project extends, the last of the chain it takes
  part: string;
  source: string;
}

const REPORT = z.array(
  z.object({
    code: z.string().nullable(),
  }),
);

const RUFF = uvBinary('ruff');
const MODULE = 'src/shop/orders.py';
const FAILED = 2;

// The chain, each part extending the one before.
const CHAIN = [
  'self',
  'core',
  'python',
];

const filesOf = (project: Project): Files => ({
  [MODULE]: project.source,
  'pyproject.toml': `[project]\nname = "shop"\nversion = "0.0.0"\nrequires-python = ">=3.14"\n\n[tool.ruff]\nextend = ".droneey/constitution/presets/python/ruff/foundation/${project.part}.toml"\n`,
});

const ruffRun = (input: { args: readonly string[]; project: Project }): SpawnSyncReturns<string> =>
  inPythonProject({
    files: filesOf(input.project),
    run: (folder) => {
      const running = spawnSync(
        RUFF,
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
      REPORT.parse(JSON.parse(linting.stdout)).flatMap(({ code }) =>
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

export { CHAIN, isFormatted, lintCodes };
