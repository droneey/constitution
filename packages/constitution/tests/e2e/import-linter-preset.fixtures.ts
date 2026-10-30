import { linesOf, runTool, widestAppliedUnit } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

interface Lint {
  readonly broken: readonly string[];
  readonly status: number;
}

const BROKEN = /^(\S+) BROKEN$/;
const ORDERS = 'src/unit/features/orders';

const feature: Readonly<Record<string, string>> = {
  'src/unit/features/__init__.py': '',
  [`${ORDERS}/__init__.py`]: 'from unit.features.orders.presentation import orders_cli as orders_cli\n',
  [`${ORDERS}/infrastructure/__init__.py`]: '',
  [`${ORDERS}/infrastructure/memory_store.py`]:
    'class MemoryStore:\n  def size(self) -> int:\n    return 0\n',
  [`${ORDERS}/presentation/__init__.py`]: '',
  [`${ORDERS}/presentation/orders_cli.py`]:
    'from unit.features.orders.application.use_cases import count as count\n',
  [`${ORDERS}/domain/__init__.py`]: '',
  [`${ORDERS}/application/contracts/__init__.py`]:
    'from typing import Protocol\n\n\nclass Store(Protocol):\n  def size(self) -> int: ...\n',
  [`${ORDERS}/application/use_cases/__init__.py`]:
    'from unit.features.orders.application.use_cases.count import count as count\n',
  [`${ORDERS}/application/use_cases/count.py`]:
    'from unit.features.orders.application.contracts import Store\n\n\ndef count(store: Store) -> int:\n  return store.size()\n',
};

const lintImports = async (files: Readonly<Record<string, string>> = {}): Promise<Lint> => {
  const run = await runTool({
    command: [
      uvBinary('lint-imports'),
      '--no-cache',
      '--no-logo',
    ],
    env: new Map([
      [
        'PYTHONPATH',
        'src',
      ],
    ]),
    folder: widestAppliedUnit('import-linter', {
      files: {
        'src/unit/__init__.py': '',
        ...files,
      },
    }),
  });

  return {
    broken: linesOf(run.stdout).flatMap((line) => {
      const name = BROKEN.exec(line)?.[1];

      return name === undefined
        ? []
        : [
            name,
          ];
    }),
    status: run.status,
  };
};

export { feature, lintImports, ORDERS };
