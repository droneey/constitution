import { describe, expect, it } from 'bun:test';

import { RuleSlug, UnitPath } from '#/kernel/value-objects';

import {
  presetFileParser,
  projectFiles,
  projectOf,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
import { readHeldRules } from '../read-held-rules.use-case';

describe('readHeldRules', () => {
  it('should give each unit the rules a whole setting of its active blocks holds, and no other', () => {
    // Arrange
    const { files, project } = projectOf({
      files: releasePresets({
        'bun/@foundation.yaml': [
          'bun:',
          '  unchecked-type-never-used:',
          "    '*': !whole",
          '      config.json:',
          '        strict: true',
          '  dead-code-deleted:',
          '    typescript:',
          '      config.json:',
          '        unused: true',
          "  '*':",
          "    '*':",
          '      config.json:',
          '        width: 100',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'bun',
            'typescript',
          ],
        }),
        unitOf({
          path: 'packages/kit',
        }),
      ],
    });

    // Act
    const held = readHeldRules({
      files,
      parser: presetFileParser,
      project,
    });

    // Assert
    expect(held).toStrictEqual(
      new Map([
        [
          UnitPath.create(''),
          new Map([
            [
              RuleSlug.create('unchecked-type-never-used'),
              {
                isEveryLanguage: true,
                languages: new Set(),
              },
            ],
          ]),
        ],
      ]),
    );
  });

  it.each([
    {
      condition: "a whole setting's guard does not hold in the unit",
      files: releasePresets({
        'bun/@foundation.yaml': [
          'bun:',
          '  unchecked-type-never-used:',
          "    '*': !whole",
          '      config.json ? !${file.isTop}:',
          '        strict: true',
        ].join('\n'),
      }),
      packs: [],
    },
    {
      condition: "a pack's preset file does not load beside a release that does",
      files: {
        ...releasePresets({
          'bun/@foundation.yaml': [
            'bun:',
            '  unchecked-type-never-used:',
            "    '*': !whole",
            '      config.json:',
            '        strict: true',
          ].join('\n'),
        }),
        ...projectFiles({
          'packs/acme/presets/bun/@architecture.yaml': 'bun: [',
        }),
      },
      packs: [
        'packs/acme',
      ],
    },
  ])('should give no unit a held rule when $condition', ({ files: presetFiles, packs }) => {
    // Arrange
    const { files, project } = projectOf({
      files: presetFiles,
      packs,
      units: [
        unitOf({
          blocks: [
            'core',
            'bun',
          ],
          packs,
        }),
      ],
    });

    // Act
    const held = readHeldRules({
      files,
      parser: presetFileParser,
      project,
    });

    // Assert
    expect(held).toStrictEqual(new Map());
  });
});
