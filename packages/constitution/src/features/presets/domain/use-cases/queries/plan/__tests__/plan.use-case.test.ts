import { describe, expect, it } from 'bun:test';

import { createFakeDistributionSources } from '../../../../../__tests__/distribution-sources.fake';
import {
  PROJECT,
  presetFileParser,
  projectOf,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
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
    const plan = planPresets({
      distribution: createFakeDistributionSources(),
      files: project.files,
      parser: presetFileParser,
      source: project.source,
      start: PROJECT,
    });

    // Assert
    expect({
      files: plan.files.map(({ entries, file, merged, unit }) => ({
        entries: entries.length,
        file,
        merged,
        unit: String(unit),
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
});
