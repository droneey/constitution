import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { Axis, Layer } from '#/kernel/constants';
import { ConfigReadStatus, WarningKind } from '#/kernel/entities';
import { PackPath, SourceKind, UnitPath } from '#/kernel/value-objects';

import { createFakeClock } from '../../../../../__tests__/clock.fake';
import {
  blockFilesOf,
  configPath,
  Folder,
  failureOf,
  manifest,
  manifestOf,
  parsers,
  projectTreeOf,
  ruleOf,
} from '../../../../../__tests__/project.fixtures';
import {
  activeOf,
  filesOn,
  listedOf,
  listingOf,
  modelOf,
  mustOf,
  today,
  unitOf,
  yamlOf,
} from '../../../../../__tests__/resolution.fixtures';
import { createFakeWorkspace } from '../../../../../__tests__/workspace.fake';
import type { Declaration } from '../../../../../domain/entities';
import { ReleaseFailure, UnreadableFileFailure } from '../../../../../domain/errors';
import { readDeclaration } from '../read-declaration.use-case';

const uiRules = ruleOf({
  level: 'MUST',
  slug: 'inputs-are-labelled',
});

const membersReadOf = (declaration: Declaration): unknown =>
  declaration.status === ConfigReadStatus.Parsed
    ? {
        active: declaration.resolution.active.map(
          (block) => `${block.unit}: ${block.files[0] ?? ''}`,
        ),
        packs: declaration.packs,
        warnings: declaration.resolution.warnings,
      }
    : declaration;

describe('readDeclaration', () => {
  it('should resolve constitution.yaml against the release and the packs it lists when one pack is installed and one is not', () => {
    // Arrange
    const text = yamlOf({
      domains: 'domains: [ui]',
      implementations: 'implementations: [lint]',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: 2026-06-14',
      packs: 'packs: [./rules, extra, ./rules/]',
    });
    const files = createFakeProjectFiles({
      ...projectTreeOf({
        blocks: [
          {
            body: uiRules,
            files: {
              'foundation/forms.md': '# Forms\n',
              'notes.txt': 'Notes.\n',
            },
            id: 'ui',
          },
        ],
        config: text,
        files: blockFilesOf({
          blocks: [
            {
              files: {
                'foundation/style.md': '# Style\n',
              },
              folder: Folder.Implementation,
              id: 'lint',
            },
          ],
          root: `${PROJECT}/rules`,
        }),
      }),
      unreadable: [
        `${releaseFolderPath}/blocks/domains/ui/foundation/forms.md`,
        `${PROJECT}/rules/blocks/implementations/lint/foundation/style.md`,
      ],
    });

    // Act
    const declaration = readDeclaration({
      ...parsers(),
      clock: createFakeClock(today),
      files,
      place: projectPlace,
      workspace: createFakeWorkspace(),
    });

    // Assert
    expect(declaration).toStrictEqual({
      packs: [
        PackPath.create('./rules'),
        PackPath.create('extra'),
      ],
      resolution: {
        active: [
          activeOf({
            files: [
              'blocks/domains/ui/ui.md',
              'blocks/domains/ui/foundation/forms.md',
            ],
            governs: [],
            id: 'ui',
          }),
          activeOf({
            files: [
              './rules/blocks/implementations/lint/lint.md',
              './rules/blocks/implementations/lint/foundation/style.md',
            ],
            governs: [],
            id: 'lint',
          }),
        ],
        listing: listingOf({
          repository: [
            listedOf({
              files: [
                filesOn({
                  axis: Axis.Foundation,
                  chapters: [
                    'forms',
                  ],
                }),
              ],
              id: 'ui',
              layer: Layer.Domain,
            }),
            listedOf({
              files: [
                filesOn({
                  axis: Axis.Foundation,
                  chapters: [
                    'style',
                  ],
                }),
              ],
              id: 'lint',
              layer: Layer.Implementation,
              pack: './rules',
            }),
          ],
        }),
        model: modelOf({
          blocks: [
            {
              id: 'core',
              layer: Layer.Core,
              summary: undefined,
            },
            {
              chapters: [
                'foundation/forms.md',
              ],
              id: 'ui',
            },
            {
              chapters: [
                'foundation/style.md',
              ],
              id: 'lint',
              layer: Layer.Implementation,
              source: './rules',
            },
          ],
          rules: [
            {
              block: 'ui',
              slug: 'inputs-are-labelled',
            },
          ],
        }),
        mustsBesideCore: [
          mustOf({
            block: 'ui',
            slug: 'inputs-are-labelled',
          }),
        ],
        units: [
          unitOf({
            blocks: [
              'core',
              'ui',
              'lint',
            ],
            packs: [
              './rules',
              'extra',
            ],
          }),
        ],
        warnings: [
          {
            details: {
              rule: 'inputs-are-labelled',
              until: '2026-06-14',
            },
            kind: WarningKind.OverrideExpired,
          },
          {
            details: {
              where: 'extra',
            },
            kind: WarningKind.PackNotInstalled,
          },
          {
            details: {
              file: './rules/blocks/implementations/lint/foundation/style.md',
              source: SourceKind.Pack,
            },
            kind: WarningKind.FileUnreadable,
          },
          {
            details: {
              file: '/work/project/.droneey/constitution/blocks/core/core.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.FrontMatterMissing,
          },
          {
            details: {
              file: '/work/project/.droneey/constitution/blocks/domains/ui/foundation/forms.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.FileUnreadable,
          },
        ],
      },
      status: ConfigReadStatus.Parsed,
    });
  });

  it("should read each member's own constitution.yaml, and its packs from its folder, and note those it cannot read when the workspace declares members", () => {
    // Arrange
    const text = yamlOf();
    const web = yamlOf({
      domains: 'domains: [ui]',
      implementations: 'implementations: [lint]',
      packs: 'packs: [../../rules]',
    });
    const files = createFakeProjectFiles({
      ...projectTreeOf({
        blocks: [
          {
            body: uiRules,
            id: 'ui',
          },
        ],
        config: text,
        files: {
          [`${PROJECT}/apps/docs/constitution.yaml`]: 'domains: [ui\n',
          [`${PROJECT}/apps/web/constitution.yaml`]: web,
          [`${PROJECT}/packages/ui/constitution.yaml`]: yamlOf(),
          ...blockFilesOf({
            blocks: [
              {
                folder: Folder.Implementation,
                id: 'lint',
              },
            ],
            root: `${PROJECT}/rules`,
          }),
        },
      }),
      unreadable: [
        `${PROJECT}/packages/ui/constitution.yaml`,
      ],
    });

    // Act
    const declaration = readDeclaration({
      ...parsers(),
      clock: createFakeClock(today),
      files,
      place: projectPlace,
      workspace: createFakeWorkspace([
        'apps/api',
        'apps/docs',
        'apps/web',
        'packages/ui',
      ]),
    });

    // Assert
    expect(membersReadOf(declaration)).toStrictEqual({
      active: [
        'apps/web: blocks/domains/ui/ui.md',
        'apps/web: rules/blocks/implementations/lint/lint.md',
      ],
      packs: [
        'rules',
      ],
      warnings: [
        {
          details: {
            lines: [
              2,
            ],
            member: UnitPath.create('apps/docs'),
          },
          kind: WarningKind.MemberConfigUnparsed,
        },
        {
          details: {
            member: UnitPath.create('packages/ui'),
          },
          kind: WarningKind.MemberConfigUnreadable,
        },
        {
          details: {
            member: UnitPath.create('apps/api'),
          },
          kind: WarningKind.MemberWithoutConfig,
        },
        {
          details: {
            file: '/work/project/.droneey/constitution/blocks/core/core.md',
            source: SourceKind.Release,
          },
          kind: WarningKind.FrontMatterMissing,
        },
      ],
    });
  });

  it('should take a pack that holds presets alone as installed when another pack holds nothing', () => {
    // Arrange
    const files = createFakeProjectFiles({
      ...projectTreeOf({
        config: yamlOf({
          packs: 'packs: [shared, empty]',
        }),
        files: {
          [`${PROJECT}/shared/presets/biome/foundation.yaml`]: 'biome: {}\n',
        },
      }),
      folders: [
        `${PROJECT}/empty`,
      ],
    });

    // Act
    const declaration = readDeclaration({
      ...parsers(),
      clock: createFakeClock(today),
      files,
      place: projectPlace,
      workspace: createFakeWorkspace(),
    });

    // Assert
    expect(membersReadOf(declaration)).toStrictEqual({
      active: [],
      packs: [
        'shared',
        'empty',
      ],
      warnings: [
        {
          details: {
            where: 'empty',
          },
          kind: WarningKind.PackNotInstalled,
        },
        {
          details: {
            file: '/work/project/.droneey/constitution/blocks/core/core.md',
            source: SourceKind.Release,
          },
          kind: WarningKind.FrontMatterMissing,
        },
      ],
    });
  });

  it('should give the lines the file fails at when constitution.yaml does not parse', () => {
    // Arrange
    const files = createFakeProjectFiles(
      projectTreeOf({
        config: 'axes: []\ndomains: [ui\n',
      }),
    );

    // Act
    const declaration = readDeclaration({
      ...parsers(),
      clock: createFakeClock(today),
      files,
      place: projectPlace,
      workspace: createFakeWorkspace(),
    });

    // Assert
    expect(declaration).toStrictEqual({
      lines: [
        3,
      ],
      status: ConfigReadStatus.Unparsed,
    });
  });

  it.each([
    {
      cause: undefined,
      code: UnreadableFileFailure.Config,
      condition: 'there is no constitution.yaml',
      folders: [],
      details: {
        path: configPath,
      },
      tree: {
        [`${releaseFolderPath}/blocks/core/core.md`]: '# Core\n',
      },
      unreadable: [],
    },
    {
      cause: expect.any(Error),
      code: UnreadableFileFailure.Config,
      condition: 'constitution.yaml cannot be read',
      folders: [],
      details: {
        path: configPath,
      },
      tree: {
        [configPath]: yamlOf(),
        [`${releaseFolderPath}/blocks/core/core.md`]: '# Core\n',
      },
      unreadable: [
        configPath,
      ],
    },
    {
      cause: undefined,
      code: ReleaseFailure.BlocksUnlisted,
      condition: 'the release holds no blocks folder',
      folders: [],
      details: {
        path: releaseFolderPath,
      },
      tree: {
        [configPath]: 'domains: [ui\n',
        [manifest]: manifestOf(),
      },
      unreadable: [],
    },
    {
      cause: undefined,
      code: ReleaseFailure.BlocksUnlisted,
      condition: 'the release holds presets and no blocks folder',
      folders: [],
      details: {
        path: releaseFolderPath,
      },
      tree: {
        [configPath]: yamlOf(),
        [manifest]: manifestOf(),
        [`${releaseFolderPath}/presets/biome/foundation.yaml`]: 'biome: {}\n',
      },
      unreadable: [],
    },
  ])(
    'should fail with $code, keeping why the read failed, when $condition',
    ({ cause, code, details, folders, tree, unreadable }) => {
      // Arrange
      const files = createFakeProjectFiles({
        files: tree,
        folders,
        unreadable,
      });

      // Act
      const failure = failureOf(() =>
        readDeclaration({
          ...parsers(),
          clock: createFakeClock(today),
          files,
          place: projectPlace,
          workspace: createFakeWorkspace(),
        }),
      );

      // Assert
      expect(failure).toStrictEqual({
        cause,
        code,
        details,
      });
    },
  );
});
