import { describe, expect, it } from 'bun:test';

import { Axis, Layer, Level } from '#/kernel/constants';
import { Met, TermKind, WarningKind } from '#/kernel/entities';
import {
  AbsolutePath,
  BlockId,
  BlockSource,
  Glob,
  PackPath,
  RuleSlug,
  SourceKind,
} from '#/kernel/value-objects';

import {
  blockSetBlockOf,
  blockSetRuleOf,
} from '../../../../../../../../../__tests__/block-set.fixtures';
import { passportOf, ruleOf } from '../../../../../../../../../__tests__/project.fixtures';
import type { BlockSetSource } from '../../../../../../../../entities';
import { SourceStatus } from '../../../../../../../../entities';
import { ancestorsOf, blockSetAnswerOf, blockSetOf, packOf, sourceOf } from './block-set.fixtures';

const PLAIN = '# A file\n';

describe('readBlockSet', () => {
  it('should read every block, chapter, seam, rule, answer and role term in block set order, leaving out a glob whose braces do not pair, when the release and a pack are whole', () => {
    // Arrange
    const sources = [
      sourceOf({
        files: {
          'blocks/domains/ui/architecture/with/api.md': [
            'Its calls sit in **`calls/`**{#api-call}.',
            '',
            ruleOf({
              tightens: 'core-rule',
              slug: 'ui-calls-api',
            }),
          ].join('\n'),
          'blocks/domains/ui/workflow/review.md': ruleOf({
            level: 'MAY',
            slug: 'ui-review',
          }),
          'blocks/domains/ui/ui.md': passportOf({
            body: [
              'A **binding unit** lives in **`screens/`**, named **`.screen`**, beside **`index.ts`**.',
              '',
              '```markdown',
              '**`fenced/`**',
              '### fenced-example · MUST',
              '```',
              '',
              '## Requirements',
              '',
              '| Requirement | How | Met |',
              '|---|---|---|',
              '| `formatter` | by biome | yes |',
              '| `linter` | by biome | soon |',
              '',
            ].join('\n'),
            governs: [
              '**/*.tsx',
              '**/*.{ts',
            ],
            id: 'ui',
            requires: [
              'api',
            ],
          }),
          'blocks/domains/README.md': PLAIN,
          'blocks/contexts/languages/python/python.md': passportOf({
            id: 'python',
          }),
          'blocks/contexts/platforms/web/web.md': passportOf({
            id: 'web',
          }),
          'blocks/domains/api/api.md': passportOf({
            abstract: true,
            id: 'api',
          }),
          'blocks/core/foundation/code.md': [
            'The **`kernel/`** holds the shared domain.',
            '',
            ruleOf({
              level: 'SHOULD',
              slug: 'small-functions',
            }),
          ].join('\n'),
          'blocks/core/core.md': passportOf({
            body: ruleOf({
              level: 'MUST',
              slug: 'core-rule',
            }),
            id: 'core',
          }),
        },
      }),
      packOf({
        files: {
          'blocks/implementations/kit/kit.md': passportOf({
            body: [
              'Its screens sit in **`screens/`** too.',
              '',
              ruleOf({
                tightens: 'ui-review',
                slug: 'kit-rule',
              }),
            ].join('\n'),
            extends: 'api',
            id: 'kit',
            languages: [
              'python',
              'Not An Id',
            ],
          }),
        },
        source: 'rules',
      }),
    ];

    // Act
    const blockSet = blockSetOf(sources);

    // Assert
    expect(blockSet).toStrictEqual({
      ancestors: ancestorsOf({
        api: [],
        kit: [
          'api',
        ],
      }),
      answers: [
        blockSetAnswerOf({
          block: 'ui',
          met: Met.Yes,
          requirement: 'formatter',
        }),
        blockSetAnswerOf({
          block: 'ui',
          requirement: 'linter',
        }),
      ],
      blocks: [
        blockSetBlockOf({
          chapters: [
            'foundation/code.md',
          ],
          id: 'core',
          layer: Layer.Core,
        }),
        blockSetBlockOf({
          id: 'api',
          isAbstract: true,
        }),
        blockSetBlockOf({
          chapters: [
            'workflow/review.md',
          ],
          governs: [
            '**/*.tsx',
          ],
          id: 'ui',
          requires: [
            'api',
          ],
          seams: [
            'architecture/api',
          ],
        }),
        blockSetBlockOf({
          id: 'web',
          layer: Layer.Platform,
        }),
        blockSetBlockOf({
          id: 'python',
          layer: Layer.Language,
        }),
        blockSetBlockOf({
          extends: 'api',
          id: 'kit',
          languages: [
            'python',
          ],
          layer: Layer.Implementation,
          source: 'rules',
        }),
      ],
      roles: [
        {
          axis: Axis.Foundation,
          block: BlockId.create('core'),
          kind: TermKind.Folder,
          term: 'kernel/',
        },
        {
          axis: Axis.Foundation,
          block: BlockId.create('ui'),
          kind: TermKind.Folder,
          term: 'screens/',
        },
        {
          axis: Axis.Foundation,
          block: BlockId.create('ui'),
          kind: TermKind.Suffix,
          term: '.screen',
        },
        {
          axis: Axis.Architecture,
          block: BlockId.create('ui'),
          id: 'api-call',
          kind: TermKind.Folder,
          seam: BlockId.create('api'),
          term: 'calls/',
        },
      ],
      rules: [
        blockSetRuleOf({
          block: 'core',
          slug: 'core-rule',
        }),
        blockSetRuleOf({
          block: 'core',
          level: Level.Should,
          slug: 'small-functions',
        }),
        blockSetRuleOf({
          axis: Axis.Workflow,
          block: 'ui',
          level: Level.May,
          slug: 'ui-review',
        }),
        blockSetRuleOf({
          axis: Axis.Architecture,
          block: 'ui',
          isLevelStated: false,
          tightens: 'core-rule',
          slug: 'ui-calls-api',
          seam: 'api',
        }),
        blockSetRuleOf({
          block: 'kit',
          isLevelStated: false,
          level: Level.May,
          tightens: 'ui-review',
          slug: 'kit-rule',
        }),
      ],
      warnings: [],
    });
  });

  it("should read a pack's passport whose lines end with CRLF by its front matter", () => {
    // Arrange
    const sources = [
      packOf({
        files: {
          'blocks/implementations/kit/kit.md': passportOf({
            governs: [
              '**/kit/**',
            ],
            id: 'kit',
          }).replaceAll('\n', '\r\n'),
        },
        source: 'rules',
      }),
    ];

    // Act
    const blockSet = blockSetOf(sources);

    // Assert
    expect({
      governs: blockSet.blocks.map((block) => block.governs),
      warnings: blockSet.warnings,
    }).toStrictEqual({
      governs: [
        [
          Glob.create('**/kit/**'),
        ],
      ],
      warnings: [],
    });
  });

  it('should list the bases of a block nearest first, as far as each is a block, when its bases chain, close in a cycle or end at no block', () => {
    // Arrange
    const sources = [
      sourceOf({
        files: {
          'blocks/domains/a/a.md': passportOf({
            abstract: true,
            id: 'a',
          }),
          'blocks/domains/b/b.md': passportOf({
            abstract: true,
            extends: 'a',
            id: 'b',
          }),
          'blocks/domains/c/c.md': passportOf({
            extends: 'b',
            id: 'c',
          }),
          'blocks/domains/d/d.md': passportOf({
            abstract: true,
            extends: 'ghost',
            id: 'd',
          }),
          'blocks/domains/e/e.md': passportOf({
            extends: 'd',
            id: 'e',
          }),
          'blocks/domains/x/x.md': passportOf({
            abstract: true,
            extends: 'y',
            id: 'x',
          }),
          'blocks/domains/y/y.md': passportOf({
            abstract: true,
            extends: 'x',
            id: 'y',
          }),
        },
      }),
    ];

    // Act
    const blockSet = blockSetOf(sources);

    // Assert
    expect(blockSet).toStrictEqual({
      ancestors: ancestorsOf({
        a: [],
        b: [
          'a',
        ],
        c: [
          'b',
          'a',
        ],
        d: [],
        e: [
          'd',
        ],
        y: [
          'x',
        ],
        x: [
          'y',
          'x',
        ],
      }),
      answers: [],
      blocks: [
        blockSetBlockOf({
          id: 'a',
          isAbstract: true,
        }),
        blockSetBlockOf({
          extends: 'a',
          id: 'b',
          isAbstract: true,
        }),
        blockSetBlockOf({
          extends: 'b',
          id: 'c',
        }),
        blockSetBlockOf({
          extends: 'ghost',
          id: 'd',
          isAbstract: true,
        }),
        blockSetBlockOf({
          extends: 'd',
          id: 'e',
        }),
        blockSetBlockOf({
          extends: 'y',
          id: 'x',
          isAbstract: true,
        }),
        blockSetBlockOf({
          extends: 'x',
          id: 'y',
          isAbstract: true,
        }),
      ],
      roles: [],
      rules: [],
      warnings: [
        {
          details: {
            base: 'ghost',
            block: BlockId.create('d'),
            source: SourceKind.Release,
          },
          kind: WarningKind.BaseNoBlock,
        },
      ],
    });
  });

  it.each<{
    condition: string;
    expected: ReturnType<typeof blockSetOf>;
    sources: readonly BlockSetSource[];
  }>([
    {
      condition: 'a pack is not installed',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'kit',
            layer: Layer.Implementation,
            source: 'more',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              where: '/project/tools/rules',
            },
            kind: WarningKind.PackNotInstalled,
          },
        ],
      },
      sources: [
        sourceOf({}),
        {
          shownFolderPath: AbsolutePath.create('/project/tools/rules'),
          source: BlockSource.create(PackPath.create('tools/rules')),
          status: SourceStatus.Unlisted,
        },
        packOf({
          files: {
            'blocks/implementations/kit/kit.md': passportOf({
              id: 'kit',
            }),
          },
          source: 'more',
        }),
      ],
    },
    {
      condition: 'a file of the release lies outside every block folder',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              file: '/release/blocks/README.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.OutsideBlockFolder,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/README.md': PLAIN,
          },
        }),
      ],
    },
    {
      condition: 'a pack holds core',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              file: '/project/rules/blocks/core/core.md',
              source: SourceKind.Pack,
            },
            kind: WarningKind.OutsideBlockFolder,
          },
        ],
      },
      sources: [
        packOf({
          files: {
            'blocks/core/core.md': passportOf({
              id: 'core',
            }),
          },
          source: 'rules',
        }),
      ],
    },
    {
      condition: 'a passport cannot be read',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'ui',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              file: '/release/blocks/domains/ui/ui.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.FileUnreadable,
          },
        ],
      },
      sources: [
        sourceOf({
          unreadable: [
            'blocks/domains/ui/ui.md',
          ],
        }),
      ],
    },
    {
      condition: 'a chapter of a pack cannot be read',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            chapters: [
              'foundation/screens.md',
            ],
            id: 'ui',
            source: 'rules',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              file: '/project/rules/blocks/domains/ui/foundation/screens.md',
              source: SourceKind.Pack,
            },
            kind: WarningKind.FileUnreadable,
          },
        ],
      },
      sources: [
        packOf({
          files: {
            'blocks/domains/ui/ui.md': passportOf({
              id: 'ui',
            }),
          },
          source: 'rules',
          unreadable: [
            'blocks/domains/ui/foundation/screens.md',
          ],
        }),
      ],
    },
    {
      condition: "a block's folder or a seam is named by no kebab-case id",
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'ui',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              file: '/release/blocks/domains/Design_System/Design_System.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.FolderMisnamed,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/architecture/with/Remote_Data.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/domains/Design_System/Design_System.md': passportOf({
              id: 'design-system',
            }),
            'blocks/domains/ui/architecture/with/Remote_Data.md': '# UI with remote data\n',
            'blocks/domains/ui/ui.md': passportOf({
              id: 'ui',
            }),
          },
        }),
      ],
    },
    {
      condition: 'a passport has no front matter',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'ui',
          }),
        ],
        roles: [],
        rules: [
          blockSetRuleOf({
            block: 'ui',
            level: Level.Should,
            slug: 'bare',
          }),
        ],
        warnings: [
          {
            details: {
              file: '/release/blocks/domains/ui/ui.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.FrontMatterMissing,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/domains/ui/ui.md': `# ui\n\n${ruleOf({
              level: 'SHOULD',
              slug: 'bare',
            })}`,
          },
        }),
      ],
    },
    {
      condition: 'files of a block are neither a chapter nor a seam of an axis',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'ui',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              file: '/release/blocks/domains/ui/foundation/a.md/b.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/foundation/deep/with/a.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/foundation/deep/x.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/foundation/with/a.md/b.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/foundation/with/deep/x.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/guides/a.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/guides/with/a.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
          {
            details: {
              file: '/release/blocks/domains/ui/notes.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.NotBlockFile,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/domains/ui/foundation/a.md/b.md': PLAIN,
            'blocks/domains/ui/foundation/deep/with/a.md': PLAIN,
            'blocks/domains/ui/foundation/deep/x.md': PLAIN,
            'blocks/domains/ui/foundation/with/a.md/b.md': PLAIN,
            'blocks/domains/ui/foundation/with/deep/x.md': PLAIN,
            'blocks/domains/ui/guides/a.md': PLAIN,
            'blocks/domains/ui/guides/with/a.md': PLAIN,
            'blocks/domains/ui/notes.md': PLAIN,
            'blocks/domains/ui/ui.md': passportOf({
              id: 'ui',
            }),
          },
        }),
      ],
    },
    {
      condition: 'packs repeat a block read before them',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'ui',
          }),
          blockSetBlockOf({
            id: 'kit',
            layer: Layer.Implementation,
            source: 'rules',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              block: BlockId.create('ui'),
              file: '/project/rules/blocks/domains/ui/ui.md',
              source: SourceKind.Pack,
            },
            kind: WarningKind.BlockRepeated,
          },
          {
            details: {
              block: BlockId.create('ui'),
              file: '/project/more/blocks/domains/ui/ui.md',
              source: SourceKind.Pack,
            },
            kind: WarningKind.BlockRepeated,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/domains/ui/ui.md': passportOf({
              id: 'ui',
            }),
          },
        }),
        packOf({
          files: {
            'blocks/domains/ui/foundation/screens.md': ruleOf({
              level: 'MUST',
              slug: 'pack-rule',
            }),
            'blocks/domains/ui/ui.md': passportOf({
              id: 'ui',
            }),
            'blocks/implementations/kit/kit.md': passportOf({
              id: 'kit',
            }),
          },
          source: 'rules',
        }),
        packOf({
          files: {
            'blocks/domains/ui/ui.md': passportOf({
              id: 'ui',
            }),
          },
          source: 'more',
        }),
      ],
    },
    {
      condition: 'a source holds one block in two layer folders',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            chapters: [
              'foundation/screens.md',
            ],
            governs: [
              'domains/**',
            ],
            id: 'twin',
          }),
          blockSetBlockOf({
            id: 'alpha',
            layer: Layer.Language,
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              block: BlockId.create('twin'),
              file: '/release/blocks/contexts/languages/twin/twin.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.BlockRepeated,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/contexts/languages/alpha/alpha.md': passportOf({
              id: 'alpha',
            }),
            'blocks/contexts/languages/twin/foundation/types.md': PLAIN,
            'blocks/contexts/languages/twin/twin.md': passportOf({
              governs: [
                'languages/**',
              ],
              id: 'twin',
            }),
            'blocks/domains/twin/foundation/screens.md': PLAIN,
            'blocks/domains/twin/twin.md': passportOf({
              governs: [
                'domains/**',
              ],
              id: 'twin',
            }),
          },
        }),
      ],
    },
    {
      condition: 'a block of a source has its passport only in its second layer folder',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            chapters: [
              'foundation/screens.md',
            ],
            id: 'twin',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              block: BlockId.create('twin'),
              file: '/release/blocks/contexts/languages/twin/twin.md',
              source: SourceKind.Release,
            },
            kind: WarningKind.BlockRepeated,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/contexts/languages/twin/twin.md': passportOf({
              governs: [
                'languages/**',
              ],
              id: 'twin',
            }),
            'blocks/domains/twin/foundation/screens.md': PLAIN,
          },
        }),
      ],
    },
    {
      condition: 'a rule is stated twice',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            chapters: [
              'foundation/screens.md',
            ],
            id: 'ui',
          }),
        ],
        roles: [],
        rules: [
          blockSetRuleOf({
            block: 'ui',
            slug: 'one',
          }),
        ],
        warnings: [
          {
            details: {
              file: '/release/blocks/domains/ui/foundation/screens.md',
              rule: RuleSlug.create('one'),
              source: SourceKind.Release,
            },
            kind: WarningKind.RuleRepeated,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/domains/ui/foundation/screens.md': ruleOf({
              level: 'MAY',
              slug: 'one',
            }),
            'blocks/domains/ui/ui.md': passportOf({
              body: ruleOf({
                level: 'MUST',
                slug: 'one',
              }),
              id: 'ui',
            }),
          },
        }),
      ],
    },
    {
      condition: 'a block requires an unknown block and a name no block id could be',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'api',
          }),
          blockSetBlockOf({
            id: 'ui',
            requires: [
              'api',
              'ghost',
            ],
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              block: BlockId.create('ui'),
              required: 'ghost',
              source: SourceKind.Release,
            },
            kind: WarningKind.RequiredNoBlock,
          },
          {
            details: {
              block: BlockId.create('ui'),
              required: 'Bad_Name',
              source: SourceKind.Release,
            },
            kind: WarningKind.RequiredNoBlock,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/domains/api/api.md': passportOf({
              id: 'api',
            }),
            'blocks/domains/ui/ui.md': passportOf({
              id: 'ui',
              requires: [
                'api',
                'ghost',
                'Bad_Name',
              ],
            }),
          },
        }),
      ],
    },
    {
      condition: 'a block of a pack extends an unknown block',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            extends: 'ghost',
            id: 'kit',
            layer: Layer.Implementation,
            source: 'rules',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              base: 'ghost',
              block: BlockId.create('kit'),
              source: SourceKind.Pack,
            },
            kind: WarningKind.BaseNoBlock,
          },
        ],
      },
      sources: [
        packOf({
          files: {
            'blocks/implementations/kit/kit.md': passportOf({
              extends: 'ghost',
              id: 'kit',
            }),
          },
          source: 'rules',
        }),
      ],
    },
    {
      condition: 'a block extends a concrete block',
      expected: {
        ancestors: ancestorsOf({
          api: [],
          ui: [
            'api',
          ],
        }),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'api',
          }),
          blockSetBlockOf({
            extends: 'api',
            id: 'ui',
          }),
        ],
        roles: [],
        rules: [],
        warnings: [
          {
            details: {
              base: 'api',
              block: BlockId.create('ui'),
              source: SourceKind.Release,
            },
            kind: WarningKind.BaseConcrete,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/domains/api/api.md': passportOf({
              id: 'api',
            }),
            'blocks/domains/ui/ui.md': passportOf({
              extends: 'api',
              id: 'ui',
            }),
          },
        }),
      ],
    },
    {
      condition: 'a rule of the release tightens an unknown rule beside a pack',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          blockSetBlockOf({
            id: 'kit',
            layer: Layer.Implementation,
          }),
          blockSetBlockOf({
            id: 'lint',
            layer: Layer.Implementation,
            source: 'rules',
          }),
        ],
        roles: [],
        rules: [
          blockSetRuleOf({
            block: 'kit',
            isLevelStated: false,
            tightens: 'ghost',
            slug: 'kit-rule',
          }),
        ],
        warnings: [
          {
            details: {
              rule: RuleSlug.create('kit-rule'),
              source: SourceKind.Release,
              tightens: RuleSlug.create('ghost'),
            },
            kind: WarningKind.TightensUnknownRule,
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/implementations/kit/kit.md': passportOf({
              body: ruleOf({
                tightens: 'ghost',
                slug: 'kit-rule',
              }),
              id: 'kit',
            }),
          },
        }),
        packOf({
          files: {
            'blocks/implementations/lint/lint.md': passportOf({
              id: 'lint',
            }),
          },
          source: 'rules',
        }),
      ],
    },
  ])('should warn and read what it can when $condition', ({ expected, sources }) => {
    // Act
    const blockSet = blockSetOf(sources);

    // Assert
    expect(blockSet).toStrictEqual(expected);
  });
});
