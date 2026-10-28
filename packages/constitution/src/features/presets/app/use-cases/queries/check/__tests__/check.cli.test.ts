import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { ConfigurationsCheck } from '../../../../../domain/entities';
import { PresetsCode, ProjectRead, ProjectReadStatus } from '../../../../../domain/entities';
import { configurationsStepOf } from '../../../../utils';
import { createPresetsCheckCommand } from '../check.cli';

const warning: ProjectWarning = {
  details: {
    name: 'nope',
  },
  kind: WarningKind.NameUnknown,
};
const sound: ConfigurationsCheck = {
  findings: [],
  warnings: [],
};
const warned: ConfigurationsCheck = {
  findings: [],
  warnings: [
    warning,
  ],
};

// A step's label names it: any text but an empty one.
const NAMED = /\S/;

const runOf = async (checked: ProjectRead<ConfigurationsCheck>) => {
  const asked: string[] = [];
  const { context, record } = createFakeContext();

  await runCommand({
    args: [],
    command: createPresetsCheckCommand({
      ...context,
      checkConfigurations: (startFolderPath: AbsolutePath) => {
        asked.push(startFolderPath);

        return checked;
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

describe('createPresetsCheckCommand', () => {
  it('should check the project around the folder it runs in', async () => {
    // Act
    const run = await runOf(ProjectRead.opened(sound));

    // Assert
    expect(run.asked).toStrictEqual([
      '/work/project/package',
    ]);
  });

  it('should print what the check found', async () => {
    // Act
    const run = await runOf(ProjectRead.opened(warned));

    // Assert
    expect(run.printed).toStrictEqual([
      configurationsStepOf(ProjectRead.opened(warned)).sections,
    ]);
  });

  it.each<{
    checked: ProjectRead<ConfigurationsCheck>;
    condition: string;
    failures: number;
    status: StepStatus;
  }>([
    {
      checked: ProjectRead.opened(sound),
      condition: 'the project is sound',
      failures: 0,
      status: StepStatus.Done,
    },
    {
      checked: ProjectRead.opened(warned),
      condition: 'the project has warnings',
      failures: 1,
      status: StepStatus.Warned,
    },
    {
      checked: ProjectRead.opened({
        findings: [
          {
            code: PresetsCode.Missing,
            details: {
              settings: [
                'width',
              ],
            },
            path: 'biome.json',
          },
        ],
        warnings: [],
      }),
      condition: 'its presets find something',
      failures: 1,
      status: StepStatus.Warned,
    },
    {
      checked: {
        status: ProjectReadStatus.NoProject,
      },
      condition: 'no project lies around the folder',
      failures: 1,
      status: StepStatus.Failed,
    },
  ])(
    'should end the step as $status and fail the run $failures times when $condition',
    async ({ checked, failures, status }) => {
      // Act
      const run = await runOf(checked);

      // Assert
      expect({
        failures: run.failures,
        steps: run.steps,
      }).toStrictEqual({
        failures,
        steps: [
          [
            expect.stringMatching(NAMED),
            status,
          ],
        ],
      });
    },
  );
});
