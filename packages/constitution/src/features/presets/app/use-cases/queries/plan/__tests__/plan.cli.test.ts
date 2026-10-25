import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-line.fake';
import { UnitPath } from '#/kernel/value-objects';
import { linesSection } from '#/shared/cli';

import type { WiringPlan } from '../../../../../domain/entities';
import { planLinesOf } from '../../../../utils';
import { createPresetsPlanCommand } from '../plan.cli';

const plan: WiringPlan = {
  files: [
    {
      file: 'biome.json',
      isNew: false,
      scopes: [
        {
          scope: 'typescript',
          tools: [
            {
              isAdded: false,
              parts: [],
              template: '.droneey/constitution/templates/project/typescript/biome/biome.json',
              tool: 'biome',
            },
          ],
        },
      ],
      units: [
        UnitPath.create(''),
      ],
    },
  ],
  untemplated: [],
};

describe('createPresetsPlanCommand', () => {
  it.each([
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
        projectDir: '',
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
        planPresets: (from: string): WiringPlan => {
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
