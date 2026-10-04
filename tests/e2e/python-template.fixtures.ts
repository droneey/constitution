import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';

import type { Files } from './python-project.fixtures';
import { inPythonProject, REPOSITORY } from './python-project.fixtures';
import { ENVIRONMENT, uvBinary } from './uv.fixtures';

const POE = uvBinary('poe');
const TEMPLATE = join(
  REPOSITORY,
  'templates',
  'project',
  'python',
  'pyproject.toml',
);

// The template's tasks run the tools of the project's environment, which here
// is the repository's own, holding the same pinned tools.
const checkTemplate = (files: Files): boolean =>
  inPythonProject({
    files: {
      ...files,
      'pyproject.toml': readFileSync(TEMPLATE, 'utf8').replace(
        '<name>',
        'shop',
      ),
    },
    run: (folder) =>
      spawnSync(
        POE,
        [
          '--executor',
          'simple',
          'check',
        ],
        {
          cwd: folder,
          encoding: 'utf8',
          env: Object.fromEntries([
            ...Object.entries(process.env),
            [
              'PATH',
              `${join(ENVIRONMENT, 'bin')}${delimiter}${process.env['PATH'] ?? ''}`,
            ],
          ]),
        },
      ).status === 0,
  });

export { checkTemplate };
