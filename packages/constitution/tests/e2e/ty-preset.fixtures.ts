import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { stringify } from 'smol-toml';
import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { inPythonProject } from './python-project.fixtures';
import { uvBinary, uvEnvironment } from './uv.fixtures';

interface CheckOutcome {
  isClean: boolean;
  rules: readonly string[];
}

const ty = uvBinary('ty');
const FAILED = 2;
const FINDING = /^[^:\n]+:\d+:\d+: (?:error|warning)\[(?<rule>[a-z-]+)\]/gm;

// A project takes the [tool.ty] the presets give a unit of Python, its version from
// requires-python, and resolves its imports in the repository's environment, which holds pydantic.
const PYPROJECT = '[project]\nname = "shop"\nversion = "0.0.0"\nrequires-python = ">=3.14"\n';

const pyproject = z.object({
  tool: z
    .object({
      ty: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

const tyTable = (): string => {
  const applied = pyproject.parse(
    Bun.TOML.parse(
      readFileSync(
        join(
          appliedUnit({
            implementations: [
              'ty',
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
  );

  return stringify({
    tool: {
      ty: applied.tool?.ty ?? {},
    },
  });
};

const typeCheck = (source: string): CheckOutcome =>
  inPythonProject({
    files: {
      'pyproject.toml': `${PYPROJECT}\n${tyTable()}\n`,
      'src/shop/orders.py': source,
    },
    run: (folder) => {
      const checking = spawnSync(
        ty,
        [
          'check',
          '--python',
          uvEnvironment,
          '--output-format',
          'concise',
        ],
        {
          cwd: folder,
          encoding: 'utf8',
        },
      );

      if (checking.status === FAILED) {
        throw new Error(`ty did not run: ${checking.stderr}`);
      }

      return {
        isClean: checking.status === 0,
        rules: [
          ...new Set(
            [
              ...checking.stdout.matchAll(FINDING),
            ].map((match) => match.groups?.['rule'] ?? ''),
          ),
        ].toSorted((left, right) => left.localeCompare(right)),
      };
    },
  });

export { typeCheck };
