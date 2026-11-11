import { readFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';

import { z } from 'zod';

import { writeFiles } from './package.fixtures';
import { linesOf, runTool, widestAppliedUnit } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

interface Lint {
  readonly broken: readonly string[];
  readonly reported: readonly string[];
  readonly status: number;
}

const BROKEN = /^(\S+) BROKEN$/;
const REPORTED = /^(\S+\.py:\d+): /;
const ORDERS = 'src/unit/features/orders';

const architectureTask = z.object({
  tool: z.object({
    poe: z.object({
      tasks: z.object({
        'check:architecture': z.object({
          env: z.object({
            // biome-ignore lint/style/useNamingConvention: Python names the variable PYTHONPATH
            PYTHONPATH: z.string(),
          }),
        }),
      }),
    }),
  }),
});

const feature: Readonly<Record<string, string>> = {
  'src/unit/features/__init__.py': '',
  [`${ORDERS}/__init__.py`]: 'from .presentation import orders_cli as orders_cli\n',
  [`${ORDERS}/infrastructure/__init__.py`]: '',
  [`${ORDERS}/infrastructure/memory_store.py`]:
    'class MemoryStore:\n  def size(self) -> int:\n    return 0\n',
  [`${ORDERS}/presentation/__init__.py`]: '',
  [`${ORDERS}/presentation/orders_cli.py`]: 'from ..application.use_cases import count as count\n',
  [`${ORDERS}/domain/__init__.py`]: '',
  [`${ORDERS}/application/__init__.py`]: '',
  [`${ORDERS}/application/contracts/__init__.py`]:
    'from typing import Protocol\n\n\nclass Store(Protocol):\n  def size(self) -> int: ...\n',
  [`${ORDERS}/application/use_cases/__init__.py`]: 'from .count import count as count\n',
  [`${ORDERS}/application/use_cases/count.py`]:
    'from ..contracts import Store\n\n\ndef count(store: Store) -> int:\n  return store.size()\n',
};

const concept: Readonly<Record<string, string>> = {
  [`${ORDERS}/domain/order/__init__.py`]: '',
  [`${ORDERS}/domain/order/entities/__init__.py`]:
    'from .order_aggregate import Order as Order\nfrom .order_aggregate import restore_order as restore_order\n',
  [`${ORDERS}/domain/order/entities/order_aggregate.py`]:
    'class Order:\n  pass\n\n\ndef restore_order() -> Order:\n  return Order()\n',
  [`${ORDERS}/domain/order/transitions/__init__.py`]:
    'from .order_transitions import ship_order as ship_order\n',
  [`${ORDERS}/domain/order/transitions/order_transitions.py`]:
    'from ..entities import Order\n\n\ndef ship_order(order: Order) -> Order:\n  return order\n',
};

// Why: the configuration the presets write depends only on the unit's blocks and its
// pyproject.toml, so every case lints its own modules in a copy of one applied unit.
const appliedFiles: Readonly<Record<string, string>> = {
  'pyproject.toml': [
    '[tool.uv.sources]',
    'unit-money = { workspace = true }',
    '',
    '[[tool.importlinter.contracts]]',
    'name = "layer-imports-dependencies-by-its-role"',
    'homes = { phonenumbers = ["domain", "kernel"] }',
    '',
  ].join('\n'),
  'src/unit/__init__.py': '',
};

const pluginsPathOf = (folder: string): string =>
  architectureTask.parse(Bun.TOML.parse(readFileSync(join(folder, 'pyproject.toml'), 'utf8'))).tool
    .poe.tasks['check:architecture'].env.PYTHONPATH;

const matchesOf = (lines: readonly string[], pattern: RegExp): readonly string[] =>
  lines.flatMap((line) => {
    const match = pattern.exec(line)?.[1];

    return match === undefined
      ? []
      : [
          match,
        ];
  });

const lintImports = async (files: Readonly<Record<string, string>> = {}): Promise<Lint> => {
  const folder = widestAppliedUnit('import-linter', {
    blocks: [
      'task-runner/poe',
    ],
    files: appliedFiles,
  });

  writeFiles({
    files,
    folder,
  });

  const run = await runTool({
    command: [
      uvBinary('lint-imports'),
      '--no-cache',
      '--no-logo',
    ],
    env: new Map([
      [
        'PYTHONPATH',
        [
          'src',
          pluginsPathOf(folder),
        ].join(delimiter),
      ],
    ]),
    folder,
  });
  const lines = linesOf(run.stdout);

  return {
    broken: matchesOf(lines, BROKEN),
    reported: matchesOf(lines, REPORTED),
    status: run.status,
  };
};

export { concept, feature, lintImports, ORDERS };
