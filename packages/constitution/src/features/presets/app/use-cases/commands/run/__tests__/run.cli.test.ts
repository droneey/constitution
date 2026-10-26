import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { UnitPath } from '#/kernel/value-objects';

import type { RunAsked, RunPlan } from '../../../../../domain/entities';
import { PresetsCode } from '../../../../../domain/entities';
import { createRunCommand } from '../run.cli';

const plan: RunPlan = {
  findings: [
    {
      code: PresetsCode.ToolWithoutRunner,
      details: {
        block: 'biome',
      },
      path: 'packages/py/constitution.yaml',
    },
  ],
  steps: [
    {
      command: 'bun run check',
      folder: '/work/project',
      unit: UnitPath.create(''),
    },
    {
      command: 'bun run test',
      folder: '/work/project',
      unit: UnitPath.create(''),
    },
    {
      command: 'uv run --locked poe check',
      folder: '/work/project/packages/py',
      unit: UnitPath.create('packages/py'),
    },
  ],
};

const runOf = async (input: { args: readonly string[]; codes?: readonly number[] }) => {
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

        return plan;
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
    stderr: record().stderr,
    stdout: record().stdout,
  };
};

describe('createRunCommand', () => {
  it('should run each command of the entry point from the folder, writing each before it runs and its unit outside the root', async () => {
    // Act
    const run = await runOf({
      args: [
        'check',
      ],
    });

    // Assert
    expect({
      ...run,
      stderr: run.stderr.includes(`[${PresetsCode.ToolWithoutRunner}]`),
    }).toStrictEqual({
      commands: [
        'bun run check',
        'bun run test',
        'uv run --locked poe check',
      ],
      failures: 0,
      planned: [
        {
          name: 'check',
          start: '/work/project',
        },
      ],
      stderr: true,
      stdout: '$ bun run check\n$ bun run test\n$ (packages/py) uv run --locked poe check\n',
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
      named: run.stderr.includes('bun run test'),
    }).toStrictEqual({
      commands: [
        'bun run check',
        'bun run test',
      ],
      failures: 1,
      named: true,
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
