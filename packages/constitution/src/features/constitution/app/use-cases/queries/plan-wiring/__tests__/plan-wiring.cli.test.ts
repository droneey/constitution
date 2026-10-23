import { describe, expect, it } from 'bun:test';

import { commandLineOf, createFakeCommandRun } from '../../../../__tests__/command-line.fake';
import { createPlanWiringCommand } from '../plan-wiring.cli';

describe('createPlanWiringCommand', () => {
  it.each([
    {
      condition: 'Claude Code names the project',
      projectDir: '/work/project',
      start: '/work/project',
    },
    {
      condition: 'it names none',
      projectDir: '',
      start: '/work/package',
    },
  ])(
    'should write each planned line from the project when $condition',
    async ({ projectDir, start }) => {
      // Arrange
      const fake = createFakeCommandRun({
        places: {
          cwd: '/work/package',
          projectDir,
        },
      });
      let asked: readonly string[] = [];
      const cli = await commandLineOf(
        createPlanWiringCommand({
          ...fake.run,
          planWiring: (from: string): readonly string[] => {
            asked = [
              ...asked,
              from,
            ];

            return [
              'biome.json\t.\ttemplates/project/typescript/biome/biome.json',
              'knip.config.ts\t.\ttemplates/project/typescript/knip/knip.config.ts',
            ];
          },
        }),
      );

      // Act
      await cli.run([
        'wiring',
      ]);

      // Assert
      expect({
        asked,
        record: fake.record(),
      }).toStrictEqual({
        asked: [
          start,
        ],
        record: {
          errors: [],
          failures: 0,
          prefixes: [
            'constitution wiring',
          ],
          written: [
            'biome.json\t.\ttemplates/project/typescript/biome/biome.json\nknip.config.ts\t.\ttemplates/project/typescript/knip/knip.config.ts\n',
          ],
        },
      });
    },
  );
});
