import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import type { CommandPlaces } from '#/shared/cli';

import type { ApplyReport } from '../../../../../domain/entities';
import { PresetsCode } from '../../../../../domain/entities';
import { applySectionsOf } from '../../../../utils';
import { createPresetsApplyCommand } from '../apply.cli';

const written: ApplyReport = {
  added: [],
  findings: [],
  removed: [],
  written: [
    'biome.json',
  ],
};

const runOf = async (input: {
  places?: Partial<CommandPlaces>;
  report: ApplyReport | undefined;
}) => {
  const asked: string[] = [];
  const { context, record } = createFakeContext({
    places: input.places ?? {},
  });

  await runCommand({
    args: [],
    command: createPresetsApplyCommand({
      ...context,
      applyPresets: (start: string) => {
        asked.push(start);

        return input.report;
      },
    }),
    group: 'presets',
  });

  return {
    asked,
    failures: record().failures,
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
    'should apply the presets to the project from $start and print what it wrote when $condition',
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
        failures: 0,
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
  ])('should end the run as failed when $condition', async ({ report }) => {
    // Act
    const run = await runOf({
      report,
    });

    // Assert
    expect({
      failures: run.failures,
      steps: run.steps,
    }).toStrictEqual({
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
