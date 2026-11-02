import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { stringify } from 'smol-toml';
import { z } from 'zod';

import { appliedUnit } from './applied-unit.fixtures';
import { createBatch } from './batch.fixtures';
import { searchPathWith, toolEnvironment } from './package.fixtures';
import type { BuiltTool, Files } from './python-project.fixtures';
import { buildTools, inPythonProjectAsync, python, writeFiles } from './python-project.fixtures';
import { uvEnvironment } from './uv.fixtures';

interface Run {
  readonly isClean: boolean;
  readonly output: string;
}

interface TaskRun {
  readonly changes: Files;
  readonly task: string;
}

const gitIdentity = [
  '-c',
  'user.name=Constitution',
  '-c',
  'user.email=constitution@example.com',
];

const NAME = 'shop';
const APPLIED_FILES = [
  '.gitignore',
  'pyproject.toml',
  'tests/conftest.py',
] as const;

const unit = appliedUnit({
  blocks: [
    'complexipy',
    'deptry',
    'fastapi',
    'fastmcp',
    'git',
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
    'rest-api',
    'mcp-api',
    'remote-service',
  ],
  languages: [
    'python',
  ],
  name: NAME,
});

const appliedText = (path: string): string => readFileSync(join(unit, path), 'utf8');

const settingsSchema = z.looseObject({
  project: z.record(z.string(), z.unknown()),
});
const appliedSettings = settingsSchema.parse(Bun.TOML.parse(appliedText('pyproject.toml')));

const pyproject = stringify({
  ...appliedSettings,
  'dependency-groups': {
    dev: [
      'pytest',
    ],
  },
  project: {
    ...appliedSettings.project,
    name: NAME,
  },
});

const appliedFiles: Files = {
  ...Object.fromEntries(
    APPLIED_FILES.map((path) => [
      path,
      appliedText(path),
    ]),
  ),
  'pyproject.toml': pyproject,
};

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
      env: toolEnvironment(),
    },
  );

  if (running.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${running.stderr}`);
  }
};

const runInTemplate = (input: {
  changes: Files;
  command: readonly string[];
  tools: readonly BuiltTool[];
}): Promise<Run> =>
  inPythonProjectAsync({
    files: {
      ...appliedFiles,
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

      const running = Bun.spawn(
        [
          ...input.command,
        ],
        {
          cwd: folder,
          env: toolEnvironment(
            new Map([
              [
                'PATH',
                searchPathWith(join(uvEnvironment, 'bin')),
              ],
              [
                'PYTHONPATH',
                'src',
              ],
            ]),
          ),
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
    tools: input.tools,
  });

const poeTasksSchema = z.object({
  tool: z.object({
    poe: z.object({
      tasks: z.record(z.string(), z.unknown()),
    }),
  }),
});

const tasks: ReadonlyMap<string, string> = new Map(
  Object.entries(poeTasksSchema.parse(Bun.TOML.parse(pyproject)).tool.poe.tasks).flatMap(
    ([task, command]) =>
      typeof command === 'string'
        ? [
            [
              task,
              command,
            ] as const,
          ]
        : [],
  ),
);

const checkCommand = [
  ...tasks,
]
  .filter(
    ([task]) => task.startsWith('check:') || task.startsWith('test:') || task === 'mutate:branch',
  )
  .map(([, command]) => command)
  .join(' && ');

const commandOf = (task: string): string => {
  const command = task === 'check' ? checkCommand : tasks.get(task);

  if (command === undefined) {
    throw new Error(`no command for ${task}`);
  }

  return command;
};

const runTask = (input: { run: TaskRun; tools: readonly BuiltTool[] }): Promise<Run> =>
  runInTemplate({
    changes: input.run.changes,
    command: [
      'sh',
      '-c',
      commandOf(input.run.task),
    ],
    tools: input.tools,
  });

const RUNS_AT_ONCE = 4;

const keyOf = (input: TaskRun): string =>
  JSON.stringify([
    input.task,
    Object.entries(input.changes).toSorted(([left], [right]) => left.localeCompare(right)),
  ]);

const runAll = async (
  entries: readonly (readonly [
    string,
    TaskRun,
  ])[],
): Promise<ReadonlyMap<string, Run>> => {
  const tools = buildTools();
  const queue = entries.values();

  const runNext = async (): Promise<
    readonly (readonly [
      string,
      Run,
    ])[]
  > => {
    const next = queue.next();

    if (next.done === true) {
      return [];
    }

    const [key, run] = next.value;
    const outcome = await runTask({
      run,
      tools,
    });

    return [
      [
        key,
        outcome,
      ],
      ...(await runNext()),
    ];
  };

  const runs = await Promise.all(
    Array.from(
      {
        length: RUNS_AT_ONCE,
      },
      runNext,
    ),
  );

  return new Map(runs.flat());
};

interface TaskBatch {
  readonly runOf: (input: TaskRun) => Run;
  readonly runRegistered: () => Promise<void>;
  readonly taskCase: <TRow extends TaskRun>(row: TRow) => TRow;
  readonly taskCases: <TRow extends TaskRun>(rows: readonly TRow[]) => readonly TRow[];
}

const createTaskBatch = (): TaskBatch => {
  const { outcomeOf, register, runRegistered } = createBatch({
    keyOf,
    runAll,
  });

  return {
    runOf: outcomeOf,
    runRegistered,
    taskCase: register,
    taskCases: (rows) => rows.map(register),
  };
};

interface FoundInInput {
  readonly finding: readonly string[];
  readonly output: string;
}

const isFoundIn = (input: FoundInInput): boolean =>
  input.output.split('\n').some((line) => input.finding.every((text) => line.includes(text)));

const MUTATION_CODE = /^mutation: (?<code>[a-z-]+): /gm;

const mutationCodesOf = (output: string): readonly string[] =>
  [
    ...output.matchAll(MUTATION_CODE),
  ].map((match) => match.groups?.['code'] ?? '');

export { createTaskBatch, isFoundIn, mutationCodesOf };
