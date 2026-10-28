import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { Axis } from '#/kernel/constants';
import { BlockModel } from '#/kernel/entities';
import { AbsolutePath, BlockId, BlockSource, PackPath } from '#/kernel/value-objects';

import { createFakeConfigurationFormat } from '../../../../../__tests__/configuration-format.fake';
import { createFakeDistributionSources } from '../../../../../__tests__/distribution-sources.fake';
import type { Files } from '../../../../../__tests__/presets.fixtures';
import { presetFileParser, presetsModel } from '../../../../../__tests__/presets.fixtures';
import type { PresetsFinding } from '../../../../entities';
import { PresetsCode } from '../../../../entities';
import type { PresetFilePath } from '../../../../value-objects';
import { checkPresets } from '../check-presets.use-case';

const FOLDER = '/work/constitution';
const FOUNDATION = 'presets/biome/foundation.yaml';

const findingsOf = (input: {
  distributed?: readonly string[];
  model?: BlockModel;
  presets: Files;
  source?: BlockSource;
  unreadable?: readonly string[];
}): readonly PresetsFinding[] =>
  checkPresets({
    files: createFakeProjectFiles({
      files: Object.fromEntries(
        Object.entries(input.presets).map(([path, text]) => [
          `${FOLDER}/presets/${path}`,
          text,
        ]),
      ),
      unreadable: (input.unreadable ?? []).map((path) => `${FOLDER}/presets/${path}`),
    }),
    sourceFolderPath: AbsolutePath.create(FOLDER),
    distribution: createFakeDistributionSources(input.distributed),
    formats: createFakeConfigurationFormat(),
    source: input.source ?? BlockSource.create(),
    model: input.model ?? presetsModel,
    parser: presetFileParser,
  });

const placeOf = (reader: string, axis: Axis, ...withs: readonly string[]): PresetFilePath => ({
  axis,
  reader: BlockId.create(reader),
  withs: withs.map(BlockId.create),
});

// A preset file of one entry, in biome's foundation.
const entryOf = (input: {
  block?: string;
  file?: string;
  language?: string;
  rule?: string;
  value?: string;
}): string =>
  [
    `${input.block ?? 'biome'}:`,
    `  '${input.rule ?? '*'}':`,
    `    '${input.language ?? '*'}':`,
    `      '${input.file ?? 'biome.json'}':`,
    `        ${input.value ?? 'width: 100'}`,
  ].join('\n');

// The placement findings of an entry written in biome's foundation under each of these paths, all
// checked at once.
const placementsOf = (
  entry: string,
  places: readonly (readonly string[])[],
): readonly PresetsFinding[] =>
  findingsOf({
    presets: Object.fromEntries(
      places.map((withs) => [
        `${[
          'biome/foundation',
          ...withs.map((block) => `with/${block}`),
        ].join('/')}.yaml`,
        entry,
      ]),
    ),
  }).filter(
    ({ code }) =>
      code === PresetsCode.EntryMisplaced || code === PresetsCode.EntryNeedsTooManyBlocks,
  );

// The paths the check sends an entry to from each of these paths.
const belongsOf = (
  entry: string,
  places: readonly (readonly string[])[],
): readonly (readonly string[])[] =>
  placementsOf(entry, places).flatMap((finding) =>
    finding.code === PresetsCode.EntryMisplaced
      ? [
          finding.details.belongs.withs,
        ]
      : [],
  );

describe('checkPresets', () => {
  it('should find nothing when every preset file is sound', () => {
    // Arrange
    const presets = {
      'biome/foundation/with/bun/with/git.yaml': entryOf({
        block: 'bun',
        value: "files: ['**/*${role.ignore-file}']",
      }),
      'biome/architecture/with/bun.yaml': entryOf({
        value: "files: ['**/*${role.typescript-source}']",
      }),
      'biome/architecture.yaml': entryOf({
        block: 'core',
        rule: 'import-points-inward',
        value: "files: ['${role.gateway}/**', '${role.source}/**']",
      }),
      'biome/foundation.yaml': entryOf({
        language: 'typescript',
        value: "includes: ['!!${workspace.members}', '**/*.ts', '.gitignore', 'docs/**']",
      }),
      'biome/foundation/with/bun.yaml': entryOf({
        block: 'bun',
        value: "files: ['**/*${role.typescript-source}']",
      }),
      'biome/foundation/with/git.yaml': entryOf({
        value: "files: ['**/*${role.ignore-file}']",
      }),
      'biome/foundation/with/typescript/with/workspace.yaml': entryOf({
        value: "files: ['**/*${role.typescript-source}', '${role.declaration-cache}']",
      }),
      'biome/foundation/with/nestjs/with/workspace.yaml': [
        entryOf({
          value: "files: ['**/*${role.nest-module}', '${role.declaration-cache}']",
        }),
        entryOf({
          block: 'core',
          value: "files: ['${role.declaration-cache}']",
        }),
      ].join('\n'),
      'biome/foundation/with/git/with/bun.yaml': entryOf({
        block: 'git',
        rule: 'lock-file-committed',
        value: "files: ['**/*${role.typescript-source}']",
      }),
      'biome/foundation/with/nx.yaml': entryOf({
        value: "files: ['${role.declaration-cache}']",
      }),
      'biome/foundation/with/docker.yaml': entryOf({
        block: 'docker',
        value: "files: ['**/*${role.ignore-file}']",
      }),
      'biome/foundation/with/bun/with/workspace.yaml': entryOf({
        block: 'bun',
        value: "files: ['${role.declaration-cache}']",
      }),
      'biome/foundation/with/ui.yaml': entryOf({
        block: 'core',
      }),
      'biome/workflow.yaml': entryOf({
        block: 'core',
        rule: 'file-within-500-lines',
      }),
      'biome/foundation/with/css/with/browser.yaml': entryOf({
        block: 'css',
        rule: 'css-loaded-by-the-bundle',
      }),
      'biome/plugins/typescript/unchecked-type-never-used.grit': 'language js',
      'biome/typescript/self.jsonc': '{}',
      'bun/foundation.yaml': [
        'bun:',
        "  '*':",
        "    '*':",
        '      bunfig.toml ? !${workspace.isRoot}:',
        '        top: ${file.isTop}',
        '      apps.json !jsonc ? ${unit.parent} = ${role.source}:',
        '        parent: ${unit.parent}',
        '      top.json ? ${unit.parent} = ${file.isTop}:',
        '        top: true',
        '        flags:',
        '          - ${workspace.isRoot}',
        '        preload:',
        '          - ${constitution.path}/presets/biome/plugins/typescript/unchecked-type-never-used.grit',
        '          - ${constitution.path}/presets/biome/typescript/',
        "      '${role.source}/sandbox.ts': !default |",
        '        // the fixture of src/ and of *.adapter.ts',
      ].join('\n'),
    };

    // Act
    const findings = findingsOf({
      presets,
    });

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each<{
    condition: string;
    findings: readonly PresetsFinding[];
    presets: Files;
    unreadable?: readonly string[];
  }>([
    {
      condition: 'a YAML file lies where no preset file may',
      findings: [
        {
          code: PresetsCode.PresetFileMisplaced,
          details: {},
          path: 'presets/biome/foundations.yaml',
        },
      ],
      presets: {
        'biome/foundations.yaml': entryOf({}),
      },
    },
    {
      condition: 'a preset file does not parse',
      findings: [
        {
          code: PresetsCode.PresetFileUnparsed,
          details: {
            line: 2,
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': 'biome:\n  - [',
      },
    },
    {
      condition: 'a preset file cannot be read',
      findings: [
        {
          code: PresetsCode.PresetFileUnparsed,
          details: {},
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({}),
      },
      unreadable: [
        'biome/foundation.yaml',
      ],
    },
    {
      condition: 'a preset file holds no map, or a key holds a scalar where the next key is due',
      findings: [
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [],
          },
          path: 'presets/biome/architecture.yaml',
        },
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [
              'biome',
              '*',
            ],
          },
          path: FOUNDATION,
        },
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [
              'core',
              '*',
              '*',
            ],
          },
          path: 'presets/biome/foundation/with/ui.yaml',
        },
        {
          code: PresetsCode.EntryMisshapen,
          details: {
            keys: [
              'biome',
            ],
          },
          path: 'presets/biome/workflow.yaml',
        },
      ],
      presets: {
        'biome/architecture.yaml': '- biome',
        'biome/foundation.yaml': "biome:\n  '*': biome.json",
        'biome/foundation/with/ui.yaml': "core:\n  '*':\n    '*': biome.json",
        'biome/workflow.yaml': 'biome: biome.json',
      },
    },
  ])(
    'should find what is wrong with a preset file when $condition',
    ({ findings, presets, unreadable }) => {
      // Act
      const found = findingsOf({
        presets,
        ...(unreadable === undefined
          ? {}
          : {
              unreadable,
            }),
      });

      // Assert
      expect(found).toStrictEqual(findings);
    },
  );

  it.each<{
    condition: string;
    findings: readonly PresetsFinding[];
    presets: Files;
  }>([
    {
      condition: 'its reader is no block',
      findings: [
        {
          code: PresetsCode.UnknownReader,
          details: {
            reader: BlockId.create('gone'),
          },
          path: 'presets/gone/foundation.yaml',
        },
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('gone', Axis.Foundation, 'core'),
            block: BlockId.create('core'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [],
          },
          path: 'presets/gone/foundation.yaml',
        },
      ],
      presets: {
        'gone/foundation.yaml': entryOf({
          block: 'core',
        }),
      },
    },
    {
      condition: 'its path names a block that is none',
      findings: [
        {
          code: PresetsCode.UnknownBlock,
          details: {
            block: BlockId.create('gone'),
          },
          path: 'presets/biome/foundation/with/gone.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/gone.yaml': entryOf({}),
      },
    },
    {
      condition: 'its key names a block that is none',
      findings: [
        {
          code: PresetsCode.UnknownBlock,
          details: {
            block: BlockId.create('gone'),
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          block: 'gone',
        }),
      },
    },
    {
      condition: 'its key spells a block as no block is, over keys it leaves unread',
      findings: [
        {
          code: PresetsCode.UnknownBlock,
          details: {
            block: 'Biome',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          block: 'Biome',
          rule: 'No Rule',
        }),
      },
    },
    {
      condition: 'its key spells a rule as no rule is, over keys it leaves unread',
      findings: [
        {
          code: PresetsCode.UnknownRule,
          details: {
            block: BlockId.create('biome'),
            rule: 'No Rule',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          language: 'Type Script',
          rule: 'No Rule',
        }),
      },
    },
    {
      condition: 'its key spells a language as no block is, over what it leaves unread',
      findings: [
        {
          code: PresetsCode.UnknownLanguage,
          details: {
            block: BlockId.create('biome'),
            language: 'Type Script',
            rule: '*',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    'Type Script': 1",
        ].join('\n'),
      },
    },
    {
      condition: 'its key names a rule that is none',
      findings: [
        {
          code: PresetsCode.UnknownRule,
          details: {
            block: BlockId.create('biome'),
            rule: 'gone',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          rule: 'gone',
        }),
      },
    },
    {
      condition: 'its key names a block of no language, or a language that is none',
      findings: [
        {
          code: PresetsCode.UnknownLanguage,
          details: {
            block: BlockId.create('biome'),
            language: 'biome',
            rule: '*',
          },
          path: FOUNDATION,
        },
        {
          code: PresetsCode.UnknownLanguage,
          details: {
            block: BlockId.create('biome'),
            language: 'cobol',
            rule: '*',
          },
          path: 'presets/biome/workflow.yaml',
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          language: 'biome',
        }),
        'biome/workflow.yaml': entryOf({
          language: 'cobol',
        }),
      },
    },
    {
      condition: 'its key block is the partner of its own rule’s seam',
      findings: [
        {
          code: PresetsCode.RuleOfAnotherBlock,
          details: {
            block: BlockId.create('browser'),
            owner: BlockId.create('css'),
            rule: 'css-loaded-by-the-bundle',
          },
          path: 'presets/biome/foundation/with/browser.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/browser.yaml': entryOf({
          block: 'browser',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition:
        'its path names a partner its rule has none of, or another partner than its rule’s',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'css'),
            block: BlockId.create('css'),
            rule: '*',
            unneededBlocks: [
              BlockId.create('browser'),
            ],
            unreachedRoles: [],
          },
          path: 'presets/biome/foundation/with/css/with/browser.yaml',
        },
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'css', 'browser'),
            block: BlockId.create('css'),
            rule: 'css-loaded-by-the-bundle',
            unneededBlocks: [
              BlockId.create('ui'),
            ],
            unreachedRoles: [],
          },
          path: 'presets/biome/foundation/with/css/with/ui.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/css/with/browser.yaml': entryOf({
          block: 'css',
        }),
        'biome/foundation/with/css/with/ui.yaml': entryOf({
          block: 'css',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition: 'its rule is another block’s',
      findings: [
        {
          code: PresetsCode.RuleOfAnotherBlock,
          details: {
            block: BlockId.create('biome'),
            owner: BlockId.create('core'),
            rule: 'file-within-500-lines',
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          rule: 'file-within-500-lines',
        }),
      },
    },
    {
      condition: 'its key block lies beyond the reader and its path does not name it',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'ui'),
            block: BlockId.create('ui'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [],
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          block: 'ui',
        }),
      },
    },
    {
      condition:
        'its key block lies beyond the reader and its path does not name it, though the role it names is reached',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'ui'),
            block: BlockId.create('ui'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [],
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          block: 'ui',
          value: "files: ['${role.source}/**']",
        }),
      },
    },
    {
      condition:
        'its rule’s seam partner lies beyond the reader and its path names only the key block',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'css', 'browser'),
            block: BlockId.create('css'),
            rule: 'css-loaded-by-the-bundle',
            unneededBlocks: [],
            unreachedRoles: [],
          },
          path: 'presets/biome/foundation/with/css.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/css.yaml': entryOf({
          block: 'css',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition:
        'a role it names, in its path, its guard or its value, is defined by a block beyond its reader, its key block and its path',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'git'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('git'),
                ],
                role: 'ignore-file',
              },
            ],
          },
          path: FOUNDATION,
        },
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Architecture, 'git'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('git'),
                ],
                role: 'ignore-file',
              },
            ],
          },
          path: 'presets/biome/architecture.yaml',
        },
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Workflow, 'git'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('git'),
                ],
                role: 'ignore-file',
              },
            ],
          },
          path: 'presets/biome/workflow.yaml',
        },
      ],
      presets: {
        'biome/architecture.yaml': entryOf({
          file: 'biome.json ? ${role.ignore-file} = .gitignore',
        }),
        'biome/foundation.yaml': entryOf({
          file: '${role.ignore-file}',
        }),
        'biome/workflow.yaml': entryOf({
          file: 'biome.json ? ${unit.parent} = ${role.ignore-file}',
        }),
      },
    },
    {
      condition: 'a role its value names is defined by a block beyond its reader and its key block',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'git'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('git'),
                ],
                role: 'ignore-file',
              },
            ],
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          value: "files: ['**/*${role.ignore-file}']",
        }),
      },
    },
    {
      condition:
        'a role its value names is defined by a block that neither its reader, its key block nor the block its path names reaches',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'typescript'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [
              BlockId.create('ui'),
            ],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('typescript'),
                ],
                role: 'typescript-source',
              },
            ],
          },
          path: 'presets/biome/foundation/with/ui.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/ui.yaml': entryOf({
          value: "files: ['**/*${role.typescript-source}']",
        }),
      },
    },
    {
      condition:
        'a role its value names is defined by a seam and its path names only the seam’s block',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'typescript', 'workspace'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('typescript'),
                  BlockId.create('workspace'),
                ],
                role: 'declaration-cache',
              },
            ],
          },
          path: 'presets/biome/foundation/with/typescript.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/typescript.yaml': entryOf({
          value: "files: ['${role.declaration-cache}']",
        }),
      },
    },
    {
      condition:
        'a role its value names is defined by a seam whose one block its key block reaches and its path names only the key block',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'bun', 'workspace'),
            block: BlockId.create('bun'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('typescript'),
                  BlockId.create('workspace'),
                ],
                role: 'declaration-cache',
              },
            ],
          },
          path: 'presets/biome/foundation/with/bun.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/bun.yaml': entryOf({
          block: 'bun',
          value: "files: ['${role.declaration-cache}']",
        }),
      },
    },
    {
      condition:
        'it needs its key block, the seam partner and a role’s definer, more than a path names',
      findings: [
        {
          code: PresetsCode.EntryNeedsTooManyBlocks,
          details: {
            block: BlockId.create('css'),
            needed: [
              BlockId.create('css'),
              BlockId.create('browser'),
              BlockId.create('git'),
            ],
            rule: 'css-loaded-by-the-bundle',
          },
          path: 'presets/biome/foundation/with/css/with/browser.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/css/with/browser.yaml': entryOf({
          block: 'css',
          rule: 'css-loaded-by-the-bundle',
          value: "files: ['**/*${role.ignore-file}']",
        }),
      },
    },
    {
      condition: 'its path names the blocks it needs in the other order',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'css', 'browser'),
            block: BlockId.create('css'),
            rule: 'css-loaded-by-the-bundle',
            unneededBlocks: [],
            unreachedRoles: [],
          },
          path: 'presets/biome/foundation/with/browser/with/css.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/browser/with/css.yaml': entryOf({
          block: 'css',
          rule: 'css-loaded-by-the-bundle',
        }),
      },
    },
    {
      condition: 'its rule is of an axis its preset file does not stand on',
      findings: [
        {
          code: PresetsCode.EntryOffItsAxis,
          details: {
            block: BlockId.create('core'),
            rule: 'import-points-inward',
            ruleAxis: Axis.Architecture,
          },
          path: 'presets/biome/workflow.yaml',
        },
      ],
      presets: {
        'biome/workflow.yaml': entryOf({
          block: 'core',
          rule: 'import-points-inward',
        }),
      },
    },
    {
      condition:
        'one role it names is defined by a block that the definer of another role it names, named after it, reaches',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'workspace', 'nestjs'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('typescript'),
                  BlockId.create('workspace'),
                ],
                role: 'declaration-cache',
              },
              {
                definers: [
                  BlockId.create('nestjs'),
                ],
                role: 'nest-module',
              },
            ],
          },
          path: FOUNDATION,
        },
      ],
      presets: {
        'biome/foundation.yaml': entryOf({
          value: "files: ['${role.declaration-cache}', '**/*${role.nest-module}']",
        }),
      },
    },
    {
      condition: 'its path names a block that another block its path names reaches',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'nestjs'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [
              BlockId.create('typescript'),
            ],
            unreachedRoles: [],
          },
          path: 'presets/biome/foundation/with/typescript/with/nestjs.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/typescript/with/nestjs.yaml': entryOf({
          value: "files: ['**/*${role.typescript-source}']",
        }),
      },
    },
    {
      condition:
        'a block its path names reaches the definer of one role it names, and the definer of another lies beyond its path',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'bun', 'git'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [],
            unreachedRoles: [
              {
                definers: [
                  BlockId.create('git'),
                ],
                role: 'ignore-file',
              },
            ],
          },
          path: 'presets/biome/foundation/with/bun.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/bun.yaml': entryOf({
          value: "files: ['**/*${role.typescript-source}', '**/*${role.ignore-file}']",
        }),
      },
    },
    {
      condition: 'its path names a block it does not need beside one that reaches a role it names',
      findings: [
        {
          code: PresetsCode.EntryMisplaced,
          details: {
            belongs: placeOf('biome', Axis.Foundation, 'nestjs'),
            block: BlockId.create('biome'),
            rule: '*',
            unneededBlocks: [
              BlockId.create('workspace'),
            ],
            unreachedRoles: [],
          },
          path: 'presets/biome/foundation/with/nestjs/with/workspace.yaml',
        },
      ],
      presets: {
        'biome/foundation/with/nestjs/with/workspace.yaml': entryOf({
          value: "files: ['**/*${role.typescript-source}']",
        }),
      },
    },
  ])('should find what is wrong with an entry’s key when $condition', ({ findings, presets }) => {
    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual(findings);
  });

  it('should find placed, where it sends it, every entry of the model’s keys and roles it finds misplaced', () => {
    // Arrange
    const keys = [
      {
        block: 'biome',
      },
      {
        block: 'bun',
      },
      {
        block: 'bun',
        rule: 'install-settings-only-in-the-root',
      },
      {
        block: 'css',
      },
      {
        block: 'css',
        rule: 'css-loaded-by-the-bundle',
      },
      {
        block: 'git',
      },
      {
        block: 'git',
        rule: 'lock-file-committed',
      },
      {
        block: 'nestjs',
      },
      {
        block: 'ui',
      },
    ];
    const roleSets = [
      'declaration-cache',
      'ignore-file',
      'nest-module',
      'typescript-source',
    ].reduce<readonly (readonly string[])[]>(
      (sets, role) =>
        sets.flatMap((set) => [
          set,
          [
            ...set,
            role,
          ],
        ]),
      [
        [],
      ],
    );
    // every block an entry may need, and ui for one it never does: core, biome and json are the
    // reader's reach, _runtime and lefthook give no role and no rule, and docker only a role's second
    // spelling
    const blocks = [
      'browser',
      'bun',
      'css',
      'git',
      'nestjs',
      'nx',
      'typescript',
      'ui',
      'workspace',
    ];
    const paths = [
      [],
      ...blocks.flatMap((first) => [
        [
          first,
        ],
        ...blocks
          .filter((second) => second !== first)
          .map((second) => [
            first,
            second,
          ]),
      ]),
    ];

    // Act
    const refused = keys.flatMap((key) =>
      roleSets.flatMap((set) => {
        const entry = entryOf({
          ...key,
          value: `files: [${set.map((role) => `'\${role.${role}}'`).join(', ')}]`,
        });

        return placementsOf(entry, belongsOf(entry, paths)).map(
          ({ path }) => `${key.block} → ${key.rule ?? '*'} naming [${set.join(', ')}] at ${path}`,
        );
      }),
    );

    // Assert
    expect(refused).toStrictEqual([]);
  });

  it.each<{
    condition: string;
    entry: string;
    finding: PresetsFinding;
  }>([
    {
      condition: 'its file starts at the root of the file system',
      entry: entryOf({
        file: '/biome.json',
      }),
      finding: {
        code: PresetsCode.FileOutsideItsUnit,
        details: {
          block: BlockId.create('biome'),
          file: '/biome.json',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its file climbs out of its unit',
      entry: entryOf({
        file: '../biome.json',
      }),
      finding: {
        code: PresetsCode.FileOutsideItsUnit,
        details: {
          block: BlockId.create('biome'),
          file: '../biome.json',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its guard names a fact that is no truth',
      entry: entryOf({
        file: 'biome.json ? ${package.name}',
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${package.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its guard compares a truth with a text',
      entry: entryOf({
        file: 'biome.json ? ${file.isTop} = yes',
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${file.isTop}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its guard compares the members with a text',
      entry: entryOf({
        file: 'biome.json ? ${workspace.members} = apps',
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${workspace.members}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its guard compares a fact no one computes',
      entry: entryOf({
        file: 'biome.json ? ${home.dir} = apps',
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${home.dir}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its guard compares a fact with a role no term carries',
      entry: entryOf({
        file: 'biome.json ? ${unit.parent} = ${role.gone}',
      }),
      finding: {
        code: PresetsCode.UnknownRole,
        details: {
          block: BlockId.create('biome'),
          role: 'gone',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its whole file’s text names a fact no one computes',
      entry: entryOf({
        file: '.gitignore',
        value: "!default '${file.name}'",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${file.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'a map in a list names a fact no one computes',
      entry: entryOf({
        value: "rules: [{name: '${file.name}'}]",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${file.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'its whole value is a text that types a role by hand',
      entry: entryOf({
        value: 'src/x',
      }),
      finding: {
        code: PresetsCode.HandTypedRole,
        details: {
          block: BlockId.create('biome'),
          role: 'source',
          rule: '*',
          term: 'src/',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it names a fact no one computes, twice',
      entry: entryOf({
        value: "name: '${file.name}-${file.name}'",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${file.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'a truth stands inside a text',
      entry: entryOf({
        value: "top: 'is ${file.isTop}'",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${file.isTop}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'a truth stands as a key',
      entry: entryOf({
        value: "'${workspace.isRoot}': 1",
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${workspace.isRoot}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'the path of its file names a fact but a role',
      entry: entryOf({
        file: '${package.name}.json',
      }),
      finding: {
        code: PresetsCode.UnknownFact,
        details: {
          block: BlockId.create('biome'),
          fact: '${package.name}',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it names a role no term carries',
      entry: entryOf({
        value: 'files: ${role.gone}',
      }),
      finding: {
        code: PresetsCode.UnknownRole,
        details: {
          block: BlockId.create('biome'),
          role: 'gone',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it types a folder by hand',
      entry: entryOf({
        value: 'files: src/**',
      }),
      finding: {
        code: PresetsCode.HandTypedRole,
        details: {
          block: BlockId.create('biome'),
          role: 'source',
          term: 'src/',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'it types a suffix by hand',
      entry: entryOf({
        value: "files: '**/*.adapter.ts'",
      }),
      finding: {
        code: PresetsCode.HandTypedRole,
        details: {
          block: BlockId.create('biome'),
          role: 'gateway-file',
          term: '.adapter',
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'the members stand as a value',
      entry: entryOf({
        value: 'skip: ${workspace.members}',
      }),
      finding: {
        code: PresetsCode.MembersOutsideList,
        details: {
          block: BlockId.create('biome'),
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
    {
      condition: 'the members stand as a key',
      entry: entryOf({
        value: "'${workspace.members}': 1",
      }),
      finding: {
        code: PresetsCode.MembersOutsideList,
        details: {
          block: BlockId.create('biome'),
          rule: '*',
        },
        path: FOUNDATION,
      },
    },
  ])('should find what an entry names wrongly when $condition', ({ entry, finding }) => {
    // Act
    const found = findingsOf({
      presets: {
        'biome/foundation.yaml': entry,
      },
    });

    // Assert
    expect(found).toStrictEqual([
      finding,
    ]);
  });

  it('should find each map an entry marks sorted in a file whose format keeps no order of its keys, and none in a file whose format keeps it', () => {
    // Act
    const found = findingsOf({
      presets: {
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        overrides: !sorted {}',
          '      pyproject.toml:',
          '        tool: {poe: {tasks: !sorted {}}}',
          '      .editorconfig:',
          "        '*': !sorted {indent_size: 2}",
        ].join('\n'),
      },
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.SortedInUnsortableFile,
        details: {
          block: BlockId.create('biome'),
          file: 'pyproject.toml',
          rule: '*',
          setting: 'tool.poe.tasks',
        },
        path: FOUNDATION,
      },
      {
        code: PresetsCode.SortedInUnsortableFile,
        details: {
          block: BlockId.create('biome'),
          file: '.editorconfig',
          rule: '*',
          setting: '*',
        },
        path: FOUNDATION,
      },
    ]);
  });

  it('should find only the unknown role, and no misplacement, when an entry under a with/ path names a role no term carries', () => {
    // Arrange
    // a release's every term carries an id, as its blocks' check holds them to
    const model = BlockModel.create({
      ...presetsModel,
      roles: presetsModel.roles.filter(({ id }) => id !== undefined),
    });

    // Act
    const found = findingsOf({
      model,
      presets: {
        'biome/foundation/with/git.yaml': entryOf({
          value: "files: ['${role.gone}', '**/*${role.ignore-file}']",
        }),
      },
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.UnknownRole,
        details: {
          block: BlockId.create('biome'),
          role: 'gone',
          rule: '*',
        },
        path: 'presets/biome/foundation/with/git.yaml',
      },
    ]);
  });

  it('should find the release’s files its entries name and lack, and its plugins no entry names or that name no rule, a name that is no slug among them', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': entryOf({
        value:
          "plugins: ['${constitution.path}/presets/biome/plugins/typescript/gone.grit', '${constitution.path}/${role.gone}/x']",
      }),
      'biome/plugins/typescript/file-within-500-lines.grit': 'language js',
      'biome/plugins/typescript/no-such-rule.grit': 'language js',
      'biome/plugins/typescript/no_slug.grit': 'language js',
    };

    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.UnknownRole,
        details: {
          block: BlockId.create('biome'),
          role: 'gone',
          rule: '*',
        },
        path: FOUNDATION,
      },
      {
        code: PresetsCode.MissingDistributionFile,
        details: {
          file: 'presets/biome/plugins/typescript/gone.grit',
        },
        path: FOUNDATION,
      },
      {
        code: PresetsCode.PluginUnreferenced,
        details: {},
        path: 'presets/biome/plugins/typescript/file-within-500-lines.grit',
      },
      {
        code: PresetsCode.PluginNamesNoRule,
        details: {
          rule: 'no-such-rule',
        },
        path: 'presets/biome/plugins/typescript/no-such-rule.grit',
      },
      {
        code: PresetsCode.PluginUnreferenced,
        details: {},
        path: 'presets/biome/plugins/typescript/no-such-rule.grit',
      },
      {
        code: PresetsCode.PluginNamesNoRule,
        details: {
          rule: 'no_slug',
        },
        path: 'presets/biome/plugins/typescript/no_slug.grit',
      },
      {
        code: PresetsCode.PluginUnreferenced,
        details: {},
        path: 'presets/biome/plugins/typescript/no_slug.grit',
      },
    ]);
  });

  it.each([
    {
      distributed: [],
      condition: 'the distribution packs none',
      expected: [
        'tools/gone.js',
      ],
    },
    {
      distributed: [
        'tools/gone.js',
      ],
      condition: 'the distribution packs it from a package that builds it',
      expected: [],
    },
  ])(
    'should find a file of the release it lacks only when $condition',
    ({ distributed, expected }) => {
      // Arrange
      const presets = {
        'biome/foundation.yaml': entryOf({
          value: "plugins: ['${constitution.path}/tools/gone.js']",
        }),
      };

      // Act
      const found = findingsOf({
        distributed,
        presets,
      });

      // Assert
      expect(found.map(({ details }) => details)).toStrictEqual(
        expected.map((file) => ({
          file,
        })),
      );
    },
  );

  it('should read a role in the path of a release file, a folder by its name, and no whole file a default writes', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        "    '*':",
        '      biome.json:',
        "        plugins: ['${constitution.path}/${role.source}/gone.js', '${constitution.path}/presets/biome/']",
        '      notes.txt: !default |',
        '        see ${constitution.path}/gone',
      ].join('\n'),
    };

    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.MissingDistributionFile,
        details: {
          file: 'src/gone.js',
        },
        path: FOUNDATION,
      },
    ]);
  });

  it('should hold a pack checked in its own folder to the terms’ ids', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': entryOf({
        value: 'files: src/**',
      }),
    };

    // Act
    const found = findingsOf({
      source: BlockSource.create(PackPath.create('.')),
      presets,
    });

    // Assert
    expect(found.map(({ code }) => code)).toStrictEqual([
      PresetsCode.HandTypedRole,
    ]);
  });

  it('should hold a pack to its own preset files alone, and never to the release’s files', () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': entryOf({
        value: "plugin: '${constitution.path}/presets/gone.grit'",
      }),
      'biome/plugins/typescript/no-such-rule.grit': 'language js',
    };

    // Act
    const found = findingsOf({
      source: BlockSource.create(PackPath.create('.')),
      presets,
    });

    // Assert
    expect(found).toStrictEqual([]);
  });

  it("should find the clashes and missing slots of every entry of a file or of the unit's run taken at once, but none in a file whose entries only insert", () => {
    // Arrange
    const presets = {
      'biome/foundation.yaml': [
        'biome:',
        "  '*':",
        '    typescript:',
        '      biome.json:',
        '        width: 100',
        '      knip.json:',
        '        ignore:',
        '          - dist',
        '      ${constitution.run}:',
        '        fix: biome',
      ].join('\n'),
      'biome/foundation/with/css/with/browser.yaml': [
        'css:',
        '  css-loaded-by-the-bundle:',
        "    '*':",
        '      biome.json:',
        '        width: 80',
        '      lefthook.yaml:',
        '        jobs@checks:',
        '          - lint',
        '      knip.json:',
        '        ignore@own:',
        '          - coverage',
        '      ${constitution.run}:',
        '        fix: stylelint',
      ].join('\n'),
    };

    // Act
    const found = findingsOf({
      presets,
    });

    // Assert
    expect(found).toStrictEqual([
      {
        code: PresetsCode.Clash,
        details: {
          setting: 'width',
          sources: [
            'presets/biome/foundation/with/css/with/browser.yaml: css → css-loaded-by-the-bundle',
            'presets/biome/foundation.yaml: biome → *',
          ],
        },
        path: 'biome.json',
      },
      {
        code: PresetsCode.MissingSlot,
        details: {
          setting: 'ignore',
          slot: 'own',
        },
        path: 'knip.json',
      },
      {
        code: PresetsCode.Clash,
        details: {
          setting: 'fix',
          sources: [
            'presets/biome/foundation/with/css/with/browser.yaml: css → css-loaded-by-the-bundle',
            'presets/biome/foundation.yaml: biome → *',
          ],
        },
        path: '${constitution.run}',
      },
    ]);
  });
});
