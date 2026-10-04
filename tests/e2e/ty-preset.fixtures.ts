import { spawnSync } from 'node:child_process';

import { inPythonProject } from './python-project.fixtures';
import { uvBinary } from './uv.fixtures';

interface CheckOutcome {
  isClean: boolean;
  rules: readonly string[];
}

const TY = uvBinary('ty');
const PART = '.droneey/constitution/presets/python/ty/foundation/self.toml';
const FAILED = 2;
const FINDING = /^[^:\n]+:\d+:\d+: (?:error|warning)\[(?<rule>[a-z-]+)\]/gm;

// A project with no [tool.ty] of its own takes its version from
// requires-python, as a project under the part's --config-file does.
const PYPROJECT =
  '[project]\nname = "shop"\nversion = "0.0.0"\nrequires-python = ">=3.14"\n';

const typeCheck = (source: string): CheckOutcome =>
  inPythonProject({
    files: {
      'pyproject.toml': PYPROJECT,
      'src/shop/orders.py': source,
    },
    run: (folder) => {
      const checking = spawnSync(
        TY,
        [
          'check',
          '--config-file',
          PART,
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
