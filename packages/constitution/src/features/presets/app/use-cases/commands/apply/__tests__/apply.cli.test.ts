import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import { UnitPath } from '#/kernel/value-objects';
import type { CommandPlaces } from '#/shared/cli';

import type { ApplyReport, RunAsked, RunPlan } from '../../../../../domain/entities';
import { PresetsCode } from '../../../../../domain/entities';
import { applySectionsOf } from '../../../../utils';
import { createPresetsApplyCommand } from '../apply.cli';

const written: ApplyReport = {
  added: [],
  findings: [],
  removed: [],
  units: [
    'packages/kit',
  ],
  written: [
    'packages/kit/biome.json',
  ],
};

const fixPlan: RunPlan = {
  findings: [],
  steps: [
    {
      command: 'bun run fix',
      folder: '/work/project/packages/kit',
      unit: UnitPath.create('packages/kit'),
    },
  ],
};

const runOf = async (input: {
  args?: readonly string[];
  codes?: readonly number[];
  places?: Partial<CommandPlaces>;
  report: ApplyReport | undefined;
}) => {
  const asked: string[] = [];
  const planned: RunAsked[] = [];
  const commands: {
    command: string;
    folder: string;
  }[] = [];
  const codes = [
    ...(input.codes ?? []),
  ];
  const { context, record } = createFakeContext({
    places: input.places ?? {},
  });

  await runCommand({
    args: input.args ?? [],
    command: createPresetsApplyCommand({
      ...context,
      applyPresets: (start: string) => {
        asked.push(start);

        return input.report;
      },
      planRun: (asking) => {
        planned.push(asking);

        return fixPlan;
      },
      runCommand: ({ command, folder }) => {
        commands.push({
          command,
          folder,
        });

        return codes.shift() ?? 0;
      },
    }),
    group: 'presets',
  });

  return {
    asked,
    commands,
    failures: record().failures,
    planned,
    printed: record().printed,
    steps: record().ran.map((ran) => [
      ran.label,
      ran.outcome.status,
    ]),
  };
};

describe('createPresetsApplyCommand', () => {
  it.each<{
    condition: string;
    places: Partial<CommandPlaces>;
    start: string;
  }>([
    {
      condition: 'Claude Code names the project',
      places: {
        cwd: '/work/project/package',
        projectDir: '/work/project',
      },
      start: '/work/project',
    },
    {
      condition: 'Claude Code names none',
      places: {
        cwd: '/work/project/package',
      },
      start: '/work/project/package',
    },
  ])(
    'should apply the presets to the project from $start, print what it wrote and run the fix of each unit it wrote in when $condition',
    async ({ places, start }) => {
      // Act
      const run = await runOf({
        places,
        report: written,
      });

      // Assert
      expect(run).toStrictEqual({
        asked: [
          start,
        ],
        commands: [
          {
            command: 'bun run fix',
            folder: '/work/project/packages/kit',
          },
        ],
        failures: 0,
        planned: [
          {
            name: 'fix',
            start,
            units: [
              'packages/kit',
            ],
          },
        ],
        printed: [
          applySectionsOf(written),
        ],
        steps: [
          [
            'Presets',
            StepStatus.Done,
          ],
        ],
      });
    },
  );

  it.each([
    {
      args: [
        '--no-fix',
      ],
      condition: 'the run asks for no fix',
      report: written,
    },
    {
      args: [],
      condition: 'the apply wrote no file',
      report: {
        ...written,
        units: [],
        written: [],
      },
    },
  ])('should run no fix when $condition', async ({ args, report }) => {
    // Act
    const run = await runOf({
      args,
      report,
    });

    // Assert
    expect({
      commands: run.commands,
      failures: run.failures,
      planned: run.planned,
    }).toStrictEqual({
      commands: [],
      failures: 0,
      planned: [],
    });
  });

  it('should end the run as failed when the fix fails', async () => {
    // Act
    const run = await runOf({
      codes: [
        2,
      ],
      report: written,
    });

    // Assert
    expect(run.failures).toBe(1);
  });

  it.each<{
    condition: string;
    report: ApplyReport | undefined;
  }>([
    {
      condition: 'no project lies around the folder',
      report: undefined,
    },
    {
      condition: 'the apply found something wrong',
      report: {
        ...written,
        findings: [
          {
            code: PresetsCode.FileUnparsed,
            details: {},
            path: 'biome.json',
          },
        ],
      },
    },
  ])('should end the run as failed, running no fix, when $condition', async ({ report }) => {
    // Act
    const run = await runOf({
      report,
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
        [
          'Presets',
          StepStatus.Failed,
        ],
      ],
    });
  });
});
