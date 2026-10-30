import { describe, expect, it } from 'bun:test';

import { AbsolutePath } from '#/kernel/value-objects';

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
import { ProjectReadStatus } from '../../../../../domain/presets-project/entities';
import { planPresets } from '../plan.use-case';

describe('planPresets', () => {
  it('should give each file the presets write in the project around the start folder, with its unit and entries', () => {
    // Arrange
    const project = projectOf({
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
        }),
      ],
    });

    // Act
    const plan = answerOf(
      planPresets({
        distribution: createFakeDistributionSources(),
        formats: createFakeConfigurationFormat(),
        files: project.files,
        parser: presetFileParser,
        reader: project.reader,
        startFolderPath: AbsolutePath.create(PROJECT),
      }),
    );

    // Assert
    expect({
      files: plan.files.map(({ entries, filePath, merged, unitPath }) => ({
        entries: entries.length,
        file: String(filePath),
        merged,
        unit: String(unitPath),
      })),
      findings: plan.findings,
    }).toStrictEqual({
      files: [
        {
          entries: 1,
          file: 'biome.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              width: 100,
            },
          },
          unit: '',
        },
      ],
      findings: [],
    });
  });

  it('should tell that no project is there when none holds the start folder', () => {
    // Arrange
    const project = projectOf({
      units: [],
    });

    // Act
    const plan = planPresets({
      distribution: createFakeDistributionSources(),
      formats: createFakeConfigurationFormat(),
      files: project.files,
      parser: presetFileParser,
      reader: project.reader,
      startFolderPath: AbsolutePath.create('/elsewhere'),
    });

    // Assert
    expect(plan).toStrictEqual({
      status: ProjectReadStatus.NoProject,
    });
  });
});
