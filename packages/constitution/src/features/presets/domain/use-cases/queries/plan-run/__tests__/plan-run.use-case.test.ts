import { describe, expect, it } from 'bun:test';

import { AbsolutePath, UnitPath } from '#/kernel/value-objects';

import { createFakeConfigurationFormat } from '../../../../../__tests__/configuration-format.fake';
import { createFakeDistributionSources } from '../../../../../__tests__/distribution-sources.fake';
import {
  answerOf,
  PROJECT,
  presetFileParser,
  projectOf,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
import type { RunAsked } from '../../../../entities';
import { EntryPoint, PresetsCode, ProjectReadStatus } from '../../../../entities';
import { planRun } from '../plan-run.use-case';

// Bun runs every unit that follows it; biome needs a runner, which the unit of hooks lacks.
const project = projectOf({
  files: releasePresets({
    'bun/foundation.yaml': [
      'bun:',
      "  '*':",
      "    '*':",
      '      ${constitution.run}:',
      '        check:',
      '          - bun run check',
      '        fix:',
      '          - bun run fix',
    ].join('\n'),
    'bun/foundation/with/biome.yaml': [
      'biome:',
      "  '*':",
      "    '*':",
      '      package.json:',
      '        scripts:',
      '          check:lint: biome check',
      'bun:',
      "  '*':",
      "    '*':",
      '      ${constitution.run}:',
      '        check:',
      '          - bun run test',
    ].join('\n'),
    'biome/foundation.yaml': [
      'biome:',
      "  '*':",
      "    '*':",
      '      biome.json:',
      '        width: 100',
      '      package.json:',
      '        name: ${package.name}',
    ].join('\n'),
  }),
  units: [
    unitOf({
      blocks: [
        'core',
        'biome',
        'bun',
      ],
    }),
    unitOf({
      blocks: [
        'core',
        'bun',
      ],
      path: 'packages/kit',
    }),
    unitOf({
      blocks: [
        'core',
        'biome',
      ],
      path: 'packages/hooks',
    }),
  ],
});

interface Planned {
  readonly findings: readonly (readonly string[])[];
  readonly steps: readonly (readonly string[])[];
}

const stepsOf = (input: RunAsked): Planned => {
  const plan = answerOf(
    planRun({
      distribution: createFakeDistributionSources(),
      formats: createFakeConfigurationFormat(),
      files: project.files,
      parser: presetFileParser,
      reader: project.reader,
      ...input,
    }),
  );

  return {
    findings: plan.findings.map(({ code, path }) => [
      code,
      path,
    ]),
    steps: plan.steps.map(({ command, unitFolderPath, unitPath }) => [
      String(unitPath),
      unitFolderPath,
      command,
    ]),
  };
};

describe('planRun', () => {
  it.each([
    {
      condition: 'the start is the root',
      expected: [
        [
          '',
          PROJECT,
          'bun run check',
        ],
        [
          '',
          PROJECT,
          'bun run test',
        ],
        [
          'packages/kit',
          `${PROJECT}/packages/kit`,
          'bun run check',
        ],
      ],
      start: PROJECT,
    },
    {
      condition: 'the start lies in a member',
      expected: [
        [
          'packages/kit',
          `${PROJECT}/packages/kit`,
          'bun run check',
        ],
      ],
      start: `${PROJECT}/packages/kit/src`,
    },
    {
      condition: 'the start lies in the root outside every member',
      expected: [
        [
          '',
          PROJECT,
          'bun run check',
        ],
        [
          '',
          PROJECT,
          'bun run test',
        ],
        [
          'packages/kit',
          `${PROJECT}/packages/kit`,
          'bun run check',
        ],
      ],
      start: `${PROJECT}/docs`,
    },
    {
      condition: 'the start doubles the slash after the root',
      expected: [
        [
          '',
          PROJECT,
          'bun run check',
        ],
        [
          '',
          PROJECT,
          'bun run test',
        ],
        [
          'packages/kit',
          `${PROJECT}/packages/kit`,
          'bun run check',
        ],
      ],
      start: `${PROJECT}//packages/kit`,
    },
  ])(
    'should give the commands of the units the start runs, the root first, and what keeps them from being the presets’ when $condition',
    ({ expected, start }) => {
      // Act
      const run = stepsOf({
        entryPoint: EntryPoint.Check,
        startFolderPath: AbsolutePath.create(start),
      });

      // Assert
      expect(run).toStrictEqual({
        findings: [
          [
            PresetsCode.ToolWithoutRunner,
            'packages/hooks/constitution.yaml',
          ],
        ],
        steps: expected,
      });
    },
  );

  it('should give the commands of the units asked for alone, of the entry point asked for', () => {
    // Act
    const run = stepsOf({
      entryPoint: EntryPoint.Fix,
      startFolderPath: AbsolutePath.create(PROJECT),
      unitPaths: [
        UnitPath.create('packages/kit'),
      ],
    });

    // Assert
    expect(run.steps).toStrictEqual([
      [
        'packages/kit',
        `${PROJECT}/packages/kit`,
        'bun run fix',
      ],
    ]);
  });

  it('should tell that no project is there when none holds the start folder', () => {
    // Act
    const planned = planRun({
      distribution: createFakeDistributionSources(),
      formats: createFakeConfigurationFormat(),
      entryPoint: EntryPoint.Check,
      files: project.files,
      parser: presetFileParser,
      reader: project.reader,
      startFolderPath: AbsolutePath.create('/elsewhere'),
    });

    // Assert
    expect(planned).toStrictEqual({
      status: ProjectReadStatus.NoProject,
    });
  });
});
