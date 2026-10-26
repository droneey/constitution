import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { ProjectUnit } from '#/kernel/entities';
import { PackPath } from '#/kernel/value-objects';

import type { Files } from '../../../../../__tests__/presets.fixtures';
import {
  catalogueParser,
  PROJECT,
  presetsModel,
  projectFiles,
  projectOf,
  releaseFolderPath,
  releasePresets,
  unitOf,
} from '../../../../../__tests__/presets.fixtures';
import type { PresetsPlan } from '../../../../entities';
import { PresetsCode } from '../../../../entities';
import { computePresets } from '../compute-presets.utils';

const planOf = (input: {
  files: Files;
  packs?: readonly string[];
  units: readonly ProjectUnit[];
}): PresetsPlan => {
  const { files } = projectOf(input);

  return computePresets({
    files,
    model: presetsModel,
    packs: (input.packs ?? []).map(PackPath.create),
    parser: catalogueParser,
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

  it('should merge the entries of a file in the order of their blocks, axes, sources and catalogues', () => {
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

  it('should tell a file at the top where no unit above it takes a file of its name', () => {
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

  it('should find what is wrong with the catalogues, the release’s files, the facts and the merge, each once', () => {
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
        code: PresetsCode.CatalogueUnparsed,
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
        code: PresetsCode.MissingReleaseFile,
        details: {
          block: 'biome',
          file: 'src/gone',
          rule: '*',
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
});
