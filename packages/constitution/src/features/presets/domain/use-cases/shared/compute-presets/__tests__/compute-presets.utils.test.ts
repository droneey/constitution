import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { ProjectUnit } from '#/kernel/entities';
import { PackPath } from '#/kernel/value-objects';

import { createFakeDistributionSources } from '../../../../../__tests__/distribution-sources.fake';
import type { Files } from '../../../../../__tests__/presets.fixtures';
import {
  PROJECT,
  presetFileParser,
  presetsModel,
  projectFiles,
  projectOf,
  releaseFolderPath,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
import type { PresetsPlan } from '../../../../entities';
import { PresetsCode } from '../../../../entities';
import { FileFormat } from '../../../../value-objects';
import { computePresets } from '../compute-presets.utils';

const planOf = (input: {
  files: Files;
  packs?: readonly string[];
  units: readonly ProjectUnit[];
}): PresetsPlan => {
  const { files } = projectOf(input);

  return computePresets({
    distribution: createFakeDistributionSources(),
    files,
    model: presetsModel,
    packs: (input.packs ?? []).map(PackPath.create),
    parser: presetFileParser,
    project: PROJECT,
    releaseFolder: releaseFolderPath,
    units: input.units,
  });
};

// What a plan writes: each file, its unit's path and the settings its entries merge to.
const writtenOf = (plan: PresetsPlan) =>
  plan.files.map(({ file, merged, unit }) => ({
    file,
    merged,
    unit: String(unit),
  }));

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

  it('should write nothing where the project holds no unit', () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        width: 100',
        ].join('\n'),
      }),
      units: [],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(writtenOf(plan)).toStrictEqual([]);
  });

  it('should write a list marked as words as one text, the items inserted at its slots among them', () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        command: !words',
          '          - biome ${package.name}',
          '          - slot: paths',
          '        command@paths:',
          '          - src',
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
      {
        command: 'biome kit src',
      },
    ]);
  });

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
          Object.entries(one).filter(([key]) => key === 'file' || key === 'marks'),
        ),
      ),
    ).toStrictEqual([
      {
        file: '.gitignore',
        marks: {
          blocks: [
            'biome',
          ],
          marks: [
            {
              block: 'biome',
              path: [
                {
                  item: 'dist/',
                },
              ],
            },
          ],
        },
      },
      {
        file: 'biome.json',
        marks: {
          blocks: [
            'biome',
          ],
          marks: [
            {
              block: 'biome',
              path: [
                'width',
              ],
            },
          ],
        },
      },
      {
        file: 'tombi.toml',
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
              'file',
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
          file: 'apps/eros/languages/ts/apps.json',
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
          file: 'apps/eros/languages/ts/config.json',
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
          file: 'apps/eros/languages/ts/same.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              same: true,
            },
          },
        },
        {
          file: 'apps/web/apps.json',
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
          file: 'apps/web/config.json',
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
          file: 'apps/web/same.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              same: true,
            },
          },
        },
        {
          file: 'config.json',
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
          file: 'other.json',
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
            block: 'bun',
            fact: '${file.isTop}',
            rule: '*',
          },
          path: '.droneey/constitution/presets/bun/foundation.yaml',
        },
      ],
    });
  });

  it('should give each file its facts: the path to the Constitution, its roles, its truths, its guards and its members', () => {
    // Arrange
    const asked = {
      files: {
        ...releasePresets({
          'bun/foundation.yaml': [
            'bun:',
            "  '*':",
            "    '*':",
            '      bunfig.toml ? ${file.isTop}:',
            '        install:',
            '          age: 3',
            '      bunfig.toml:',
            '        test:',
            '          preload:',
            '            - ${constitution.path}/presets/bun/fixture.ts',
            '            - ${role.source}/setup.${role.typescript-source}',
            '          top: ${file.isTop}',
            '          root: ${workspace.isRoot}',
            '      package.json ? !${workspace.isRoot}:',
            '        name: ${package.name}',
            "      '${role.source}/index.${role.typescript-source}': !default |",
            '        export {};',
          ].join('\n'),
          'bun/fixture.ts': '',
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
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect({
      findings: plan.findings,
      written: writtenOf(plan),
    }).toStrictEqual({
      findings: [
        {
          code: PresetsCode.MissingName,
          details: {},
          path: 'packages/kit/constitution.yaml',
        },
      ],
      written: [
        {
          file: 'bunfig.toml',
          merged: {
            defaults: [],
            problems: [],
            value: {
              install: {
                age: 3,
              },
              test: {
                preload: [
                  '.droneey/constitution/presets/bun/fixture.ts',
                  'src/setup.ts',
                ],
                root: true,
                top: true,
              },
            },
          },
          unit: '',
        },
        {
          file: 'packages/app/bunfig.toml',
          merged: {
            defaults: [],
            problems: [],
            value: {
              test: {
                preload: [
                  '.droneey/constitution/presets/bun/fixture.ts',
                  'src/setup.ts',
                ],
                root: false,
                top: false,
              },
            },
          },
          unit: 'packages/app',
        },
        {
          file: 'packages/app/package.json',
          merged: {
            defaults: [],
            problems: [],
            value: {
              name: 'app',
            },
          },
          unit: 'packages/app',
        },
        {
          file: 'packages/app/src/index.ts',
          merged: {
            defaults: [],
            problems: [],
            whole: 'export {};\n',
          },
          unit: 'packages/app',
        },
        {
          file: 'packages/kit/bunfig.toml',
          merged: {
            defaults: [],
            problems: [],
            value: {
              test: {
                preload: [
                  '../../.droneey/constitution/presets/bun/fixture.ts',
                  'src/setup.ts',
                ],
                root: false,
                top: false,
              },
            },
          },
          unit: 'packages/kit',
        },
        {
          file: 'packages/kit/src/index.ts',
          merged: {
            defaults: [],
            problems: [],
            whole: 'export {};\n',
          },
          unit: 'packages/kit',
        },
        {
          file: 'src/index.ts',
          merged: {
            defaults: [],
            problems: [],
            whole: 'export {};\n',
          },
          unit: '',
        },
      ],
    });
  });

  it('should tell a file at the top where no unit above it gets the same entry', () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'lefthook/foundation.yaml': [
          'lefthook:',
          "  '*':",
          "    '*':",
          '      shared.yaml:',
          '        top: ${file.isTop}',
          '    typescript:',
          '      local.yaml:',
          '        top: ${file.isTop}',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'lefthook',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'lefthook',
            'typescript',
          ],
          languages: [
            'typescript',
          ],
          path: 'packages/kit',
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect(
      writtenOf(plan).map(({ file, merged }) => ({
        file,
        value: merged.value,
      })),
    ).toStrictEqual([
      {
        file: 'packages/kit/local.yaml',
        value: {
          top: true,
        },
      },
      {
        file: 'packages/kit/shared.yaml',
        value: {
          top: false,
        },
      },
      {
        file: 'shared.yaml',
        value: {
          top: true,
        },
      },
    ]);
  });

  it.each([
    {
      condition: 'the unit above takes the file from another block alone',
      expected: [
        'packages/app/pyproject.toml',
      ],
      rootBlocks: [
        'core',
        'python',
      ],
    },
    {
      condition: 'the unit above gets the same entry',
      expected: [
        'pyproject.toml',
      ],
      rootBlocks: [
        'core',
        'python',
        'uv',
      ],
    },
  ])(
    'should guard an entry by the units above that get it when $condition',
    ({ expected, rootBlocks }) => {
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
      expect(
        writtenOf(plan)
          .filter(({ merged }) => JSON.stringify(merged.value).includes('"uv"'))
          .map(({ file }) => file),
      ).toStrictEqual([
        ...expected,
      ]);
    },
  );

  it('should give what constitution runs apart from the files, each list in the slots its runner places, and find a tool no runner of a unit runs and a run of another shape', () => {
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
        'lefthook/foundation.yaml': [
          'lefthook:',
          "  '*':",
          "    '*':",
          '      ${constitution.run}:',
          '        check: bun run check',
        ].join('\n'),
        'lefthook/foundation/with/json.yaml': [
          'json:',
          "  '*':",
          "    '*':",
          '      lefthook.yaml:',
          '        json: true',
        ].join('\n'),
        'biome/foundation/with/css.yaml': [
          'css:',
          "  '*':",
          "    '*':",
          '      biome.json:',
          '        css: true',
        ].join('\n'),
      }),
      units: [
        unitOf({
          blocks: [
            'core',
            'biome',
            'bun',
            'json',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'biome',
          ],
          path: 'packages/kit',
        }),
        unitOf({
          blocks: [
            'core',
            'json',
            'lefthook',
          ],
          path: 'packages/hooks',
        }),
        unitOf({
          blocks: [
            'core',
            'css',
          ],
          path: 'packages/style',
        }),
      ],
    };

    // Act
    const plan = planOf(asked);

    // Assert
    expect({
      files: writtenOf(plan).map(({ file }) => file),
      findings: plan.findings,
      runs: plan.runs.map(({ commands, unit }) => ({
        commands: Object.fromEntries(commands),
        unit: String(unit),
      })),
    }).toStrictEqual({
      files: [
        'package.json',
        'packages/hooks/lefthook.yaml',
      ],
      findings: [
        {
          code: PresetsCode.RunMisshapen,
          details: {},
          path: 'packages/hooks/constitution.yaml',
        },
        {
          code: PresetsCode.ToolWithoutRunner,
          details: {
            block: 'json',
          },
          path: 'constitution.yaml',
        },
        {
          code: PresetsCode.ToolWithoutRunner,
          details: {
            block: 'biome',
          },
          path: 'packages/kit/constitution.yaml',
        },
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

  it('should leave out what the members empty, an entry that only inserts where no entry places its list, and an entry whose facts the file cannot be given, and keep what is empty as written', () => {
    // Arrange
    const asked = {
      files: releasePresets({
        'lefthook/workflow.yaml': [
          'lefthook:',
          "  '*':",
          "    '*':",
          '      lefthook.yaml:',
          '        skip:',
          "          - '${workspace.members}/**'",
          '        exclude:',
          "          - '${workspace.members}/**'",
          '          - docs/**',
          '      only-members.yaml:',
          '        skip:',
          "          - '${workspace.members}'",
          '      inserts.yaml:',
          '        jobs@checks:',
          '          - lint',
          '      placed.yaml:',
          '        jobs:',
          '          - slot: checks',
          '      unknown.yaml:',
          '        value: ${file.name}',
          '      listed.yaml:',
          '        items:',
          '          - kept',
          '          - ${role.gone}',
          "      '${role.gone}/file.yaml':",
          '        value: 1',
          "      '${package.name}.yaml':",
          '        value: 1',
          '      truth.yaml:',
          '        list:',
          '          - ${workspace.isRoot}',
          '      guarded.yaml ? ${package.name}:',
          '        value: 1',
          '      mixed.yaml:',
          '        kept: 1',
          '        value: ${file.name}',
          '      keyed.yaml:',
          "        '${file.name}': 1",
          '        kept: 1',
          '      unresolved-item.yaml:',
          '        items:',
          '          - value: ${file.name}',
          '      kept.yaml:',
          '        opened: {}',
          '        empty: []',
          '        nested:',
          '          - - ${workspace.members}',
          '        items:',
          '          - root: ${workspace.isRoot}',
          'core:',
          "  '*':",
          "    '*':",
          '      placed.yaml:',
          '        jobs@checks:',
          '          - lint',
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
    expect(writtenOf(plan)).toStrictEqual([
      {
        file: 'kept.yaml',
        merged: {
          defaults: [],
          problems: [],
          value: {
            empty: [],
            items: [
              {
                root: false,
              },
            ],
            nested: [],
            opened: {},
          },
        },
        unit: '',
      },
      {
        file: 'lefthook.yaml',
        merged: {
          defaults: [],
          problems: [],
          value: {
            exclude: [
              'docs/**',
            ],
          },
        },
        unit: '',
      },
      {
        file: 'placed.yaml',
        merged: {
          defaults: [],
          problems: [],
          value: {
            jobs: [
              'lint',
            ],
          },
        },
        unit: '',
      },
      {
        file: 'truth.yaml',
        merged: {
          defaults: [],
          problems: [],
          value: {
            list: [
              false,
            ],
          },
        },
        unit: '',
      },
    ]);
  });

  it('should find the name a unit lacks and the Constitution a file has none of', () => {
    // Arrange
    const asked = {
      files: projectFiles({
        'packs/acme/presets/biome/foundation.yaml': [
          'biome:',
          "  '*':",
          "    '*':",
          '      other.json:',
          '        path: ${constitution.path}',
          '        name: ${package.name}',
          '      plain.json:',
          '        width: 1',
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
    expect(plan.findings).toStrictEqual([
      {
        code: PresetsCode.MissingConstitution,
        details: {},
        path: 'other.json',
      },
      {
        code: PresetsCode.MissingName,
        details: {},
        path: 'constitution.yaml',
      },
    ]);
  });

  it('should find what is wrong with the preset files, the release’s files, the facts and the merge, each once', () => {
    // Arrange
    const asked = {
      files: {
        ...releasePresets({
          'biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            '      release.json:',
            '        plugin: ${constitution.path}/presets/biome/plugins/typescript/unchecked-type-never-used.grit',
            '        source: ${constitution.path}/${role.source}/gone',
            '      notes.txt: !default |',
            '        see ${constitution.path}/gone',
          ].join('\n'),
          'biome/plugins/typescript/no-rule.grit': 'language js',
          'biome/plugins/typescript/unchecked-type-never-used.grit': 'language js',
        }),
        ...projectFiles({
          'packs/acme/presets/biome/foundation.yaml': [
            'biome:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        width: 80',
            '      other.json:',
            '        path: ${constitution.path}',
            '        pack: ${constitution.path}/gone',
            '  gone-rule:',
            "    '*':",
            '      biome.json:',
            '        width: 100',
            'core:',
            "  '*':",
            "    '*':",
            '      biome.json:',
            '        width: 100',
          ].join('\n'),
          'packs/acme/presets/biome/workflow.yaml': 'biome: [',
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
    expect(plan.findings).toStrictEqual([
      {
        code: PresetsCode.PresetFileUnparsed,
        details: {
          line: 1,
        },
        path: 'packs/acme/presets/biome/workflow.yaml',
      },
      {
        code: PresetsCode.UnknownRule,
        details: {
          block: 'biome',
          rule: 'gone-rule',
        },
        path: 'packs/acme/presets/biome/foundation.yaml',
      },
      {
        code: PresetsCode.MissingDistributionFile,
        details: {
          file: 'src/gone',
        },
        path: '.droneey/constitution/presets/biome/foundation.yaml',
      },
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
      {
        code: PresetsCode.Clash,
        details: {
          setting: 'width',
          sources: [
            'packs/acme/presets/biome/foundation.yaml: core → *',
            'packs/acme/presets/biome/foundation.yaml: biome → *',
          ],
        },
        path: 'biome.json',
      },
    ]);
  });

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
});
