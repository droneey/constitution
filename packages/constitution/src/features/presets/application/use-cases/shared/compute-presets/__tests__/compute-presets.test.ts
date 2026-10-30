import { describe, expect, it } from 'bun:test';

import { Axis, RELEASE_FOLDER_PATH } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectUnit } from '#/kernel/entities';
import { BlockId, UnitRelativePath } from '#/kernel/value-objects';

import { createFakeConfigurationFormat } from '../../../../../__tests__/configuration-format.fake';
import { createFakeDistributionSources } from '../../../../../__tests__/distribution-sources.fake';
import type { Files } from '../../../../../__tests__/presets.fixtures';
import {
  PROJECT,
  presetFileParser,
  projectFiles,
  projectOf,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
import type { PresetsPlan, Setting } from '../../../../../domain/entities';
import { PresetsCode, WholeKind } from '../../../../../domain/entities';
import { FileFormat } from '../../../../../domain/value-objects';
import { computePresets } from '../compute-presets';

const planOf = (input: {
  files: Files;
  packs?: readonly string[];
  units: readonly ProjectUnit[];
}): PresetsPlan => {
  const { files, project } = projectOf(input);

  return computePresets({
    distribution: createFakeDistributionSources(),
    formats: createFakeConfigurationFormat(),
    files,
    parser: presetFileParser,
    project,
  });
};

const writtenOf = (plan: PresetsPlan) =>
  plan.files.map(({ filePath, merged, unitPath }) => ({
    file: String(filePath),
    merged,
    unit: String(unitPath),
  }));

interface Written {
  readonly file: string;
  readonly value: Setting | undefined;
}

const valuesOf = (plan: PresetsPlan): readonly Written[] =>
  plan.files.map(({ filePath, merged }) => ({
    file: String(filePath),
    value: merged.value,
  }));

const factsPlanOf = (lines: readonly string[]): PresetsPlan =>
  planOf({
    files: {
      ...releasePresets({
        'bun/foundation.yaml': [
          'bun:',
          "  '*':",
          "    '*':",
          ...lines,
        ].join('\n'),
      }),
      ...projectFiles({
        'packages/app/.droneey/constitution/presets/bun/fixture.ts': '',
      }),
    },
    units: [
      unitOf({
        blocks: [
          'core',
          'bun',
          'typescript',
        ],
        name: 'repo',
      }),
      unitOf({
        blocks: [
          'core',
          'bun',
          'typescript',
        ],
        name: 'app',
        path: 'packages/app',
      }),
      unitOf({
        blocks: [
          'core',
          'bun',
        ],
        path: 'packages/kit',
      }),
    ],
  });

const lefthookPlanOf = (lines: readonly string[]): PresetsPlan =>
  planOf({
    files: releasePresets({
      'lefthook/workflow.yaml': [
        'lefthook:',
        "  '*':",
        "    '*':",
        ...lines,
      ].join('\n'),
    }),
    units: [
      unitOf({
        blocks: [
          'core',
          'lefthook',
        ],
      }),
    ],
  });

const INSERTING_ENTRY = [
  'lefthook:',
  "  '*':",
  "    '*':",
  '      lefthook.yaml:',
  '        jobs@checks:',
  '          - lint',
  '        kept: 1',
] as const;

const placingEntryOf = (rule: string): readonly string[] => [
  'core:',
  `  ${rule}:`,
  "    '*':",
  '      lefthook.yaml:',
  '        jobs:',
  '          - slot: checks',
  '          - format',
];

const mergeCodes: ReadonlySet<PresetsCode> = new Set([
  PresetsCode.Clash,
  PresetsCode.MissingSlot,
  PresetsCode.SlotInNoList,
]);

describe('computePresets', () => {
  it("should give each unit the entries its blocks, languages, axes and rules take, in their order, and none of another's", () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'biome/architecture.yaml': [
          'core:',
          '  import-points-inward:',
          "    '*':",
          '      biome.json:',
          '        layers: true',
        ].join('\n'),
        'biome/foundation.yaml': [
          'core:',
          '  file-within-500-lines:',
          '    typescript:',
          '      biome.json:',
          '        lines: 500',
          '    css:',
          '      biome.json:',
          '        css: true',
          '  css-loaded-by-the-bundle:',
          "    '*':",
          '      biome.json:',
          '        bundled: true',
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
        'biome/foundation/with/ui.yaml': [
          'ui:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        ui: true',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'typescript',
            'json',
            'css',
            'biome',
          ],
          languages: [
            'typescript',
            'json',
          ],
        }),
        unitOf({
          axes: [
            Axis.Foundation,
          ],
          blocks: [
            'core',
            'typescript',
            'biome',
          ],
          languages: [
            'typescript',
          ],
          lowered: [
            'file-within-500-lines',
          ],
          path: 'packages/kit',
        }),
        unitOf({
          blocks: [
            'core',
          ],
          path: 'packages/plain',
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(writtenOf(plan)).toStrictEqual([
      {
        file: 'biome.json',
        merged: {
          defaults: [],
          problems: [],
          value: {
            layers: true,
            lines: 500,
            width: 100,
          },
        },
        unit: '',
      },
      {
        file: 'packages/kit/biome.json',
        merged: {
          defaults: [],
          problems: [],
          value: {
            width: 100,
          },
        },
        unit: 'packages/kit',
      },
    ]);
  });

  it("should serve a reader only the repository's unit follows by its file alone, over the blocks and languages of every unit and the rules the repository lowers", () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'lefthook/workflow.yaml': [
          'lefthook:',
          "  '*':",
          "    '*':",
          '      lefthook.yaml:',
          '        exclude:',
          "          - '${workspace.members}/**'",
          '          - docs/**',
          'core:',
          '  commit-checked-by-hooks:',
          "    '*':",
          '      lefthook.yaml:',
          '        hooks: true',
          'typescript:',
          "  '*':",
          '    typescript:',
          '      lefthook.yaml:',
          '        jobs:',
          '          - tsc',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'lefthook',
          ],
          lowered: [
            'commit-checked-by-hooks',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'typescript',
          ],
          languages: [
            'typescript',
          ],
          path: 'packages/kit',
        }),
        unitOf({
          path: 'apps/web',
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(writtenOf(plan)).toStrictEqual([
      {
        file: 'lefthook.yaml',
        merged: {
          defaults: [],
          problems: [],
          value: {
            exclude: [
              'apps/web/**',
              'packages/kit/**',
              'docs/**',
            ],
            jobs: [
              'tsc',
            ],
          },
        },
        unit: '',
      },
    ]);
  });

  it('should name the blocks that write each file by its path from its unit, its roles named, whatever a unit takes, and no file of a role no term defines or out of its unit', () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      ./biome.json:',
          '        width: 100',
          "      '${role.source}/biome.json':",
          '        width: 100',
          "      '${role.gone}/biome.json':",
          '        width: 100',
          '      ../outside.json:',
          '        width: 100',
          '      ${constitution.run}:',
          '        check:',
          '          - biome check',
        ].join('\n'),
      }),
      units: [],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(plan.blockIds).toStrictEqual(
      new Map([
        [
          UnitRelativePath.create('biome.json'),
          [
            BlockId.create('biome'),
          ],
        ],
        [
          UnitRelativePath.create('src/biome.json'),
          [
            BlockId.create('biome'),
          ],
        ],
      ]),
    );
  });

  it.each<{
    condition: string;
    lines: readonly string[];
    written: Setting;
  }>([
    {
      condition: 'under a key',
      lines: [
        '        command: !words',
        '          - biome ${package.name}',
        '          - slot: paths',
        '        command@paths:',
        '          - src',
      ],
      written: {
        command: 'biome kit src',
      },
    },
    {
      condition: 'in an element of a list found by its field',
      lines: [
        '        jobs[name=lint]:',
        '          run: !words',
        '            - biome ${package.name}',
        '            - slot: paths',
        '          run@paths:',
        '            - src',
      ],
      written: {
        'jobs[name=lint]': {
          run: 'biome kit src',
        },
      },
    },
  ])(
    'should write a list marked as words $condition as one text, the items inserted at its slots among them',
    ({ lines, written }) => {
      // Arrange
      const asked = {
        files: releasePresets({
          'biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            ...lines,
          ].join('\n'),
        }),
        units: [
          unitOf({
            blocks: [
              'core',
              'biome',
            ],
            name: 'kit',
          }),
        ],
      };

      // Act
      const plan = planOf(asked);

      // Assert
      expect(plan.files.map(({ merged }) => merged.value)).toStrictEqual([
        written,
      ]);
    },
  );

  it('should mark what the block gives each file of whatever shape, and nothing a default gives', () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      .gitignore:',
          '        - dist/',
          '      biome.json:',
          '        width: 100',
          '      tombi.toml: !default',
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
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(
      plan.files.map((one) =>
        Object.fromEntries(
          Object.entries(one).filter(([key]) => key === 'filePath' || key === 'marks'),
        ),
      ),
    ).toStrictEqual([
      {
        filePath: '.gitignore',
        marks: {
          blocks: [
            'biome',
          ],
          marks: [
            {
              block: 'biome',
              keyPath: [
                {
                  item: 'dist/',
                },
              ],
            },
          ],
        },
      },
      {
        filePath: 'biome.json',
        marks: {
          blocks: [
            'biome',
          ],
          marks: [
            {
              block: 'biome',
              keyPath: [
                'width',
              ],
            },
          ],
        },
      },
      {
        filePath: 'tombi.toml',
      },
    ]);
  });

  it('should merge the entries of a file in the order of their blocks, axes, sources and preset files', () => {
    // Arrange
    const asked = {
      files: {
        ...releasePresets({
          'biome/architecture.yaml': [
            'core:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - core-architecture',
          ].join('\n'),
          'biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - biome',
            'workspace:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - workspace',
            'core:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - core',
            'browser:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - browser',
            'json:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - json',
          ].join('\n'),
          'biome/foundation/with/workspace.yaml': [
            'workspace:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - workspace-seam',
          ].join('\n'),
        }),
        ...projectFiles({
          'packs/acme/presets/biome/foundation.yaml': [
            'core:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        order:',
            '          - core-pack',
          ].join('\n'),
        }),
      },
      packs: [
        'packs/acme',
      ],
      units: [
        unitOf({
          blocks: [
            'core',
            'workspace',
            'json',
            'browser',
            'biome',
          ],
          packs: [
            'packs/acme',
          ],
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(plan.files[0]?.merged.value).toStrictEqual({
      order: [
        'core',
        'core-pack',
        'core-architecture',
        'workspace',
        'workspace-seam',
        'browser',
        'json',
        'biome',
      ],
    });
  });

  it('should take a pack’s entries only in the units that list the pack', () => {
    // Arrange
    const asked = {
      files: projectFiles({
        'packs/acme/presets/biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        acme: true',
        ].join('\n'),
      }),
      packs: [
        'packs/acme',
      ],
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
          packs: [
            'packs/acme',
          ],
          path: 'packages/kit',
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(writtenOf(plan).map(({ file }) => file)).toStrictEqual([
      'packages/kit/biome.json',
    ]);
  });

  it("should take an entry where its unit's folder equals the guard's text, and keep a file's format mark", () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'bun/foundation.yaml': [
          'bun:',
          "  '*':",
          "    '*':",
          '      apps.json ? ${unit.parent} = apps:',
          '        depth: ${unit.depth}',
          '        parent: ${unit.parent}',
          '      other.json ? !${unit.parent} = apps:',
          '        other: true',
          '      never.json ? ${unit.parent} = ${role.source}:',
          '        never: true',
          '      same.json ? ${unit.parent} = ${unit.parent}:',
          '        same: true',
          '      odd.json:',
          '        odd: x${file.isTop}',
          '      config.json:',
          '        depth: 1',
          '      config.json !jsonc:',
          '        width: 100',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'bun',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'bun',
          ],
          path: 'apps/web',
        }),
        unitOf({
          blocks: [
            'core',
            'bun',
          ],
          path: 'apps/eros/languages/ts',
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect({
      files: plan.files.map((one) =>
        Object.fromEntries(
          Object.entries(one).filter(([key]) =>
            [
              'filePath',
              'format',
              'merged',
            ].includes(key),
          ),
        ),
      ),
      findings: plan.findings,
    }).toStrictEqual({
      files: [
        {
          filePath: 'apps/eros/languages/ts/apps.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              depth: '3',
              parent: 'apps',
            },
          },
        },
        {
          filePath: 'apps/eros/languages/ts/config.json',
          format: FileFormat.Jsonc,
          merged: {
            defaults: [],
            problems: [],
            value: {
              depth: 1,
              width: 100,
            },
          },
        },
        {
          filePath: 'apps/eros/languages/ts/same.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              same: true,
            },
          },
        },
        {
          filePath: 'apps/web/apps.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              depth: '1',
              parent: 'apps',
            },
          },
        },
        {
          filePath: 'apps/web/config.json',
          format: FileFormat.Jsonc,
          merged: {
            defaults: [],
            problems: [],
            value: {
              depth: 1,
              width: 100,
            },
          },
        },
        {
          filePath: 'apps/web/same.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              same: true,
            },
          },
        },
        {
          filePath: 'config.json',
          format: FileFormat.Jsonc,
          merged: {
            defaults: [],
            problems: [],
            value: {
              depth: 1,
              width: 100,
            },
          },
        },
        {
          filePath: 'other.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              other: true,
            },
          },
        },
      ],
      findings: [
        {
          code: PresetsCode.UnknownFact,
          details: {
            block: BlockId.create('bun'),
            fact: '${file.isTop}',
            rule: '*',
          },
          path: '.droneey/constitution/presets/bun/foundation.yaml',
        },
      ],
    });
  });

  it.each<{
    condition: string;
    lines: readonly string[];
    written: readonly Written[];
  }>([
    {
      condition:
        'the fact is the path to the Constitution, by the nearest link at or above the file',
      lines: [
        '      bunfig.toml:',
        '        preload: ${constitution.path}/presets/bun/fixture.ts',
      ],
      written: [
        {
          file: 'bunfig.toml',
          value: {
            preload: '.droneey/constitution/presets/bun/fixture.ts',
          },
        },
        {
          file: 'packages/app/bunfig.toml',
          value: {
            preload: '.droneey/constitution/presets/bun/fixture.ts',
          },
        },
        {
          file: 'packages/kit/bunfig.toml',
          value: {
            preload: '../../.droneey/constitution/presets/bun/fixture.ts',
          },
        },
      ],
    },
    {
      condition: 'the facts are roles',
      lines: [
        '      bunfig.toml:',
        '        preload: ${role.source}/setup.${role.typescript-source}',
      ],
      written: [
        {
          file: 'bunfig.toml',
          value: {
            preload: 'src/setup.ts',
          },
        },
        {
          file: 'packages/app/bunfig.toml',
          value: {
            preload: 'src/setup.ts',
          },
        },
        {
          file: 'packages/kit/bunfig.toml',
          value: {
            preload: 'src/setup.ts',
          },
        },
      ],
    },
    {
      condition: 'the fact is whether the file is at the top',
      lines: [
        '      bunfig.toml:',
        '        top: ${file.isTop}',
      ],
      written: [
        {
          file: 'bunfig.toml',
          value: {
            top: true,
          },
        },
        {
          file: 'packages/app/bunfig.toml',
          value: {
            top: false,
          },
        },
        {
          file: 'packages/kit/bunfig.toml',
          value: {
            top: false,
          },
        },
      ],
    },
    {
      condition: 'the fact is whether the unit holds members, as an item of a list',
      lines: [
        '      bunfig.toml:',
        '        roots:',
        '          - ${workspace.isRoot}',
      ],
      written: [
        {
          file: 'bunfig.toml',
          value: {
            roots: [
              true,
            ],
          },
        },
        {
          file: 'packages/app/bunfig.toml',
          value: {
            roots: [
              false,
            ],
          },
        },
        {
          file: 'packages/kit/bunfig.toml',
          value: {
            roots: [
              false,
            ],
          },
        },
      ],
    },
    {
      condition: 'the fact is whether the unit holds members, in a map that is an item of a list',
      lines: [
        '      bunfig.toml:',
        '        items:',
        '          - root: ${workspace.isRoot}',
      ],
      written: [
        {
          file: 'bunfig.toml',
          value: {
            items: [
              {
                root: true,
              },
            ],
          },
        },
        {
          file: 'packages/app/bunfig.toml',
          value: {
            items: [
              {
                root: false,
              },
            ],
          },
        },
        {
          file: 'packages/kit/bunfig.toml',
          value: {
            items: [
              {
                root: false,
              },
            ],
          },
        },
      ],
    },
    {
      condition:
        'the guard asks for the path to the Constitution, which the entry names nowhere else',
      lines: [
        '      bunfig.toml ? ${constitution.path} = .droneey/constitution:',
        '        guarded: true',
      ],
      written: [
        {
          file: 'bunfig.toml',
          value: {
            guarded: true,
          },
        },
        {
          file: 'packages/app/bunfig.toml',
          value: {
            guarded: true,
          },
        },
      ],
    },
    {
      condition: "the fact is the unit's name, which a unit may lack",
      lines: [
        '      package.json:',
        '        name: ${package.name}',
      ],
      written: [
        {
          file: 'package.json',
          value: {
            name: 'repo',
          },
        },
        {
          file: 'packages/app/package.json',
          value: {
            name: 'app',
          },
        },
      ],
    },
  ])(
    'should give a file the value of a fact as its unit has it when $condition',
    ({ lines, written }) => {
      // Act
      const plan = factsPlanOf(lines);

      // Assert
      expect(valuesOf(plan)).toStrictEqual(written);
    },
  );

  it.each<{
    condition: string;
    files: string[];
    guarded: string;
  }>([
    {
      condition: 'the guard asks for the file at the top',
      files: [
        'bunfig.toml',
      ],
      guarded: '      bunfig.toml ? ${file.isTop}:',
    },
    {
      condition: 'the guard denies that the unit holds members',
      files: [
        'packages/app/bunfig.toml',
        'packages/kit/bunfig.toml',
      ],
      guarded: '      bunfig.toml ? !${workspace.isRoot}:',
    },
  ])(
    'should take an entry only where its guard of a truth holds when $condition',
    ({ files, guarded }) => {
      // Act
      const plan = factsPlanOf([
        guarded,
        '        install: 3',
      ]);

      // Assert
      expect(valuesOf(plan).map(({ file }) => file)).toStrictEqual(files);
    },
  );

  it("should walk the folders for the Constitution's path once for an entry that names it twice, and not for a file that names it nowhere", () => {
    // Arrange
    const { files, project } = projectOf({
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      twice.json:',
          '        first: ${constitution.path}',
          '        second: ${constitution.path}/presets',
          '      plain.json:',
          '        width: 1',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
          path: 'packages/kit',
        }),
      ],
    });
    const walked: string[] = [];
    const counted: ProjectFiles = {
      ...files,
      isFolder: (path) => {
        walked.push(path);

        return files.isFolder(path);
      },
    };

    // Act
    computePresets({
      distribution: createFakeDistributionSources(),
      formats: createFakeConfigurationFormat(),
      files: counted,
      parser: presetFileParser,
      project,
    });

    // Assert
    expect(walked.filter((path) => path.endsWith(RELEASE_FOLDER_PATH))).toStrictEqual([
      `${PROJECT}/packages/kit/${RELEASE_FOLDER_PATH}`,
      `${PROJECT}/packages/${RELEASE_FOLDER_PATH}`,
      `${PROJECT}/${RELEASE_FOLDER_PATH}`,
    ]);
  });

  it("should write a whole file's default at the path its roles name, in each unit", () => {
    // Act
    const plan = factsPlanOf([
      "      '${role.source}/index.${role.typescript-source}': !default |",
      '        export {};',
    ]);

    // Assert
    expect(writtenOf(plan)).toStrictEqual([
      {
        file: 'packages/app/src/index.ts',
        merged: {
          defaults: [],
          problems: [],
          whole: {
            kind: WholeKind.Text,
            text: 'export {};\n',
          },
        },
        unit: 'packages/app',
      },
      {
        file: 'packages/kit/src/index.ts',
        merged: {
          defaults: [],
          problems: [],
          whole: {
            kind: WholeKind.Text,
            text: 'export {};\n',
          },
        },
        unit: 'packages/kit',
      },
      {
        file: 'src/index.ts',
        merged: {
          defaults: [],
          problems: [],
          whole: {
            kind: WholeKind.Text,
            text: 'export {};\n',
          },
        },
        unit: '',
      },
    ]);
  });

  it.each<{
    condition: string;
    rootBlocks: string[];
    written: readonly Written[];
  }>([
    {
      condition: 'the unit above takes the file from another block alone',
      rootBlocks: [
        'core',
        'python',
      ],
      written: [
        {
          file: 'packages/app/pyproject.toml',
          value: {
            tool: {
              uv: {},
            },
          },
        },
        {
          file: 'pyproject.toml',
          value: {
            project: {},
          },
        },
      ],
    },
    {
      condition: 'the unit above gets the same entry',
      rootBlocks: [
        'core',
        'python',
        'uv',
      ],
      written: [
        {
          file: 'pyproject.toml',
          value: {
            project: {},
            tool: {
              uv: {},
            },
          },
        },
      ],
    },
  ])(
    'should guard an entry by the units above that get it when $condition',
    ({ rootBlocks, written }) => {
      // Arrange
      const asked = {
        files: releasePresets({
          'python/foundation.yaml': [
            'python:',
            "  '*':",
            "    '*':",
            '      pyproject.toml:',
            '        project: {}',
          ].join('\n'),
          'uv/foundation.yaml': [
            'uv:',
            "  '*':",
            "    '*':",
            '      pyproject.toml ? ${file.isTop}:',
            '        tool:',
            '          uv: {}',
          ].join('\n'),
        }),
        units: [
          unitOf({
            blocks: rootBlocks,
          }),
          unitOf({
            blocks: [
              'core',
              'uv',
            ],
            path: 'packages/app',
          }),
        ],
      };

      // Act
      const plan = planOf(asked);

      // Assert
      expect(valuesOf(plan)).toStrictEqual(written);
    },
  );

  it('should give what constitution runs apart from the files, each list in the slots its runner places', () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'bun/foundation.yaml': [
          'bun:',
          "  '*':",
          "    '*':",
          '      ${constitution.run}:',
          '        check:',
          '          - slot: checks',
          '          - slot: tests',
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
          '        check@tests:',
          '          - bun run test',
          '        check@checks:',
          '          - bun run check',
          '        fix:',
          '          - bun run fix',
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
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect({
      files: writtenOf(plan).map(({ file }) => file),
      runs: plan.runs.map(({ commands, unitPath }) => ({
        commands: Object.fromEntries(commands),
        unit: String(unitPath),
      })),
    }).toStrictEqual({
      files: [
        'package.json',
      ],
      runs: [
        {
          commands: {
            check: [
              'bun run check',
              'bun run test',
            ],
            fix: [
              'bun run fix',
            ],
          },
          unit: '',
        },
      ],
    });
  });

  it.each([
    {
      condition: 'a unit takes a tool and none of its runners',
      findings: [
        {
          code: PresetsCode.ToolWithoutRunner,
          details: {
            block: BlockId.create('biome'),
          },
          path: 'packages/kit/constitution.yaml',
        },
      ],
      units: [
        unitOf({
          blocks: [
            'core',
            'bun',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
          path: 'packages/kit',
        }),
      ],
    },
    {
      condition: 'the unit takes the tool and its runner',
      findings: [],
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
            'bun',
          ],
        }),
      ],
    },
    {
      condition: "the tool's block pairs only with a block that runs nothing",
      findings: [],
      units: [
        unitOf({
          blocks: [
            'core',
            'css',
          ],
        }),
      ],
    },
  ])('should find a tool no runner of a unit runs when $condition', ({ findings, units }) => {
    // Arrange
    const asked = {
      files: releasePresets({
        'biome/foundation/with/css.yaml': [
          'css:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        css: true',
        ].join('\n'),
        'bun/foundation.yaml': [
          'bun:',
          "  '*':",
          "    '*':",
          '      ${constitution.run}:',
          '        check:',
          '          - bun run check',
        ].join('\n'),
        'bun/foundation/with/biome.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      package.json:',
          '        scripts:',
          '          check:lint: biome check',
        ].join('\n'),
      }),
      units,
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(plan.findings).toStrictEqual(findings);
  });

  it.each([
    {
      condition: 'an entry point is a command, not a list, beside one that is a list',
      lines: [
        '        check: bun run check',
        '        fix:',
        '          - bun run fix',
      ],
    },
    {
      condition: 'a list holds what is no command beside a command',
      lines: [
        '        check:',
        '          - bun run check',
        '          - 1',
      ],
    },
    {
      condition: 'the run is no map of entry points',
      lines: [
        '        - bun run check',
      ],
    },
    {
      condition: 'a list of commands is named after no entry point',
      lines: [
        '        check:',
        '          - bun run check',
        '        tests:',
        '          - bun run test',
      ],
    },
  ])('should find a run of another shape and run nothing when $condition', ({ lines }) => {
    // Arrange
    const asked = {
      files: releasePresets({
        'lefthook/foundation.yaml': [
          'lefthook:',
          "  '*':",
          "    '*':",
          '      ${constitution.run}:',
          ...lines,
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'lefthook',
          ],
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect({
      findings: plan.findings,
      runs: plan.runs,
    }).toStrictEqual({
      findings: [
        {
          code: PresetsCode.RunMisshapen,
          details: {},
          path: 'constitution.yaml',
        },
      ],
      runs: [],
    });
  });

  it.each<{
    condition: string;
    lines: readonly string[];
    written: readonly Written[];
  }>([
    {
      condition: 'a list holds the members beside another item',
      lines: [
        '      lefthook.yaml:',
        '        exclude:',
        "          - '${workspace.members}/**'",
        '          - docs/**',
      ],
      written: [
        {
          file: 'lefthook.yaml',
          value: {
            exclude: [
              'docs/**',
            ],
          },
        },
      ],
    },
    {
      condition: 'a list holds only the members, beside another setting',
      lines: [
        '      lefthook.yaml:',
        '        skip:',
        "          - '${workspace.members}/**'",
        '        kept: 1',
      ],
      written: [
        {
          file: 'lefthook.yaml',
          value: {
            kept: 1,
          },
        },
      ],
    },
    {
      condition: 'the file holds only a list of the members',
      lines: [
        '      lefthook.yaml:',
        '        skip:',
        "          - '${workspace.members}'",
      ],
      written: [],
    },
    {
      condition: 'a list holds only a list of the members',
      lines: [
        '      lefthook.yaml:',
        '        nested:',
        '          - - ${workspace.members}',
      ],
      written: [
        {
          file: 'lefthook.yaml',
          value: {
            nested: [],
          },
        },
      ],
    },
  ])('should leave out what the members empty when $condition', ({ lines, written }) => {
    // Act
    const plan = lefthookPlanOf(lines);

    // Assert
    expect(valuesOf(plan)).toStrictEqual(written);
  });

  it.each<{
    condition: string;
    lines: readonly string[];
    written: readonly Written[];
  }>([
    {
      condition: 'no entry of the file places the list',
      lines: [
        '      lefthook.yaml:',
        '        jobs@checks:',
        '          - lint',
      ],
      written: [],
    },
    {
      condition: 'an entry of the file places the list',
      lines: [
        '      lefthook.yaml:',
        '        jobs:',
        '          - slot: checks',
        'core:',
        "  '*':",
        "    '*':",
        '      lefthook.yaml:',
        '        jobs@checks:',
        '          - lint',
      ],
      written: [
        {
          file: 'lefthook.yaml',
          value: {
            jobs: [
              'lint',
            ],
          },
        },
      ],
    },
  ])(
    'should write what an entry inserts into a list only where an entry places the list when $condition',
    ({ lines, written }) => {
      // Act
      const plan = lefthookPlanOf(lines);

      // Assert
      expect(valuesOf(plan)).toStrictEqual(written);
    },
  );

  it.each<{
    codes: readonly PresetsCode[];
    condition: string;
    presets: Files;
    written: Setting;
  }>([
    {
      codes: [],
      condition: 'its unit takes the entry that places the list',
      presets: {
        'lefthook/foundation.yaml': [
          ...placingEntryOf('file-within-500-lines'),
          ...INSERTING_ENTRY,
        ].join('\n'),
      },
      written: {
        jobs: [
          'lint',
          'format',
        ],
        kept: 1,
      },
    },
    {
      codes: [],
      condition: 'an override lowers the rule of the entry that places the list',
      presets: {
        'lefthook/foundation.yaml': [
          ...placingEntryOf('unit-checked-by-its-own-tools'),
          ...INSERTING_ENTRY,
        ].join('\n'),
      },
      written: {
        kept: 1,
      },
    },
    {
      codes: [],
      condition: 'its unit follows no axis of the rule of the entry that places the list',
      presets: {
        'lefthook/architecture.yaml': placingEntryOf('import-points-inward').join('\n'),
        'lefthook/foundation.yaml': INSERTING_ENTRY.join('\n'),
      },
      written: {
        kept: 1,
      },
    },
    {
      codes: [],
      condition: 'an entry the unit takes gives the list and a dropped one places the slot',
      presets: {
        'lefthook/architecture.yaml': placingEntryOf('import-points-inward').join('\n'),
        'lefthook/foundation.yaml': [
          'core:',
          '  file-within-500-lines:',
          "    '*':",
          '      lefthook.yaml:',
          '        jobs:',
          '          - test',
          ...INSERTING_ENTRY,
        ].join('\n'),
      },
      written: {
        jobs: [
          'test',
        ],
        kept: 1,
      },
    },
    {
      codes: [
        PresetsCode.SlotInNoList,
      ],
      condition: 'the entry that places the list lacks a block its path names',
      presets: {
        'lefthook/foundation.yaml': INSERTING_ENTRY.join('\n'),
        'lefthook/foundation/with/bun.yaml': placingEntryOf('file-within-500-lines').join('\n'),
      },
      written: {
        kept: 1,
      },
    },
    {
      codes: [
        PresetsCode.SlotInNoList,
      ],
      condition: 'the dropped entry whose guard does not hold places the list',
      presets: {
        'lefthook/foundation.yaml': [
          'core:',
          '  unit-checked-by-its-own-tools:',
          "    '*':",
          '      lefthook.yaml ? !${file.isTop}:',
          '        jobs:',
          '          - slot: checks',
          ...INSERTING_ENTRY,
        ].join('\n'),
      },
      written: {
        kept: 1,
      },
    },
    {
      codes: [
        PresetsCode.SlotInNoList,
      ],
      condition: 'a dropped entry gives the file only what places no list',
      presets: {
        'lefthook/architecture.yaml': [
          'core:',
          '  import-points-inward:',
          "    '*':",
          '      lefthook.yaml:',
          '        other: 2',
        ].join('\n'),
        'lefthook/foundation.yaml': INSERTING_ENTRY.join('\n'),
      },
      written: {
        kept: 1,
      },
    },
    {
      codes: [
        PresetsCode.Clash,
      ],
      condition: 'two entries the unit takes clash where a dropped one writes too',
      presets: {
        'lefthook/architecture.yaml': [
          'core:',
          '  import-points-inward:',
          "    '*':",
          '      lefthook.yaml:',
          '        kept: 3',
        ].join('\n'),
        'lefthook/foundation.yaml': [
          'core:',
          '  file-within-500-lines:',
          "    '*':",
          '      lefthook.yaml:',
          '        kept: 2',
          '        jobs:',
          '          - slot: checks',
          '          - format',
          ...INSERTING_ENTRY,
        ].join('\n'),
      },
      written: {
        jobs: [
          'lint',
          'format',
        ],
        kept: 2,
      },
    },
  ])(
    'should skip only an insert whose list or slot an entry an override or an axis drops places when $condition',
    ({ codes, presets, written }) => {
      // Arrange
      const asked = {
        files: releasePresets(presets),
        units: [
          unitOf({
            axes: [
              Axis.Foundation,
              Axis.Workflow,
            ],
            blocks: [
              'core',
              'lefthook',
              'typescript',
            ],
            lowered: [
              'unit-checked-by-its-own-tools',
            ],
          }),
        ],
      };

      // Act
      const plan = planOf(asked);

      // Assert
      expect({
        codes: plan.findings.map(({ code }) => code).filter((code) => mergeCodes.has(code)),
        values: valuesOf(plan),
      }).toStrictEqual({
        codes: [
          ...codes,
        ],
        values: [
          {
            file: 'lefthook.yaml',
            value: written,
          },
        ],
      });
    },
  );

  it.each([
    {
      condition: 'a value names a fact no file is given',
      lines: [
        '      lefthook.yaml:',
        '        value: ${file.name}',
      ],
    },
    {
      condition: 'an item names a role no term defines',
      lines: [
        '      lefthook.yaml:',
        '        items:',
        '          - kept',
        '          - ${role.gone}',
      ],
    },
    {
      condition: "the file's path names a role no term defines",
      lines: [
        "      '${role.gone}/lefthook.yaml':",
        '        value: 1',
      ],
    },
    {
      condition: "the file's path names the name its unit lacks",
      lines: [
        "      '${package.name}.yaml':",
        '        value: 1',
      ],
    },
    {
      condition: 'its guard names the name its unit lacks',
      lines: [
        '      lefthook.yaml ? ${package.name}:',
        '        value: 1',
      ],
    },
    {
      condition: 'one value names such a fact beside one that names none',
      lines: [
        '      lefthook.yaml:',
        '        kept: 1',
        '        value: ${file.name}',
      ],
    },
    {
      condition: 'a key names such a fact',
      lines: [
        '      lefthook.yaml:',
        "        '${file.name}': 1",
        '        kept: 1',
      ],
    },
    {
      condition: 'a map that is an item of a list names such a fact',
      lines: [
        '      lefthook.yaml:',
        '        items:',
        '          - value: ${file.name}',
      ],
    },
    {
      condition: 'a text names a truth beside the path to the Constitution its file is given',
      lines: [
        '      lefthook.yaml:',
        '        path: ${constitution.path}',
        '        value: x${file.isTop}',
      ],
    },
  ])(
    'should leave out an entry whose facts its file cannot be given when $condition',
    ({ lines }) => {
      // Act
      const plan = lefthookPlanOf(lines);

      // Assert
      expect(valuesOf(plan)).toStrictEqual([]);
    },
  );

  it('should keep a map and a list its entry leaves empty', () => {
    // Act
    const plan = lefthookPlanOf([
      '      lefthook.yaml:',
      '        opened: {}',
      '        empty: []',
    ]);

    // Assert
    expect(valuesOf(plan)).toStrictEqual([
      {
        file: 'lefthook.yaml',
        value: {
          empty: [],
          opened: {},
        },
      },
    ]);
  });

  it.each([
    {
      condition: 'a file names it beside one that does not',
      findings: [
        {
          code: PresetsCode.MissingConstitution,
          details: {},
          path: 'other.json',
        },
      ],
      lines: [
        '      other.json:',
        '        path: ${constitution.path}',
        '      plain.json:',
        '        width: 1',
      ],
    },
    {
      condition: "the unit's run names it",
      findings: [
        {
          code: PresetsCode.MissingConstitution,
          details: {},
          path: 'constitution.yaml',
        },
      ],
      lines: [
        '      ${constitution.run}:',
        '        check:',
        '          - lint ${constitution.path}',
      ],
    },
  ])(
    'should find the Constitution a project has none of when $condition',
    ({ findings, lines }) => {
      // Arrange
      const asked = {
        files: projectFiles({
          'packs/acme/presets/biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            ...lines,
          ].join('\n'),
        }),
        packs: [
          'packs/acme',
        ],
        units: [
          unitOf({
            blocks: [
              'core',
              'biome',
            ],
            packs: [
              'packs/acme',
            ],
          }),
        ],
      };

      // Act
      const plan = planOf(asked);

      // Assert
      expect(plan.findings).toStrictEqual(findings);
    },
  );

  it("should find the name a unit lacks where an entry's guard names it", () => {
    // Act
    const plan = factsPlanOf([
      '      named.json ? ${package.name} = kit:',
      '        named: true',
    ]);

    // Assert
    expect(plan.findings).toStrictEqual([
      {
        code: PresetsCode.MissingName,
        details: {},
        path: 'packages/kit/constitution.yaml',
      },
    ]);
  });

  it.each<{
    condition: string;
    findings: PresetsCode[];
    guard: string;
    named: {
      name?: string;
    };
  }>([
    {
      condition: 'its own fact has no value, leaving its text unread',
      findings: [
        PresetsCode.MissingName,
      ],
      guard: '${package.name} = ${constitution.path}',
      named: {},
    },
    {
      condition: 'its own fact has a value and its text names what the unit lacks',
      findings: [
        PresetsCode.MissingConstitution,
      ],
      guard: '${package.name} = ${constitution.path}',
      named: {
        name: 'acme',
      },
    },
    {
      condition: 'its own fact has a value and no text, which no truth names',
      findings: [
        PresetsCode.UnknownFact,
      ],
      guard: '${package.name}',
      named: {
        name: 'acme',
      },
    },
  ])(
    "should find what a unit lacks of a guard's facts when $condition",
    ({ findings, guard, named }) => {
      // Arrange
      const asked = {
        files: projectFiles({
          'packs/acme/presets/biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            `      guarded.json ? ${guard}:`,
            '        guarded: true',
          ].join('\n'),
        }),
        packs: [
          'packs/acme',
        ],
        units: [
          unitOf({
            blocks: [
              'core',
              'biome',
            ],
            ...named,
            packs: [
              'packs/acme',
            ],
          }),
        ],
      };

      // Act
      const plan = planOf(asked);

      // Assert
      expect(plan.findings.map(({ code }) => code)).toStrictEqual(findings);
    },
  );

  it('should leave out of a file the entry whose guard does not hold, its format mark with it', () => {
    // Act
    const plan = factsPlanOf([
      '      kept.json:',
      '        kept: true',
      '      kept.json !jsonc ? ${unit.parent} = nowhere:',
      '        never: true',
    ]);

    // Assert
    expect(
      plan.files.map(({ entries, format }) => ({
        entries: entries.length,
        format,
      })),
    ).toStrictEqual([
      {
        entries: 1,
        format: undefined,
      },
      {
        entries: 1,
        format: undefined,
      },
      {
        entries: 1,
        format: undefined,
      },
    ]);
  });

  it('should find the name a unit lacks once though several of its files name it, and none of a unit that has one', () => {
    // Act
    const plan = factsPlanOf([
      '      first.yaml:',
      '        name: ${package.name}',
      '      second.yaml:',
      '        name: ${package.name}',
    ]);

    // Assert
    expect(plan.findings).toStrictEqual([
      {
        code: PresetsCode.MissingName,
        details: {},
        path: 'packages/kit/constitution.yaml',
      },
    ]);
  });

  it.each([
    {
      condition: "a pack's preset file does not parse",
      files: projectFiles({
        'packs/acme/presets/biome/workflow.yaml': 'biome: [',
      }),
      findings: [
        {
          code: PresetsCode.PresetFileUnparsed,
          details: {
            line: 1,
          },
          path: 'packs/acme/presets/biome/workflow.yaml',
        },
      ],
    },
    {
      condition: 'an entry names a rule no block holds, beside one that sets its setting otherwise',
      files: projectFiles({
        'packs/acme/presets/biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 80',
          '  gone-rule:',
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
      }),
      findings: [
        {
          code: PresetsCode.UnknownRule,
          details: {
            block: BlockId.create('biome'),
            rule: 'gone-rule',
          },
          path: 'packs/acme/presets/biome/foundation.yaml',
        },
      ],
    },
    {
      condition: "the release's entry names a file the release lacks",
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      release.json:',
          '        source: ${constitution.path}/${role.source}/gone',
        ].join('\n'),
      }),
      findings: [
        {
          code: PresetsCode.MissingDistributionFile,
          details: {
            file: 'src/gone',
          },
          path: '.droneey/constitution/presets/biome/foundation.yaml',
        },
      ],
    },
    {
      condition: 'the release holds a plugin no entry names and that names no rule',
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      release.json:',
          '        plugin: ${constitution.path}/presets/biome/plugins/typescript/unchecked-type-never-used.grit',
        ].join('\n'),
        'biome/plugins/typescript/no-rule.grit': 'language js',
        'biome/plugins/typescript/unchecked-type-never-used.grit': 'language js',
      }),
      findings: [
        {
          code: PresetsCode.PluginNamesNoRule,
          details: {
            rule: 'no-rule',
          },
          path: '.droneey/constitution/presets/biome/plugins/typescript/no-rule.grit',
        },
        {
          code: PresetsCode.PluginUnreferenced,
          details: {},
          path: '.droneey/constitution/presets/biome/plugins/typescript/no-rule.grit',
        },
      ],
    },
    {
      condition: 'two entries set one setting otherwise',
      files: projectFiles({
        'packs/acme/presets/biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 80',
          'core:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
      }),
      findings: [
        {
          code: PresetsCode.Clash,
          details: {
            settingPath: 'width',
            sources: [
              'packs/acme/presets/biome/foundation.yaml: core → *',
              'packs/acme/presets/biome/foundation.yaml: biome → *',
            ],
          },
          path: 'biome.json',
        },
      ],
    },
  ])(
    'should find what is wrong with the presets of the release and the packs when $condition',
    ({ files, findings }) => {
      // Arrange
      const asked = {
        files,
        packs: [
          'packs/acme',
        ],
        units: [
          unitOf({
            blocks: [
              'core',
              'biome',
            ],
            packs: [
              'packs/acme',
            ],
          }),
        ],
      };

      // Act
      const plan = planOf(asked);

      // Assert
      expect(plan.findings).toStrictEqual(findings);
    },
  );

  it("should hold the release's entries to the terms' ids, and let the project's own pack spell its folders", () => {
    // Arrange
    const typed = [
      'biome:',
      "  '*':",
      "    '*':",
      '      biome.json:',
      '        files: src/**',
    ].join('\n');
    const asked = {
      files: {
        ...releasePresets({
          'biome/foundation.yaml': typed,
        }),
        ...projectFiles({
          'packs/acme/presets/biome/foundation.yaml': typed,
        }),
      },
      packs: [
        'packs/acme',
      ],
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
          packs: [
            'packs/acme',
          ],
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(
      plan.findings.map(({ code, path }) => [
        code,
        path,
      ]),
    ).toStrictEqual([
      [
        PresetsCode.HandTypedRole,
        '.droneey/constitution/presets/biome/foundation.yaml',
      ],
    ]);
  });

  it("should hold a release's plugin unreferenced though a pack's entry names it", () => {
    // Arrange
    const asked = {
      files: {
        ...releasePresets({
          'biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        width: 100',
          ].join('\n'),
          'biome/plugins/typescript/unchecked-type-never-used.grit': 'language js',
        }),
        ...projectFiles({
          'packs/acme/presets/biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        plugins:',
            '          - ${constitution.path}/presets/biome/plugins/typescript/unchecked-type-never-used.grit',
          ].join('\n'),
        }),
      },
      packs: [
        'packs/acme',
      ],
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
          packs: [
            'packs/acme',
          ],
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(plan.findings.map(({ code }) => code)).toStrictEqual([
      PresetsCode.PluginUnreferenced,
    ]);
  });

  it.each([
    {
      condition: "it climbs out of the repository's unit",
      file: '../outside.json',
      unit: unitOf({
        blocks: [
          'core',
          'biome',
        ],
      }),
    },
    {
      condition: "it climbs out of a member's folder into the repository",
      file: '../shared.json',
      unit: unitOf({
        blocks: [
          'core',
          'biome',
        ],
        path: 'packages/app',
      }),
    },
    {
      condition: 'it climbs back into its unit',
      file: 'x/../biome.json',
      unit: unitOf({
        blocks: [
          'core',
          'biome',
        ],
      }),
    },
    {
      condition: 'it starts at the root of the file system',
      file: '/etc/outside.json',
      unit: unitOf({
        blocks: [
          'core',
          'biome',
        ],
      }),
    },
  ])(
    'should write no file of an entry and find it outside its unit when $condition',
    ({ file, unit }) => {
      // Arrange
      const asked = {
        files: releasePresets({
          'biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            `      '${file}':`,
            '        width: 100',
          ].join('\n'),
        }),
        units: [
          unit,
        ],
      };

      // Act
      const plan = planOf(asked);

      // Assert
      expect({
        blockIds: plan.blockIds,
        codes: plan.findings.map((finding) => finding.code),
        files: plan.files,
      }).toStrictEqual({
        blockIds: new Map(),
        codes: [
          PresetsCode.FileOutsideItsUnit,
        ],
        files: [],
      });
    },
  );
});
