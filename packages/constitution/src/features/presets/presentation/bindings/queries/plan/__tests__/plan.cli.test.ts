import { describe, expect, it } from 'bun:test';

import { StepStatus } from '@droneey/design-cli';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import type { AbsolutePath } from '#/kernel/value-objects';
import type { CommandPlaces } from '#/shared/cli';
import { linesSection } from '#/shared/cli';

import type { PresetsPlan } from '../../../../../domain/entities';
import { PresetsCode, ProjectRead, ProjectReadStatus } from '../../../../../domain/entities';
import { planLinesOf } from '../../../../utils';
import { createPresetsPlanCommand } from '../plan.cli';

const plan: PresetsPlan = {
  blockIds: new Map(),
  files: [],
  findings: [
    {
      code: PresetsCode.FileUnparsed,
      details: {},
      path: 'biome.json',
    },
  ],
  runs: [],
};

const runOf = async (
  places: Partial<CommandPlaces>,
  read: ProjectRead<PresetsPlan> = ProjectRead.opened(plan),
) => {
  const asked: string[] = [];
  const { context, record } = createFakeContext({
    places,
  });

  await runCommand({
    args: [],
    command: createPresetsPlanCommand({
      ...context,
      planPresets: (startFolderPath: AbsolutePath): ProjectRead<PresetsPlan> => {
        asked.push(startFolderPath);

        return read;
      },
    }),
    group: 'presets',
  });

  return {
    asked,
    failures: record().failures,
    printed: record().printed,
    steps: record().ran.map((ran) => ran.outcome.status),
  };
};

describe('createPresetsPlanCommand', () => {
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
    {
      condition: 'Claude Code names the project by a path that does not open with "/"',
      places: {
        cwd: '/work/project/package',
        projectDir: 'app',
      },
      start: '/work/project/package/app',
    },
  ])(
    'should plan the presets of the project from $start when $condition',
    async ({ places, start }) => {
      // Act
      const run = await runOf(places);

      // Assert
      expect(run.asked).toStrictEqual([
        start,
      ]);
    },
  );

  it('should print the lines of the plan', async () => {
    // Act
    const run = await runOf({});

    // Assert
    expect(run.printed).toStrictEqual([
      [
        linesSection(planLinesOf(plan)),
      ],
    ]);
  });

  it('should fail its step, print nothing and end the run as failed when the project cannot be read', async () => {
    // Act
    const run = await runOf(
      {},
      {
        status: ProjectReadStatus.NoProject,
      },
    );

    // Assert
    expect({
      failures: run.failures,
      printed: run.printed,
      steps: run.steps,
    }).toStrictEqual({
      failures: 1,
      printed: [],
      steps: [
        StepStatus.Failed,
      ],
    });
  });
});
