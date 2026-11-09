import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { Level } from '#/kernel/constants';
import { AbsolutePath, BlockId, RuleSlug, UnitPath } from '#/kernel/value-objects';
import type { StepReport } from '#/shared/cli';

import { ProjectRead, ProjectReadStatus } from '../../../../../domain/presets-project/entities';
import type { DiagnosticIndex, RunAsked, RunPlan } from '../../../../../domain/run-plan/entities';
import { EntryPoint } from '../../../../../domain/run-plan/entities';
import { PresetsCode } from '../../../../../domain/shared/entities';
import { createRunCommand } from '../run.cli';

const pythonRules: DiagnosticIndex = new Map([
  [
    'PLR',
    [
      {
        level: Level.Must,
        slug: RuleSlug.create('literal-with-a-meaning-is-named'),
        statement: 'A literal with a meaning is named.',
        why: 'a bare number hides what it means.',
      },
    ],
  ],
  [
    '[case-named-should-when]',
    [
      {
        level: Level.Should,
        slug: RuleSlug.create('case-named-should-when'),
        statement: 'A case is named for what it should do and when.',
        why: 'a case named otherwise hides what it proves.',
      },
    ],
  ],
]);

const pythonOutput = [
  'src/kit.py:3:9: PLR2004 Magic value used in comparison',
  'src/kit.py:7:1: PLR2004 Magic value used in comparison',
  'tests/kit_test.py:2:1 [case-named-should-when] Name the case for what it should do',
  'src/kit.py:9:1: E501 Line too long',
].join('\n');

const plan: RunPlan = {
  findings: [
    {
      code: PresetsCode.ToolWithoutRunner,
      details: {
        block: BlockId.create('biome'),
      },
      path: 'packages/py/constitution.yaml',
    },
  ],
  steps: [
    {
      command: 'bun run check',
      diagnostics: new Map(),
      unitFolderPath: AbsolutePath.create('/work/project'),
      unitPath: UnitPath.create(''),
    },
    {
      command: 'bun run test',
      diagnostics: new Map(),
      unitFolderPath: AbsolutePath.create('/work/project'),
      unitPath: UnitPath.create(''),
    },
    {
      command: 'uv run --locked poe check',
      diagnostics: pythonRules,
      unitFolderPath: AbsolutePath.create('/work/project/packages/py'),
      unitPath: UnitPath.create('packages/py'),
    },
  ],
};

const packsReport = (isFailed: boolean): StepReport => ({
  isFailed,
  outcome: {
    detail: isFailed ? '1 finding' : 'every pack is sound',
    status: isFailed ? StepStatus.Failed : StepStatus.Done,
  },
  sections: [],
});

const runOf = async (input: {
  args: readonly string[];
  codes?: readonly number[];
  packs?: StepReport;
  read?: ProjectRead<RunPlan>;
}) => {
  const packsAsked: AbsolutePath[] = [];
  const planned: RunAsked[] = [];
  const commands: string[] = [];
  const codes = [
    ...(input.codes ?? []),
  ];
  const { context, record } = createFakeContext({
    places: {
      cwd: '/work/project',
    },
  });

  await runCommand({
    args: input.args,
    command: createRunCommand({
      ...context,
      checkPacks: (startFolderPath) => {
        packsAsked.push(startFolderPath);

        return input.packs;
      },
      packsLabel: 'Packs',
      planRun: (asking) => {
        planned.push(asking);

        return input.read ?? ProjectRead.opened(plan);
      },
      runCommand: ({ command }) => {
        commands.push(command);

        return Promise.resolve({
          code: codes.shift() ?? 0,
          output: pythonOutput,
        });
      },
    }),
  });

  return {
    commands,
    failures: record().failures,
    packsAsked,
    planned,
    steps: record().ran.map((ran) => ran.outcome.status),
    stderr: record().stderr,
    stdout: record().stdout,
  };
};

describe('createRunCommand', () => {
  it.each([
    {
      args: [],
      golden: 'run-steps.golden.txt',
      shown: 'with each rule it breaks',
    },
    {
      args: [
        '--why',
      ],
      golden: 'run-steps-why.golden.txt',
      shown: "with each rule it breaks and the rule's Why",
    },
  ])(
    'should write each command, its unit outside the root, the findings and the failure $shown as the golden file shows them',
    async ({ args, golden }) => {
      // Act
      const run = await runOf({
        args: [
          'check',
          ...args,
        ],
        codes: [
          0,
          0,
          3,
        ],
      });

      const said = goldenOf({
        stderr: run.stderr,
        stdout: run.stdout,
      });

      // Assert
      expect(said).toBe(await goldenFileText(new URL(golden, import.meta.url), said));
    },
  );

  it('should run each command the plan of the entry point gives, from the folder, in order', async () => {
    // Act
    const run = await runOf({
      args: [
        'check',
      ],
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
      planned: run.planned,
    }).toStrictEqual({
      commands: [
        'bun run check',
        'bun run test',
        'uv run --locked poe check',
      ],
      failures: 0,
      planned: [
        {
          entryPoint: EntryPoint.Check,
          startFolderPath: AbsolutePath.create('/work/project'),
        },
      ],
    });
  });

  it('should stop at the first command that fails and end the run as failed', async () => {
    // Act
    const run = await runOf({
      args: [
        'test',
      ],
      codes: [
        0,
        1,
      ],
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
    }).toStrictEqual({
      commands: [
        'bun run check',
        'bun run test',
      ],
      failures: 1,
    });
  });

  it('should fail its step, run nothing and end the run as failed when no project holds the folder', async () => {
    // Act
    const run = await runOf({
      args: [
        'check',
      ],
      read: {
        status: ProjectReadStatus.NoProject,
      },
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
      steps: run.steps,
    }).toStrictEqual({
      commands: [],
      failures: 1,
      steps: [
        StepStatus.Failed,
      ],
    });
  });

  it.each<{
    condition: string;
    expected: {
      commands: string[];
      failures: number;
      steps: StepStatus[];
    };
    isFailed: boolean;
  }>([
    {
      condition: 'a pack holds a finding that fails it',
      expected: {
        commands: [],
        failures: 1,
        steps: [
          StepStatus.Failed,
        ],
      },
      isFailed: true,
    },
    {
      condition: 'every pack is sound',
      expected: {
        commands: [
          'bun run check',
          'bun run test',
          'uv run --locked poe check',
        ],
        failures: 0,
        steps: [
          StepStatus.Done,
        ],
      },
      isFailed: false,
    },
  ])('should check the packs before the units when $condition', async ({ expected, isFailed }) => {
    // Act
    const run = await runOf({
      args: [
        'check',
      ],
      packs: packsReport(isFailed),
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
      steps: run.steps,
    }).toStrictEqual(expected);
  });

  it('should check no pack for an entry point other than check', async () => {
    // Act
    const run = await runOf({
      args: [
        'test',
      ],
      packs: packsReport(true),
    });

    // Assert
    expect({
      failures: run.failures,
      packsAsked: run.packsAsked,
    }).toStrictEqual({
      failures: 0,
      packsAsked: [],
    });
  });

  it('should refuse an entry point no runner gives', async () => {
    // Act
    const running = runOf({
      args: [
        'deploy',
      ],
    });

    // Assert
    await expect(running).rejects.toThrow();
  });
});
