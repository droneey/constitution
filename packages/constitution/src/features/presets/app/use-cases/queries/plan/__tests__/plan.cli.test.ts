import { describe, expect, it } from 'bun:test';

import { createFakeContext, runCommand } from '#/__tests__/command-line.fake';
import { linesSection } from '#/shared/cli';

import { createPresetsPlanCommand } from '../plan.cli';

const plan = [
  'biome.json for .',
  '  biome .droneey/constitution/templates/project/typescript/biome/biome.json',
];

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
        planPresets: (from: string): readonly string[] => {
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
            linesSection(plan),
          ],
        ],
      });
    },
  );
});
