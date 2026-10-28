import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { AbsolutePath, BlockId, UnitPath } from '#/kernel/value-objects';

import type { RunAsked, RunPlan } from '../../../../../domain/entities';
import {
  EntryPoint,
  PresetsCode,
  ProjectRead,
  ProjectReadStatus,
} from '../../../../../domain/entities';
import { createRunCommand } from '../run.cli';

// Two commands of the root and one of a member, with a finding of the plan.
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

const runOf = async (input: {
  args: readonly string[];
  codes?: readonly number[];
  read?: ProjectRead<RunPlan>;
}) => {
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
