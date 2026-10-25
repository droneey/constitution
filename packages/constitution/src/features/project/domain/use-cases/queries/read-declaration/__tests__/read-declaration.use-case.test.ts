import { describe, expect, it } from 'bun:test';

import { createFakeProjectFiles } from '#/__tests__/project-files.fake';
import { PROJECT, projectPlace, releaseFolderPath } from '#/__tests__/project-place.fixtures';
import { Axis, Layer } from '#/kernel/constants';
import type { Declaration } from '#/kernel/entities';
import { ConfigReadStatus, WarningCode, WarningKind } from '#/kernel/entities';
import { ProjectFailure } from '#/kernel/errors';
import { PackPath } from '#/kernel/value-objects';

import { createFakeClock } from '../../../../../__tests__/clock.fake';
import {
  blockFilesOf,
  configPath,
  Folder,
  manifest,
  manifestOf,
  parsers,
  projectTreeOf,
  ruleOf,
} from '../../../../../__tests__/project.fixtures';
import { createFakeWorkspace } from '../../../../../__tests__/workspace.fake';
import { readDeclaration } from '../read-declaration.use-case';
import {
  activeOf,
  catalogueEntryOf,
  failureOf,
  filesOn,
  listedOf,
  listingOf,
  memberYamlOf,
  mustOf,
  today,
  unitOf,
  yamlOf,
} from '../steps/resolve-declaration/__tests__/resolution.fixtures';

const uiRules = ruleOf({
  level: 'MUST',
  slug: 'inputs-are-labelled',
});

// What a declaration read of the members: where each active block is and its passport, the packs
// and its warnings' codes.
const membersReadOf = (declaration: Declaration): unknown =>
  declaration.status === ConfigReadStatus.Parsed
    ? {
        active: declaration.resolution.active.map(
          (block) => `${block.unit}: ${block.files[0] ?? ''}`,
        ),
        packs: declaration.packs,
        warnings: declaration.resolution.warnings.map((warning) => warning.code),
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
        blocks: [
          catalogueEntryOf('core', Layer.Core),
          catalogueEntryOf('ui', Layer.Domain),
          catalogueEntryOf('lint', Layer.Implementation),
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
        musts: [
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
          }),
        ],
        warnings: [
          {
            code: WarningCode.Pack,
            details: {
              file: './rules/blocks/implementations/lint/foundation/style.md',
            },
            kind: WarningKind.FileUnreadable,
          },
          {
            code: WarningCode.Pack,
            details: {
              where: 'extra',
            },
            kind: WarningKind.PackNotInstalled,
          },
          {
            code: WarningCode.Constitution,
            details: {
              file: '/work/project/.droneey/constitution/blocks/core/core.md',
            },
            kind: WarningKind.FrontMatterMissing,
          },
          {
            code: WarningCode.Constitution,
            details: {
              file: '/work/project/.droneey/constitution/blocks/domains/ui/foundation/forms.md',
            },
            kind: WarningKind.FileUnreadable,
          },
          {
            code: WarningCode.Override,
            details: {
              rule: 'inputs-are-labelled',
              until: '2026-06-14',
            },
            kind: WarningKind.OverrideExpired,
          },
        ],
      },
      status: ConfigReadStatus.Parsed,
    });
  });

  it("should read each member's own constitution.yaml, and its packs from its folder, and note those it cannot read when the workspace declares members", () => {
    // Arrange
    const text = yamlOf();
    const web = memberYamlOf({
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
        WarningCode.Config,
        WarningCode.Config,
        WarningCode.Config,
        WarningCode.Constitution,
      ],
    });
  });

  it('should give the line the read stops at when constitution.yaml does not parse', () => {
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
      line: 2,
      status: ConfigReadStatus.Unparsed,
    });
  });

  it.each([
    {
      cause: undefined,
      code: ProjectFailure.ConfigUnreadable,
      condition: 'there is no constitution.yaml',
      folders: [],
      path: configPath,
      tree: {
        [`${releaseFolderPath}/blocks/core/core.md`]: '# Core\n',
      },
      unreadable: [],
    },
    {
      cause: expect.any(Error),
      code: ProjectFailure.ConfigUnreadable,
      condition: 'constitution.yaml cannot be read',
      folders: [],
      path: configPath,
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
      code: ProjectFailure.BlocksUnlisted,
      condition: 'the release holds no blocks folder',
      folders: [],
      path: releaseFolderPath,
      tree: {
        [configPath]: 'domains: [ui\n',
        [manifest]: manifestOf(),
      },
      unreadable: [],
    },
  ])(
    'should fail with $code, keeping why the read failed, when $condition',
    ({ cause, code, folders, path, tree, unreadable }) => {
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
        line: undefined,
        path,
      });
    },
  );
});
