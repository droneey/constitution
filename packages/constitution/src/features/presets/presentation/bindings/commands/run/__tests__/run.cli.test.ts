import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { AbsolutePath, BlockId, UnitPath } from '#/kernel/value-objects';
import type { StepReport } from '#/shared/cli';

import { ProjectRead, ProjectReadStatus } from '../../../../../domain/presets-project/entities';
import type { RunAsked, RunPlan } from '../../../../../domain/run-plan/entities';
import { EntryPoint } from '../../../../../domain/run-plan/entities';
import { PresetsCode } from '../../../../../domain/shared/entities';
import { createRunCommand } from '../run.cli';

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
      unitFolderPath: AbsolutePath.create('/work/project'),
      unitPath: UnitPath.create(''),
    },
    {
      command: 'bun run test',
      unitFolderPath: AbsolutePath.create('/work/project'),
      unitPath: UnitPath.create(''),
    },
    {
      command: 'uv run --locked poe check',
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

        return codes.shift() ?? 0;
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
  it('should write each command, its unit outside the root, the findings and the failure as the golden file shows them', async () => {
    // Act
    const run = await runOf({
      args: [
        'check',
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
    expect(said).toBe(await goldenFileText(new URL('run-steps.golden.txt', import.meta.url), said));
  });

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
