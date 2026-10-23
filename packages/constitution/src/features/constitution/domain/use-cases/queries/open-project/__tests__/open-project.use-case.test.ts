import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';

import { createFakeClock } from '../../../../../__tests__/clock.fake';
import {
  ARCHIVE,
  blockFilesOf,
  CONFIG,
  Folder,
  MANIFEST,
  manifestOf,
  PROJECT,
  parsers,
  projectTreeOf,
  ruleOf,
} from '../../../../../__tests__/project.fixtures';
import { createFakeProjectFiles } from '../../../../../__tests__/project-files.fake';
import { ConfigReadStatus, ProjectFailure, ReleaseNotice, WarningCode } from '../../../../entities';
import { findProject, openProject, readDeclaration, readRelease } from '../open-project.use-case';
import { failureOf, parsedOf, TODAY, unitOf, yamlOf } from './resolution.fixtures';

const UI_RULES = ruleOf({
  level: 'MUST',
  slug: 'inputs-are-labelled',
});

describe('findProject', () => {
  it.each([
    {
      condition: 'the start folder holds constitution.yaml',
      expected: '/work/project',
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'only the root of its repository holds it',
      expected: '/work/project',
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/apps/web/package.json': '{}\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project/apps/web',
    },
    {
      condition: 'a package and the root of its repository both hold one',
      expected: '/work/project/apps/web',
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/apps/web/constitution.yaml': 'axes: []\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project/apps/web',
    },
    {
      condition: 'only a folder above its repository holds it',
      expected: undefined,
      files: {
        '/work/constitution.yaml': 'axes: []\n',
        '/work/project/.git': 'gitdir: /work/main/.git/worktrees/project\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'no repository holds the start folder, which holds it',
      expected: '/work/project',
      files: {
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'no repository holds the start folder and only a folder above holds it',
      expected: undefined,
      files: {
        '/work/constitution.yaml': 'axes: []\n',
        '/work/project/README.md': '# Project\n',
      },
      links: {},
      start: '/work/project',
    },
    {
      condition: 'the start folder is reached through a link',
      expected: '/work/project',
      files: {
        '/work/project/.git/HEAD': 'ref: refs/heads/main\n',
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {
        '/home/me/project': '/work/project',
      },
      start: '/home/me/project',
    },
    {
      condition: 'the repository is the root folder',
      expected: '/',
      files: {
        '/.git/HEAD': 'ref: refs/heads/main\n',
        '/constitution.yaml': 'axes: []\n',
        '/work/README.md': '# Work\n',
      },
      links: {},
      start: '/work',
    },
    {
      condition: 'the start is no folder',
      expected: undefined,
      files: {
        '/work/project/constitution.yaml': 'axes: []\n',
      },
      links: {},
      start: '/work/project/constitution.yaml',
    },
  ])(
    'should find the project around the start folder when $condition',
    ({ expected, files, links, start }) => {
      // Arrange
      const projectFiles = createFakeProjectFiles({
        files,
        links,
      });

      // Act
      const project = findProject({
        files: projectFiles,
        start,
      });

      // Assert
      expect(project).toBe(expected);
    },
  );
});

describe('readRelease', () => {
  it.each([
    {
      condition: 'no release is installed',
      expected: {
        format: 0,
        notice: ReleaseNotice.Missing,
      },
      files: {
        [CONFIG]: 'axes: []\n',
      },
    },
    {
      condition: 'the release is of a newer block format',
      expected: {
        format: 12,
        notice: ReleaseNotice.Newer,
      },
      files: {
        [MANIFEST]: '{"version": "1.0.0", "constitutionFormat":12}\n',
      },
    },
    {
      condition: 'the release is of an older block format',
      expected: {
        format: 2,
        notice: ReleaseNotice.Older,
      },
      files: {
        [MANIFEST]: manifestOf({
          format: 2,
        }),
      },
    },
    {
      condition: 'the release names no block format',
      expected: {
        format: 0,
        notice: ReleaseNotice.Older,
      },
      files: {
        [MANIFEST]: '{\n  "version": "1.0.0"\n}\n',
      },
    },
    {
      condition: 'the release is of the block format this program reads',
      expected: {
        installed: '1.0.0',
      },
      files: {
        [MANIFEST]: '{\n  "constitutionFormat": 3,\n  "version": "1.0.0"\n}\n',
      },
    },
    {
      condition: 'the first line naming the format names it twice and a later line names another',
      expected: {
        installed: '2.0.0-rc.1',
      },
      files: {
        [MANIFEST]:
          '{"constitutionFormat": 2, "constitutionFormat"\t:\t3,\n"version" :"2.0.0-rc.1", "x": "y",\n"constitutionFormat": 4, "version": "9.9.9"}\n',
      },
    },
  ])('should give the release the project pins when $condition', ({ expected, files }) => {
    // Arrange
    const projectFiles = createFakeProjectFiles({
      files,
    });

    // Act
    const release = readRelease({
      archive: ARCHIVE,
      files: projectFiles,
    });

    // Assert
    expect(release).toStrictEqual(expected);
  });

  it.each([
    {
      code: ProjectFailure.ManifestUnreadable,
      condition: 'the release has no manifest',
      files: {},
      unreadable: [],
    },
    {
      code: ProjectFailure.ManifestUnreadable,
      condition: 'its manifest cannot be read',
      files: {
        [MANIFEST]: manifestOf(),
      },
      unreadable: [
        MANIFEST,
      ],
    },
    {
      code: ProjectFailure.VersionMissing,
      condition: 'its manifest names no version',
      files: {
        [MANIFEST]: '{"constitutionFormat": 3}\n',
      },
      unreadable: [],
    },
    {
      code: ProjectFailure.VersionMissing,
      condition: 'its manifest names an empty version',
      files: {
        [MANIFEST]: '{"constitutionFormat": 3, "version": ""}\n',
      },
      unreadable: [],
    },
  ])('should fail with $code when $condition', ({ code, files, unreadable }) => {
    // Arrange
    const projectFiles = createFakeProjectFiles({
      files: {
        [`${ARCHIVE}/blocks/core/core.md`]: '# Core\n',
        ...files,
      },
      unreadable,
    });

    // Act
    const failure = failureOf(() =>
      readRelease({
        archive: ARCHIVE,
        files: projectFiles,
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      code,
      line: undefined,
      path: MANIFEST,
    });
  });
});

describe('readDeclaration', () => {
  it('should resolve constitution.yaml against the release and the packs it lists when one pack is installed and one is not', () => {
    // Arrange
    const text = yamlOf({
      domains: 'domains: [ui]',
      implementations: 'implementations: [lint]',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: 2026-06-14',
      packs: 'packs: [./rules, extra]',
    });
    const files = createFakeProjectFiles({
      ...projectTreeOf({
        blocks: [
          {
            body: UI_RULES,
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
        `${ARCHIVE}/blocks/domains/ui/foundation/forms.md`,
        `${PROJECT}/rules/blocks/implementations/lint/foundation/style.md`,
      ],
    });

    // Act
    const declaration = readDeclaration({
      archive: ARCHIVE,
      clock: createFakeClock(TODAY),
      configParser: parsers().configParser,
      files,
      frontMatterParser: parsers().frontMatterParser,
      project: PROJECT,
    });

    // Assert
    expect(declaration).toStrictEqual({
      config: parsedOf(text),
      resolution: {
        active: [
          {
            app: '',
            files: [
              'blocks/domains/ui/ui.md',
              'blocks/domains/ui/foundation/forms.md',
            ],
            globs: [],
            id: 'ui',
            scope: 0,
          },
          {
            app: '',
            files: [
              './rules/blocks/implementations/lint/lint.md',
              './rules/blocks/implementations/lint/foundation/style.md',
            ],
            globs: [],
            id: 'lint',
            scope: 0,
          },
        ],
        blocks: [
          {
            id: 'core',
            layer: Layer.Core,
          },
          {
            id: 'ui',
            layer: Layer.Domain,
          },
          {
            id: 'lint',
            layer: Layer.Implementation,
          },
        ],
        check: '',
        count: 3,
        index: [
          '## Domains (blocks/domains/<id>/<id>.md)',
          "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.",
          '- ui: The ui block. (forms)',
          '## Implementations (blocks/implementations/<id>/<id>.md)',
          '- lint [./rules] (style)',
        ],
        musts: [
          {
            block: 'ui',
            rule: 'inputs-are-labelled',
          },
        ],
        units: [
          unitOf({
            blocks: new Set([
              'core',
              'ui',
              'lint',
            ]),
          }),
        ],
        warnings: [
          {
            code: WarningCode.Pack,
            message:
              './rules/blocks/implementations/lint/foundation/style.md cannot be read — its rules are left out',
          },
          {
            code: WarningCode.Pack,
            message: 'extra is not installed — run mise install, or check the path',
          },
          {
            code: WarningCode.Constitution,
            message:
              '/work/project/.droneey/constitution/blocks/core/core.md has no front matter — the block is read without it',
          },
          {
            code: WarningCode.Constitution,
            message:
              '/work/project/.droneey/constitution/blocks/domains/ui/foundation/forms.md cannot be read — its rules are left out',
          },
          {
            code: WarningCode.Override,
            message: 'inputs-are-labelled expired on 2026-06-14 — renew or remove it',
          },
        ],
      },
      status: ConfigReadStatus.Parsed,
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
      archive: ARCHIVE,
      clock: createFakeClock(TODAY),
      configParser: parsers().configParser,
      files,
      frontMatterParser: parsers().frontMatterParser,
      project: PROJECT,
    });

    // Assert
    expect(declaration).toStrictEqual({
      line: 2,
      status: ConfigReadStatus.Unparsed,
    });
  });

  it.each([
    {
      code: ProjectFailure.ConfigUnreadable,
      condition: 'constitution.yaml cannot be read',
      folders: [],
      path: CONFIG,
      tree: {
        [CONFIG]: yamlOf(),
        [`${ARCHIVE}/blocks/core/core.md`]: '# Core\n',
      },
      unreadable: [
        CONFIG,
      ],
    },
    {
      code: ProjectFailure.BlocksUnlisted,
      condition: 'the release holds no blocks folder',
      folders: [],
      path: ARCHIVE,
      tree: {
        [CONFIG]: 'domains: [ui\n',
        [MANIFEST]: manifestOf(),
      },
      unreadable: [],
    },
  ])('should fail with $code when $condition', ({ code, folders, path, tree, unreadable }) => {
    // Arrange
    const files = createFakeProjectFiles({
      files: tree,
      folders,
      unreadable,
    });

    // Act
    const failure = failureOf(() =>
      readDeclaration({
        archive: ARCHIVE,
        clock: createFakeClock(TODAY),
        configParser: parsers().configParser,
        files,
        frontMatterParser: parsers().frontMatterParser,
        project: PROJECT,
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      code,
      line: undefined,
      path,
    });
  });
});

describe('openProject', () => {
  it('should open the project around the start folder with what it declares resolved when it has a release', () => {
    // Arrange
    const text = yamlOf({
      axes: 'axes: [workflow]',
      check: 'check: bun run check',
      domains: 'domains: [ui]',
      packages: 'packages:\n  apps/web:\n    packs: [elsewhere]',
    });
    const files = createFakeProjectFiles(
      projectTreeOf({
        blocks: [
          {
            body: UI_RULES,
            id: 'ui',
          },
        ],
        config: text,
        files: {
          [`${PROJECT}/src/main.ts`]: 'export {};\n',
        },
      }),
    );

    // Act
    const opened = openProject({
      clock: createFakeClock(TODAY),
      configParser: parsers().configParser,
      files,
      frontMatterParser: parsers().frontMatterParser,
      start: `${PROJECT}/src`,
    });

    // Assert
    expect(opened).toStrictEqual({
      archive: ARCHIVE,
      config: parsedOf(text),
      project: PROJECT,
      resolution: {
        active: [
          {
            app: '',
            files: [
              'blocks/domains/ui/ui.md',
            ],
            globs: [],
            id: 'ui',
            scope: 0,
          },
          {
            app: 'apps/web',
            files: [
              'blocks/domains/ui/ui.md',
            ],
            globs: [],
            id: 'ui',
            scope: 1,
          },
        ],
        blocks: [
          {
            id: 'core',
            layer: Layer.Core,
          },
          {
            id: 'ui',
            layer: Layer.Domain,
          },
        ],
        check: 'bun run check',
        count: 2,
        index: [
          '## Domains (blocks/domains/<id>/<id>.md)',
          "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.",
          '- ui: The ui block.',
        ],
        musts: [
          {
            block: 'ui',
            rule: 'inputs-are-labelled',
          },
        ],
        units: [
          unitOf({
            axes: [
              Axis.Foundation,
              Axis.Workflow,
            ],
            blocks: new Set([
              'core',
              'ui',
            ]),
          }),
          unitOf({
            axes: [
              Axis.Foundation,
              Axis.Workflow,
            ],
            blocks: new Set([
              'core',
              'ui',
            ]),
            path: 'apps/web',
            scope: 1,
          }),
        ],
        warnings: [
          {
            code: WarningCode.Constitution,
            message:
              '/work/project/.droneey/constitution/blocks/core/core.md has no front matter — the block is read without it',
          },
        ],
      },
    });
  });

  it.each([
    {
      code: ProjectFailure.NoProject,
      condition: 'no folder around the start holds constitution.yaml',
      line: undefined,
      path: '/work/elsewhere',
      start: '/work/elsewhere',
      tree: {
        files: {
          '/work/elsewhere/README.md': '# Elsewhere\n',
        },
      },
    },
    {
      code: ProjectFailure.ArchiveMissing,
      condition: 'the project has no release installed',
      line: undefined,
      path: ARCHIVE,
      start: PROJECT,
      tree: {
        files: {
          [CONFIG]: yamlOf(),
          [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
        },
      },
    },
    {
      code: ProjectFailure.ConfigUnparsed,
      condition: 'constitution.yaml does not parse',
      line: 3,
      path: CONFIG,
      start: PROJECT,
      tree: projectTreeOf({
        config: 'axes: []\ndomains: []\n  - ui\n',
      }),
    },
  ])('should fail with $code when $condition', ({ code, line, path, start, tree }) => {
    // Arrange
    const files = createFakeProjectFiles(tree);

    // Act
    const failure = failureOf(() =>
      openProject({
        clock: createFakeClock(TODAY),
        configParser: parsers().configParser,
        files,
        frontMatterParser: parsers().frontMatterParser,
        start,
      }),
    );

    // Assert
    expect(failure).toStrictEqual({
      code,
      line,
      path,
    });
  });
});
