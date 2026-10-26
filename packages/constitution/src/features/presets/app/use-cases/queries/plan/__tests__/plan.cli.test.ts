import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-context.fake';
import type { CommandPlaces } from '#/shared/cli';
import { linesSection } from '#/shared/cli';

import type { PresetsPlan } from '../../../../../domain/entities';
import { planLinesOf } from '../../../../utils';
import { createPresetsPlanCommand } from '../plan.cli';

const plan: PresetsPlan = {
  blocks: new Map(),
  files: [],
  findings: [],
  runs: [],
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
  ])(
    'should print the plan of the project from $start when $condition',
    async ({ places, start }) => {
      // Arrange
      const asked: string[] = [];
      const { context, record } = createFakeContext({
        places,
      });
      const command = createPresetsPlanCommand({
        ...context,
        planPresets: (from: string): PresetsPlan => {
          asked.push(from);

          return plan;
        },
      });

      // Act
      await runCommand({
        args: [],
        command,
        group: 'presets',
      });

      // Assert
      expect({
        asked,
        printed: record().printed,
      }).toStrictEqual({
        asked: [
          start,
        ],
        printed: [
          [
            linesSection(planLinesOf(plan)),
          ],
        ],
      });
    },
  );
});
