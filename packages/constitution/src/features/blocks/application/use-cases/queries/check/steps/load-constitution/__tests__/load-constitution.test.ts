import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import { RuleFormCode, ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { Files } from '../../../../../../../__tests__/constitution.fixtures';
import {
  blockFiles,
  chapterFile,
  passportFile,
  rule,
  textOf,
} from '../../../../../../../__tests__/constitution.fixtures';
import {
  nestedBlockFiles,
  nestedFiles,
} from '../../../../../../../__tests__/nested-files.fixtures';
import { packFiles } from '../../../../../../../__tests__/pack-files.fixtures';
import { validFiles } from '../../../../../../../__tests__/valid-files.fixtures';
import {
  Block,
  BlockFile,
  BlockLoadCode,
  FrontMatterReadCode,
  PlaceCode,
} from '../../../../../../../domain/block/entities';
import { LoadCode } from '../../../../../../../domain/constitution/entities';
import { ReadStatus } from '../../../../../../../domain/shared/entities';
import { TreePath } from '../../../../../../../domain/shared/value-objects';
import { loadedOf, packSourceOf } from '../../../__tests__/check.fixtures';
import type { ConstitutionLoaded } from '../load-constitution';
import { loadConstitution } from '../load-constitution';

type LoadFinding = ConstitutionLoaded['findings'][number];

const uiPassport = passportFile({
  body: '# UI\n',
  id: 'ui',
});

describe('loadConstitution', () => {
  it('should keep only the paths when the tree holds neither a block nor a document', () => {
    // Arrange
    const files = {
      'LICENSE.md': '# License\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded).toStrictEqual({
      constitution: {
        blocks: [],
        documents: {
          agents: [],
          skills: [],
        },
        paths: new Set([
          TreePath.create('LICENSE.md'),
        ]),
        repositoryPaths: new Set([
          TreePath.create('LICENSE.md'),
        ]),
        rules: [],
      },
      findings: [],
    });
  });

  it('should parse the plugin documents and keep the README and the log as text when every document exists', () => {
    // Arrange
    const files = validFiles();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents).toStrictEqual({
      agents: [],
      decisions: textOf({
        files,
        path: 'DECISIONS.md',
      }),
      hooks: {
        status: ReadStatus.Parsed,
        value: {
          commands: [],
        },
      },
      marketplace: {
        status: ReadStatus.Parsed,
        value: {
          plugins: [
            {
              name: 'constitution',
              path: '',
              ref: 'v1.0.0',
              repo: 'droneey/constitution',
            },
          ],
        },
      },
      plugin: {
        status: ReadStatus.Parsed,
        value: {
          name: 'constitution',
          repository: 'https://github.com/droneey/constitution',
          skills: [],
        },
      },
      readme: '# constitution\n\nStart with [core](blocks/core/core.md).\n',
      skills: [],
    });
  });

  it("should read each agent's front matter when files sit directly in ai/agents/, nested, hidden and other files aside", () => {
    // Arrange
    const files = {
      '.claude/agents/local.md': '---\nname: local\n---\n',
      'ai/agents/.draft.md': '---\nname: draft\n---\n',
      'ai/agents/notes/reviewer.md': '---\nname: nested\n---\n',
      'ai/agents/reviewer.md.orig': '---\nname: backup\n---\n',
      'ai/agents/reviewer.md':
        '---\nname: reviewer\ndescription: Reviews files.\n---\n\nYou review.\n',
      'ai/agents/scribe.md': '# Scribe\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.documents.agents).toStrictEqual([
      {
        file: 'reviewer',
        frontMatter: {
          description: 'Reviews files.',
          name: 'reviewer',
          status: ReadStatus.Parsed,
        },
        path: TreePath.create('ai/agents/reviewer.md'),
      },
      {
        file: 'scribe',
        path: TreePath.create('ai/agents/scribe.md'),
      },
    ]);
  });

  it('should load every block without a finding, ordered by layer and then by id, when a platform id sorts after a language id', () => {
    // Arrange
    const files = {
      ...validFiles(),
      ...blockFiles({
        body: '# Web\n',
        dir: 'blocks/contexts/platforms/web',
        id: 'web',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      blocks: loaded.constitution.blocks.map((block) => `${block.layer} ${block.id}`),
      findings: loaded.findings,
    }).toStrictEqual({
      blocks: [
        'core core',
        'domain i18n',
        'domain remote-data',
        'domain ui',
        'domain untrusted-client',
        'platform browser',
        'platform web',
        'language typescript',
        'implementation biome',
        'implementation lingui',
        'implementation react',
        'implementation react/react-dom',
      ],
      findings: [],
    });
  });

  it.each([
    'blocks/core',
    'blocks/domains/ui.md',
  ])(
    'should report %p as outside every block folder when it sits above the block folders',
    (path) => {
      // Arrange
      const files = {
        [path]: 'text\n',
      };

      // Act
      const loaded = loadedOf(files);

      // Assert
      expect(loaded.findings).toStrictEqual([
        {
          code: PlaceCode.OutsideBlockFolder,
          details: {},
          path,
        },
      ]);
    },
  );

  it.each([
    'blocks/domains/ui/parts.md',
    'blocks/domains/ui/architecture',
    'blocks/domains/ui/.draft.md',
    'blocks/domains/ui/parts.mdx',
    'blocks/domains/ui/parts/a.md',
    'blocks/domains/ui/@architecture/.draft.md',
    'blocks/domains/ui/@architecture/parts/a.md',
    'blocks/domains/ui/@workflow/with/notes.txt',
  ])(
    "should report %p as a stray file when it sits at the block's root beside its passport, is hidden, nested, not markdown or in a folder that is neither an axis nor with/",
    (path) => {
      // Arrange
      const files = {
        [path]: 'text\n',
      };

      // Act
      const loaded = loadedOf(files);

      // Assert
      expect(loaded.findings).toStrictEqual([
        {
          code: PlaceCode.StrayBlockFile,
          details: {},
          path,
        },
      ]);
    },
  );

  it.each<{
    condition: string;
    files: Files;
    finding: LoadFinding;
  }>([
    {
      condition: "a block's folder is named by no kebab-case id",
      files: {
        'blocks/domains/Design_System/Design_System.md': uiPassport,
        'blocks/domains/Design_System/@foundation/tokens.md': '# Tokens\n',
      },
      finding: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.BlockFolder,
          written: 'Design_System',
        },
        path: 'blocks/domains/Design_System',
      },
    },
    {
      condition: 'a seam is named by no kebab-case id',
      files: {
        'blocks/domains/ui/@architecture/with/Remote_Data.md': '# UI with remote data\n',
        'blocks/domains/ui/ui.md': uiPassport,
      },
      finding: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.SeamFile,
        },
        path: 'blocks/domains/ui/@architecture/with/Remote_Data.md',
      },
    },
    {
      condition: "a rule's heading names no kebab-case slug",
      files: {
        'blocks/domains/ui/@foundation/forms.md': `# Forms\n\n## General\n\n${rule({
          slug: 'Inputs_Labelled',
        })}`,
        'blocks/domains/ui/ui.md': uiPassport,
      },
      finding: {
        code: ValueFailure.RuleSlug,
        details: {
          site: ValueSite.RuleHeading,
          written: 'Inputs_Labelled',
        },
        path: 'blocks/domains/ui/@foundation/forms.md',
      },
    },
  ])('should report the malformed name where it is read when $condition', ({ files, finding }) => {
    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      finding,
    ]);
  });

  it('should report each misnamed folder once when two of them hold several files', () => {
    // Arrange
    const files = {
      'blocks/domains/Design_System/Design_System.md': uiPassport,
      'blocks/domains/Design_System/@foundation/tokens.md': '# Tokens\n',
      'blocks/domains/Remote_Data/Remote_Data.md': uiPassport,
      'blocks/domains/Remote_Data/@foundation/fetching.md': '# Fetching\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.BlockFolder,
          written: 'Design_System',
        },
        path: 'blocks/domains/Design_System',
      },
      {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.BlockFolder,
          written: 'Remote_Data',
        },
        path: 'blocks/domains/Remote_Data',
      },
    ]);
  });

  it('should load the passport, the chapters by axis, then the seams by axis, when the tree lists them otherwise', () => {
    // Arrange
    const files = {
      'blocks/domains/ui/@architecture/remote-data.md': '# Remote data\n\nText.',
      'blocks/domains/ui/@architecture/with/remote-data.md': '# UI with remote data\n',
      'blocks/domains/ui/@foundation/b.md': '# B\n',
      'blocks/domains/ui/@foundation/a.md': '# A\n',
      'blocks/domains/ui/@foundation/with/i18n.md': '# UI with i18n\n',
      'blocks/domains/ui/ui.md': uiPassport,
      'blocks/domains/ui/@workflow/reviews.md': '# Reviews\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      files: loaded.constitution.blocks.map((block) => Block.filesOf(block)),
      findings: loaded.findings,
    }).toStrictEqual({
      files: [
        [
          BlockFile.passport({
            axis: Axis.Foundation,
            body: '\n# UI\n',
            lines: 9,
            path: 'blocks/domains/ui/ui.md',
          }),
          BlockFile.chapter({
            axis: Axis.Foundation,
            body: '# A\n',
            lines: 1,
            path: 'blocks/domains/ui/@foundation/a.md',
          }),
          BlockFile.chapter({
            axis: Axis.Foundation,
            body: '# B\n',
            lines: 1,
            path: 'blocks/domains/ui/@foundation/b.md',
          }),
          BlockFile.chapter({
            axis: Axis.Architecture,
            body: '# Remote data\n\nText.',
            lines: 3,
            path: 'blocks/domains/ui/@architecture/remote-data.md',
          }),
          BlockFile.chapter({
            axis: Axis.Workflow,
            body: '# Reviews\n',
            lines: 1,
            path: 'blocks/domains/ui/@workflow/reviews.md',
          }),
          BlockFile.seam(
            {
              axis: Axis.Foundation,
              body: '# UI with i18n\n',
              lines: 1,
              path: 'blocks/domains/ui/@foundation/with/i18n.md',
            },

            BlockId.create('i18n'),
          ),
          BlockFile.seam(
            {
              axis: Axis.Architecture,
              body: '# UI with remote data\n',
              lines: 1,
              path: 'blocks/domains/ui/@architecture/with/remote-data.md',
            },

            BlockId.create('remote-data'),
          ),
        ],
      ],
      findings: [],
    });
  });

  it.each<{
    files: Files;
    finding: LoadFinding;
  }>([
    {
      files: {
        'blocks/domains/ui/@foundation/with/i18n.md': '---\nid: i18n\n---\n# UI with i18n\n',
        'blocks/domains/ui/ui.md': uiPassport,
      },
      finding: {
        code: BlockLoadCode.SecondaryFrontMatter,
        details: {},
        path: 'blocks/domains/ui/@foundation/with/i18n.md',
      },
    },
    {
      files: {
        'blocks/domains/ui/@architecture/ui.md': '# UI\n',
        'blocks/domains/ui/ui.md': uiPassport,
      },
      finding: {
        code: PlaceCode.ChapterNamedAfterBlock,
        details: {},
        path: 'blocks/domains/ui/@architecture/ui.md',
      },
    },
  ])(
    'should report $finding.code when a file breaks the layout of its block',
    ({ files, finding }) => {
      // Act
      const loaded = loadedOf(files);

      // Assert
      expect(loaded.findings).toStrictEqual([
        finding,
      ]);
    },
  );

  it.each<{
    files: Files;
    finding: LoadFinding;
    name: string;
  }>([
    {
      files: {
        'blocks/domains/ui/@foundation/screens.md': '# Screens\n',
      },
      finding: {
        code: BlockLoadCode.WithoutPassport,
        details: {
          id: BlockId.create('ui'),
        },
        path: 'blocks/domains/ui',
      },
      name: 'a layer folder has no passport',
    },
    {
      files: {
        'blocks/domains/ui/ui.md': '# UI\n',
      },
      finding: {
        code: FrontMatterReadCode.Missing,
        details: {},
        path: 'blocks/domains/ui/ui.md',
      },
      name: 'its passport has no front matter',
    },
  ])('should load no block and report why when $name', ({ files, finding }) => {
    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      blocks: loaded.constitution.blocks,
      findings: loaded.findings,
    }).toStrictEqual({
      blocks: [],
      findings: [
        finding,
      ],
    });
  });

  it('should report every block that shares its id when three layers hold the same id', () => {
    // Arrange
    const files = {
      'blocks/contexts/platforms/ui/ui.md': passportFile({
        body: '# UI platform\n',
        id: 'ui',
      }),
      'blocks/domains/ui/ui.md': uiPassport,
      'blocks/implementations/ui/ui.md': passportFile({
        body: '# UI kit\n',
        id: 'ui',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        code: LoadCode.IdShared,
        details: {
          id: BlockId.create('ui'),
          others: [
            'blocks/contexts/platforms/ui/ui.md',
            'blocks/implementations/ui/ui.md',
          ],
        },
        path: 'blocks/domains/ui/ui.md',
      },
      {
        code: LoadCode.IdShared,
        details: {
          id: BlockId.create('ui'),
          others: [
            'blocks/domains/ui/ui.md',
            'blocks/implementations/ui/ui.md',
          ],
        },
        path: 'blocks/contexts/platforms/ui/ui.md',
      },
      {
        code: LoadCode.IdShared,
        details: {
          id: BlockId.create('ui'),
          others: [
            'blocks/domains/ui/ui.md',
            'blocks/contexts/platforms/ui/ui.md',
          ],
        },
        path: 'blocks/implementations/ui/ui.md',
      },
    ]);
  });

  it('should gather the rules and their findings of every block when they spread over chapters and seams', () => {
    // Arrange
    const files = {
      'blocks/domains/i18n/@foundation/plurals.md': `# i18n\n\n${rule({
        slug: 'i18n-plurals-by-cldr',
      })}`,
      'blocks/domains/i18n/i18n.md': passportFile({
        body: '# i18n\n',
        id: 'i18n',
      }),
      'blocks/implementations/lingui/@architecture/with/react/react-dom.md': [
        '# React DOM',
        '',
        rule({
          slug: 'provider-at-the-root',
        }),
      ].join('\n'),
      'blocks/implementations/lingui/@workflow/catalogs.md': [
        '# Catalogs',
        '',
        '## loose · MUST',
        '',
        rule({
          slug: 'catalogs-are-compiled',
        }),
      ].join('\n'),
      'blocks/implementations/lingui/lingui.md': passportFile({
        body: '# Lingui\n',
        id: 'lingui',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      findings: loaded.findings,
      rules: loaded.constitution.rules.map((parsed) => [
        parsed.block,
        parsed.axis,
        parsed.file,
        parsed.seam,
        parsed.slug,
      ]),
    }).toStrictEqual({
      findings: [
        {
          code: RuleFormCode.HeadingMisshapen,
          details: {
            heading: '## loose · MUST',
          },
          path: 'blocks/implementations/lingui/@workflow/catalogs.md',
        },
      ],
      rules: [
        [
          'i18n',
          'foundation',
          'blocks/domains/i18n/@foundation/plurals.md',
          undefined,
          'i18n-plurals-by-cldr',
        ],
        [
          'lingui',
          'workflow',
          'blocks/implementations/lingui/@workflow/catalogs.md',
          undefined,
          'catalogs-are-compiled',
        ],
        [
          'lingui',
          'architecture',
          'blocks/implementations/lingui/@architecture/with/react/react-dom.md',
          'react/react-dom',
          'provider-at-the-root',
        ],
      ],
    });
  });

  it('should read no rule when it sits in a code fence', () => {
    // Arrange
    const files = {
      'blocks/implementations/lingui/@foundation/samples.md': [
        '# Samples',
        '',
        '```markdown',
        rule({
          slug: 'sample-rule',
        }),
        '```',
        '',
      ].join('\n'),
      'blocks/implementations/lingui/lingui.md': passportFile({
        body: '# Lingui\n',
        id: 'lingui',
      }),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.constitution.rules).toStrictEqual([]);
  });

  it.each([
    {
      expected: '.droneey/constitution/blocks/core/core.md',
      folder: '.droneey/constitution',
    },
    {
      expected: '.droneey/constitution/blocks/core/core.md',
      folder: './.droneey/constitution/',
    },
    {
      expected: '/work/constitution/blocks/core/core.md',
      folder: '/work/constitution/',
    },
  ])(
    "should load the base's blocks beside the pack's, each by its path under the base's folder, when the pack extends the base in $folder",
    ({ expected, folder }) => {
      // Arrange
      const source = packSourceOf({
        base: validFiles(),
        folder,
        pack: packFiles(),
      });

      // Act
      const { constitution } = loadConstitution(source);

      // Assert
      expect({
        paths: constitution.blocks
          .map((block) => block.passport.path)
          .filter((path) => path.includes('acme') || path.includes('core/')),
      }).toStrictEqual({
        paths: [
          expected,
          'blocks/implementations/acme/acme.md',
        ],
      });
    },
  );

  it.each<{
    base: Files;
    condition: string;
    findings: readonly LoadFinding[];
  }>([
    {
      base: validFiles(),
      condition: 'loads',
      findings: [],
    },
    {
      base: {
        ...validFiles(),
        'blocks/domains/ui/drafts.txt': 'drafts\n',
        'blocks/domains/ui/notes.txt': 'notes\n',
      },
      condition: 'does not load',
      findings: [
        {
          code: LoadCode.BaseDoesNotLoad,
          details: {},
          path: '.droneey/constitution',
        },
      ],
    },
  ])(
    'should report the base once, at its folder, only when the base the pack extends $condition',
    ({ base, findings }) => {
      // Arrange
      const source = packSourceOf({
        base,
        pack: packFiles(),
      });

      // Act
      const loaded = loadConstitution(source);

      // Assert
      expect(loaded.findings).toStrictEqual(findings);
    },
  );
});

describe('loadConstitution of nested blocks', () => {
  it('should load every block by its id path without a finding when its axis folders are marked by @', () => {
    // Arrange
    const files = nestedFiles();

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect({
      blocks: loaded.constitution.blocks.map((block) => String(block.id)),
      findings: loaded.findings,
      rules: loaded.constitution.rules.map((stated) => [
        String(stated.slug),
        stated.seam,
      ]),
    }).toStrictEqual({
      blocks: [
        'core',
        'presentation',
        'presentation/design-system',
        'client',
        'client/browser',
        'typescript',
        'js-runtime',
        'js-runtime/bun',
        'react',
        'react/ink',
        'react/react-dom',
        'task-runner',
      ],
      findings: [],
      rules: [
        [
          'code-reads-as-prose',
          undefined,
        ],
        [
          'screen-shows-one-task',
          undefined,
        ],
        [
          'colour-taken-from-a-token',
          undefined,
        ],
        [
          'tab-keeps-no-secret',
          undefined,
        ],
        [
          'hook-named-by-its-use',
          undefined,
        ],
        [
          'terminal-colour-taken-from-a-token',
          'presentation/design-system',
        ],
      ],
    });
  });

  it('should take a MAY heading for a finding, since only an override sets a rule to MAY', () => {
    // Arrange
    const path = 'blocks/contexts/platforms/client/browser/@foundation/cache.md';
    const files = {
      ...nestedFiles(),
      [path]: chapterFile(
        'Cache',
        rule({
          level: 'MAY',
          slug: 'tab-may-cache',
        }),
      ),
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        code: RuleFormCode.LevelRetired,
        details: {
          slug: RuleSlug.create('tab-may-cache'),
        },
        path,
      },
    ]);
  });

  it("should load a pack's child block under a parent of the release it extends", () => {
    // Arrange
    const source = packSourceOf({
      base: nestedFiles(),
      pack: nestedBlockFiles({
        id: 'react/preact',
        layerFolder: 'implementations',
      }),
    });

    // Act
    const loaded = loadConstitution(source);

    // Assert
    expect({
      findings: loaded.findings,
      own: loaded.constitution.blocks.filter((block) => !Block.isBase(block)).map(Block.linksOf),
    }).toStrictEqual({
      findings: [],
      own: [
        [
          BlockId.create('react'),
        ],
      ],
    });
  });

  it('should report a child block without its passport when its folder holds only an axis', () => {
    // Arrange
    const files = {
      ...nestedFiles(),
      'blocks/implementations/react/react-native/@foundation/components.md': '# Components\n',
    };

    // Act
    const loaded = loadedOf(files);

    // Assert
    expect(loaded.findings).toStrictEqual([
      {
        code: BlockLoadCode.WithoutPassport,
        details: {
          id: BlockId.create('react/react-native'),
        },
        path: 'blocks/implementations/react/react-native',
      },
    ]);
  });
});
