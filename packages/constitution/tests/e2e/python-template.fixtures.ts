import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { delimiter, join } from 'node:path';

import { z } from 'zod';

import type { Files } from './python-project.fixtures';
import { inPythonProjectAsync, repository, writeFiles } from './python-project.fixtures';
import { uvEnvironment } from './uv.fixtures';

interface Run {
  readonly isClean: boolean;
  readonly output: string;
}

// One area of the check, or the whole of it, over the template with the files a case changes.
interface TaskRun {
  readonly changes: Files;
  readonly task: string;
}

const templates = join(repository, 'templates', 'project', 'python');
const presets = join(repository, 'presets', 'python');
const ARCHIVE = '.droneey/constitution';
const gitIdentity = [
  '-c',
  'user.name=Constitution',
  '-c',
  'user.email=constitution@example.com',
];

const python = (...lines: readonly string[]): string => `${lines.join('\n')}\n`;

// The blocks of the shop's scope, Python's, in the order the hook reads them:
// the language, then its tools and libraries by id.
const blocks = [
  'python',
  'complexipy',
  'deptry',
  'fastapi',
  'fastmcp',
  'httpx2',
  'hypothesis',
  'import-linter',
  'mutmut',
  'poe',
  'pydantic',
  'pytest',
  'python-check',
  'ruff',
  'structlog',
  'ty',
  'uv',
  'vulture',
];
const axes = [
  'foundation',
  'architecture',
];

const listOf = (folder: string): readonly string[] =>
  existsSync(folder) ? readdirSync(folder).toSorted() : [];

// A tool's parts as /constitution:ratify computes them: on each axis, self,
// core and the language's, then the other blocks' in their order.
const partsOf = (tool: string): readonly string[] =>
  axes.flatMap((axis) => {
    const files = listOf(join(presets, tool, axis)).filter(
      (file) => file.includes('.') && file !== 'bindings.yaml',
    );

    const named = (name: string): readonly string[] =>
      files.filter((file) => file.slice(0, file.indexOf('.')) === name);

    return [
      'self',
      'core',
      'python',
      ...blocks.filter((block) => block !== 'python'),
    ]
      .flatMap(named)
      .map((file) => `presets/python/${tool}/${axis}/${file}`);
  });

const textOf = (part: string): string => readFileSync(join(repository, part), 'utf8');

// The part the others lead to: none of them extends it.
const chainEndOf = (parts: readonly string[]): string =>
  parts.find(
    (candidate) =>
      !parts.some((other) =>
        textOf(other).includes(`"${candidate.slice(candidate.lastIndexOf('/') + 1)}"`),
      ),
  ) ?? '';

// A fragment with its placeholders filled as /constitution:ratify fills them.
const filled = (input: { parts: readonly string[]; text: string }): string => {
  const paths = input.parts.map((part) => `${ARCHIVE}/${part}`);
  const copies = input.parts
    .map((part) => `# from ${ARCHIVE}/${part}\n${textOf(part)}# end ${ARCHIVE}/${part}\n`)
    .join('\n');

  return input.text
    .replace('# from <parts>\n<copied parts>\n# end <parts>\n', copies)
    .replace('# from <parts>', `# from ${paths.join(', ')}`)
    .replace('  "<parts>",\n', paths.map((path) => `  "${path}",\n`).join(''))
    .replace('<parts>', paths.join(' '))
    .replace('<chain end>', `${ARCHIVE}/${chainEndOf(input.parts)}`)
    .replaceAll('<name>', 'shop')
    .replaceAll('<package>', 'shop');
};

const mergedTableNames = [
  '[dependency-groups]',
  '[tool.mutmut]',
  '[tool.poe.tasks]',
];

const tableSchema = z.record(z.string(), z.unknown());

// One table from each fragment that gives it: the keys of every fragment, a
// list several give holding the entries of each without repeats.
const mergedTable = (input: { sections: readonly string[]; table: string }): string => {
  const settings = input.sections
    .filter((section) => section.startsWith(`${input.table}\n`))
    .map((section) => tableSchema.parse(Bun.TOML.parse(section.slice(input.table.length + 1))));
  const keys = [
    ...new Set(settings.flatMap((setting) => Object.keys(setting))),
  ];
  const lines = keys.map((key) => {
    const given = settings.flatMap((setting) =>
      Object.hasOwn(setting, key)
        ? [
            setting[key],
          ]
        : [],
    );
    const joined = given.every((entry) => Array.isArray(entry))
      ? [
          ...new Set(given.flat()),
        ]
      : given.at(-1);

    return `${JSON.stringify(key)} = ${JSON.stringify(joined)}`;
  });

  return `${input.table}\n${lines.join('\n')}\n`;
};

// The tables several fragments give, joined into one each, as ratify merges them.
const mergedTables = (text: string): string => {
  const sections = text.split(/(?=^\[)/mu);
  const kept = sections.filter(
    (section) => !mergedTableNames.some((table) => section.startsWith(`${table}\n`)),
  );

  return [
    ...kept,
    ...mergedTableNames.map((table) =>
      mergedTable({
        sections,
        table,
      }),
    ),
  ].join('\n');
};

const assembled = (path: string): string => {
  const text = blocks
    .flatMap((block) => {
      const fragment = join(templates, block, path);

      return existsSync(fragment)
        ? [
            filled({
              parts: partsOf(block),
              text: readFileSync(fragment, 'utf8'),
            }),
          ]
        : [];
    })
    .join('\n');

  return path.endsWith('.toml') ? mergedTables(text) : text;
};

const pyproject = assembled('pyproject.toml');

// The template's files as a project copies them, its package named shop.
const templateFiles: Files = {
  '.gitignore': `${assembled('.gitignore')}/.droneey\n`,
  'pyproject.toml': pyproject,
  'tests/conftest.py': assembled('tests/conftest.py'),
};

// A package that keeps every rule of the template: a surface, a module, an
// async function, and specs that kill each of their mutants.
const shop: Files = {
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
      ...gitIdentity,
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
const runInTemplate = (input: { changes: Files; command: readonly string[] }): Promise<Run> =>
  inPythonProjectAsync({
    files: {
      ...templateFiles,
      ...shop,
    },
    run: async (folder) => {
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
        [
          'PATH',
          `${join(uvEnvironment, 'bin')}${delimiter}${process.env['PATH'] ?? ''}`,
        ],
        [
          'PYTHONPATH',
          'src',
        ],
      ]);
      const running = Bun.spawn(
        [
          ...input.command,
        ],
        {
          cwd: folder,
          env: environment,
          stderr: 'pipe',
          stdout: 'pipe',
        },
      );
      const [stdout, stderr, status] = await Promise.all([
        new Response(running.stdout).text(),
        new Response(running.stderr).text(),
        running.exited,
      ]);

      return {
        isClean: status === 0,
        output: `${stdout}${stderr}`,
      };
    },
    withTools: true,
  });

// The command of each area a project's check runs over the template's
// configuration; the template prescribes none, so the specs name their own.
const TASKS: Readonly<Record<string, string>> = {
  'format:check': 'ruff format --check',
  'lint:check': 'ruff check',
  'type:check':
    'ty check --config-file .droneey/constitution/presets/python/ty/foundation/self.toml',
  'code:check': 'python .droneey/constitution/tools/python-check/dist/python-check.pyz src tests',
  'complexity:check': 'complexipy src tests',
  'architecture:check': 'lint-imports --no-logo',
  'dependencies:check': 'deptry src',
  'unused:check': 'vulture',
  'test:check': 'pytest --cov',
  'mutation:check': 'python .droneey/constitution/tools/mutmut-check/dist/mutmut-check.pyz',
} as const;

const commandOf = (task: string): string => {
  const command = task === 'check' ? Object.values(TASKS).join(' && ') : TASKS[task];

  if (command === undefined) {
    throw new Error(`no command for ${task}`);
  }

  return command;
};

// One area of the check, or the whole of it, over the template.
const runTask = (input: TaskRun): Promise<Run> =>
  runInTemplate({
    changes: input.changes,
    command: [
      'sh',
      '-c',
      commandOf(input.task),
    ],
  });

// The runs take seconds each, mutmut's above all, so this many run at a time.
const RUNS_AT_ONCE = 4;

const registered = new Map<string, TaskRun>();
const ran = new Map<string, Run>();

const keyOf = (input: TaskRun): string =>
  JSON.stringify([
    input.task,
    Object.entries(input.changes).toSorted(([left], [right]) => left.localeCompare(right)),
  ]);

// A table registers its runs while the file is collected.
const taskCase = <TRow extends TaskRun>(row: TRow): TRow => {
  registered.set(keyOf(row), row);

  return row;
};

const taskCases = <TRow extends TaskRun>(rows: readonly TRow[]): readonly TRow[] =>
  rows.map(taskCase);

// Runs every registered run, once the tables are collected.
const runRegistered = async (): Promise<void> => {
  const queue = registered.entries();

  const runNext = async (): Promise<void> => {
    const next = queue.next();

    if (next.done !== true) {
      const [key, input] = next.value;

      ran.set(key, await runTask(input));
      await runNext();
    }
  };

  await Promise.all(
    Array.from(
      {
        length: RUNS_AT_ONCE,
      },
      runNext,
    ),
  );
};

/** @throws Error when no table registered the run. */
const runOf = (input: TaskRun): Run => {
  const run = ran.get(keyOf(input));

  if (run === undefined) {
    throw new Error(`No table registered the run of ${input.task}`);
  }

  return run;
};

const settingsSchema = z.object({
  tool: z.record(z.string(), z.unknown()),
});

// A tool's table in the assembled pyproject.toml, and in the tool's part,
// which it carries since the tool reads no file but the project's.
const templateTable = (tool: string): unknown =>
  settingsSchema.parse(Bun.TOML.parse(pyproject)).tool[tool];

const partTable = (tool: string): unknown =>
  settingsSchema.parse(Bun.TOML.parse(textOf(`presets/python/${tool}/foundation/core.toml`))).tool[
    tool
  ];

// Whether one line of a tool's output holds every text of a finding: the package,
// the place and the home a finding names, say, rather than its sentence.
const isFoundIn = (input: { finding: readonly string[]; output: string }): boolean =>
  input.output.split('\n').some((line) => input.finding.every((text) => line.includes(text)));

export { isFoundIn, partTable, python, runOf, runRegistered, taskCase, taskCases, templateTable };
