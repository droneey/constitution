import { dirname } from 'node:path';

import { searchPathWith } from './package.fixtures';
import { linesOf, pythonPackage, runTool, widestAppliedUnit } from './preset-load.fixtures';
import { uvBinary } from './uv.fixtures';

const MUTANT = /^\s*([\w.]+): \w+$/;

// A module of totals that logs, a module of messages, and the specs that reach both.
const unitFiles: Readonly<Record<string, string>> = {
  ...pythonPackage,
  'src/unit/orders.py':
    'import logging\n\nlogger = logging.getLogger(__name__)\n\n\ndef total(price: int, tax: int) -> int:\n  logger.info("Totalled")\n  return price + tax\n',
  'src/unit/orders_messages.py': 'def greeting(name: str) -> str:\n  return "Hello " + name\n',
  'tests/test_orders.py':
    'from unit.orders import total\nfrom unit.orders_messages import greeting\n\n\ndef test_should_total() -> None:\n  assert total(1, 2) == 3\n\n\ndef test_should_greet() -> None:\n  assert greeting("a") == "Hello a"\n',
};

/**
 * The names of the mutants mutmut makes in the widest unit that holds the files above, run with the
 * repository's Python environment, ty's among it, first on the PATH.
 *
 * @throws Error when mutmut's run fails, which leaves no mutant to list.
 */
const mutantNames = async (): Promise<readonly string[]> => {
  const folder = widestAppliedUnit('mutmut', {
    files: unitFiles,
  });
  const env = new Map([
    [
      'PATH',
      searchPathWith(dirname(uvBinary('mutmut'))),
    ],
    [
      'PYTHONPATH',
      'src',
    ],
  ]);

  const run = await runTool({
    command: [
      uvBinary('mutmut'),
      'run',
    ],
    env,
    folder,
  });

  if (run.status !== 0) {
    throw new Error(`mutmut run failed in ${folder}: ${run.stdout}${run.stderr}`);
  }

  const listed = await runTool({
    command: [
      uvBinary('mutmut'),
      'results',
      '--all',
      'true',
    ],
    env,
    folder,
  });

  return linesOf(listed.stdout).flatMap((line) => {
    const name = MUTANT.exec(line)?.[1];

    return name === undefined
      ? []
      : [
          name,
        ];
  });
};

export { mutantNames };
