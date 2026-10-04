import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';

import type { Files } from './python-project.fixtures';
import { inPythonProject, REPOSITORY, writeFiles } from './python-project.fixtures';
import { ENVIRONMENT } from './uv.fixtures';

interface Run {
  isClean: boolean;
  output: string;
}

const TEMPLATES = join(REPOSITORY, 'templates', 'project', 'python');
const GIT_IDENTITY = [
  '-c',
  'user.name=Constitution',
  '-c',
  'user.email=constitution@example.com',
];

const python = (...lines: readonly string[]): string => `${lines.join('\n')}\n`;

// The template's files as a project copies them, its package named shop.
const TEMPLATE_FILES: Files = {
  '.gitignore': `${readFileSync(join(TEMPLATES, '.gitignore'), 'utf8')}/.droneey\n`,
  'pyproject.toml': readFileSync(join(TEMPLATES, 'pyproject.toml'), 'utf8')
    .replace('<name>', 'shop')
    .replaceAll('<package>', 'shop'),
  'tests/conftest.py': readFileSync(join(TEMPLATES, 'tests', 'conftest.py'), 'utf8'),
};

// A package that keeps every rule of the template: a surface, a module, an
// async function, and specs that kill each of their mutants.
const SHOP: Files = {
  'src/shop/__init__.py': python(
    'from .orders import total, totals',
    '',
    "__all__ = ['total', 'totals']",
  ),
  'src/shop/orders.py': python(
    'def total(prices: list[int], *, discount: int) -> int:',
    '  return max(sum(prices) - discount, 0)',
    '',
    '',
    'async def totals(baskets: list[list[int]]) -> list[int]:',
    '  return [total(basket, discount=0) for basket in baskets]',
  ),
  'tests/test_orders.py': python(
    'from shop.orders import total, totals',
    '',
    '',
    'def test_should_subtract_the_discount() -> None:',
    '  # Arrange',
    '  prices = [3, 4]',
    '',
    '  # Act',
    '  result = total(prices, discount=2)',
    '',
    '  # Assert',
    '  assert result == 5',
    '',
    '',
    'def test_should_stop_at_zero_when_the_discount_is_larger() -> None:',
    '  # Arrange',
    '  prices = [1]',
    '',
    '  # Act',
    '  result = total(prices, discount=2)',
    '',
    '  # Assert',
    '  assert result == 0',
    '',
    '',
    'async def test_should_total_each_basket() -> None:',
    '  # Arrange',
    '  baskets = [[1, 2], [3]]',
    '',
    '  # Act',
    '  result = await totals(baskets)',
    '',
    '  # Assert',
    '  assert result == [3, 3]',
  ),
};

const git = (folder: string, args: readonly string[]): void => {
  const running = spawnSync(
    'git',
    [
      ...GIT_IDENTITY,
      ...args,
    ],
    {
      cwd: folder,
      encoding: 'utf8',
    },
  );

  if (running.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${running.stderr}`);
  }
};

// The project's base, the template with the shop package, is committed as
// origin/main; the files a case changes are written over it. The package
// stands in for its install by PYTHONPATH, and the tools are the repository's
// own, pinned to the template's versions.
const runInTemplate = (input: {
  changes: Files;
  command: readonly string[];
  isCi?: boolean;
}): Run =>
  inPythonProject({
    files: {
      ...TEMPLATE_FILES,
      ...SHOP,
    },
    run: (folder) => {
      git(folder, [
        'init',
        '--quiet',
      ]);
      git(folder, [
        'add',
        '--all',
      ]);
      git(folder, [
        'commit',
        '--quiet',
        '--message',
        'base',
      ]);
      git(folder, [
        'update-ref',
        'refs/remotes/origin/main',
        'HEAD',
      ]);
      writeFiles(folder, input.changes);

      const environment = Object.fromEntries([
        ...Object.entries(process.env).filter(([name]) => name !== 'CI'),
        ...(input.isCi === true
          ? [
              [
                'CI',
                'true',
              ],
            ]
          : []),
        [
          'PATH',
          `${join(ENVIRONMENT, 'bin')}${delimiter}${process.env['PATH'] ?? ''}`,
        ],
        [
          'PYTHONPATH',
          'src',
        ],
      ]);
      const running = spawnSync(input.command[0] ?? '', input.command.slice(1), {
        cwd: folder,
        encoding: 'utf8',
        env: environment,
      });

      return {
        isClean: running.status === 0,
        output: `${running.stdout}${running.stderr}`,
      };
    },
    withTools: true,
  });

// One task of the template's check, through Poe the Poet as a project runs it.
const runTask = (input: { changes: Files; task: string }): Run =>
  runInTemplate({
    changes: input.changes,
    command: [
      'poe',
      '--executor',
      'simple',
      input.task,
    ],
  });

export { python, runInTemplate, runTask };
