import { describe, expect, it } from 'bun:test';

import { Axis, Layer, Level } from '#/kernel/constants';
import { Met, WarningKind } from '#/kernel/entities';
import { BlockId, BlockSource, PackPath, RuleSlug, SourceKind } from '#/kernel/value-objects';

import { passportOf, ruleOf } from '../../../../../../../../../__tests__/project.fixtures';
import type { CatalogueSource } from '../../../../../../../../entities';
import {
  ancestorsOf,
  catalogueAnswerOf,
  catalogueBlockOf,
  catalogueOf,
  catalogueRuleOf,
  packOf,
  sourceOf,
} from './catalogue.fixtures';

const PLAIN = '# A file\n';

describe('readCatalogue', () => {
  it('should read every block, chapter, seam, rule and answer in catalogue order, leaving out a glob that holds whitespace, when the release and a pack are whole', () => {
    // Arrange
    const sources = [
      sourceOf({
        files: {
          'blocks/domains/ui/architecture/with/api.md': ruleOf({
            tightens: 'core-rule',
            slug: 'ui-calls-api',
          }),
          'blocks/domains/ui/workflow/review.md': ruleOf({
            level: 'MAY',
            slug: 'ui-review',
          }),
          'blocks/domains/ui/ui.md': passportOf({
            body: [
              '```markdown',
              '### fenced-example · MUST',
              '```',
              '',
              '## Requirements',
              '',
              '| Requirement | How | Met |',
              '|---|---|---|',
              '| `formatter` | by biome | yes |',
              '',
            ].join('\n'),
            governs: [
              '**/*.tsx',
              'my file.tsx',
            ],
            id: 'ui',
            requires: [
              'api',
            ],
          }),
          'blocks/domains/ui/presets/biome.json': '{}',
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
          'blocks/core/foundation/code.md': ruleOf({
            level: 'SHOULD',
            slug: 'small-functions',
          }),
          'blocks/core/core.md': passportOf({
            body: ruleOf({
              level: 'MUST',
              slug: 'core-rule',
            }),
            id: 'core',
            summary: 'What holds.',
          }),
        },
      }),
      packOf({
        files: {
          'blocks/implementations/kit/kit.md': passportOf({
            body: ruleOf({
              tightens: 'ui-review',
              slug: 'kit-rule',
            }),
            extends: 'api',
            id: 'kit',
          }),
        },
        source: 'rules',
      }),
    ];

    // Act
    const catalogue = catalogueOf(sources);

    // Assert
    expect(catalogue).toStrictEqual({
      ancestors: ancestorsOf({
        api: [],
        kit: [
          'api',
        ],
      }),
      answers: [
        catalogueAnswerOf({
          block: 'ui',
          met: Met.Yes,
          requirement: 'formatter',
        }),
      ],
      blocks: [
        catalogueBlockOf({
          chapters: [
            'foundation/code.md',
          ],
          id: 'core',
          layer: Layer.Core,
          summary: 'What holds.',
        }),
        catalogueBlockOf({
          id: 'api',
          isAbstract: true,
        }),
        catalogueBlockOf({
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
        catalogueBlockOf({
          id: 'web',
          layer: Layer.Platform,
        }),
        catalogueBlockOf({
          id: 'python',
          layer: Layer.Language,
        }),
        catalogueBlockOf({
          extends: 'api',
          id: 'kit',
          layer: Layer.Implementation,
          source: 'rules',
        }),
      ],
      rules: [
        catalogueRuleOf({
          block: 'core',
          slug: 'core-rule',
        }),
        catalogueRuleOf({
          block: 'core',
          level: Level.Should,
          slug: 'small-functions',
        }),
        catalogueRuleOf({
          axis: Axis.Workflow,
          block: 'ui',
          level: Level.May,
          slug: 'ui-review',
        }),
        catalogueRuleOf({
          axis: Axis.Architecture,
          block: 'ui',
          isLevelStated: false,
          tightens: 'core-rule',
          slug: 'ui-calls-api',
          seam: 'api',
        }),
        catalogueRuleOf({
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
    const catalogue = catalogueOf(sources);

    // Assert
    expect(catalogue).toStrictEqual({
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
        catalogueBlockOf({
          id: 'a',
          isAbstract: true,
        }),
        catalogueBlockOf({
          extends: 'a',
          id: 'b',
          isAbstract: true,
        }),
        catalogueBlockOf({
          extends: 'b',
          id: 'c',
        }),
        catalogueBlockOf({
          extends: 'ghost',
          id: 'd',
          isAbstract: true,
        }),
        catalogueBlockOf({
          extends: 'd',
          id: 'e',
        }),
        catalogueBlockOf({
          extends: 'y',
          id: 'x',
          isAbstract: true,
        }),
        catalogueBlockOf({
          extends: 'x',
          id: 'y',
          isAbstract: true,
        }),
      ],
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
    expected: ReturnType<typeof catalogueOf>;
    sources: readonly CatalogueSource[];
  }>([
    {
      condition: 'a pack is not installed',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          catalogueBlockOf({
            id: 'kit',
            layer: Layer.Implementation,
            source: 'more',
          }),
        ],
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
          source: BlockSource.create(PackPath.create('tools/rules')),
          where: '/project/tools/rules',
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
          catalogueBlockOf({
            id: 'ui',
            summary: '',
          }),
        ],
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
          catalogueBlockOf({
            chapters: [
              'foundation/screens.md',
            ],
            id: 'ui',
            source: 'rules',
          }),
        ],
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
          catalogueBlockOf({
            id: 'ui',
          }),
        ],
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
          catalogueBlockOf({
            id: 'ui',
            summary: '',
          }),
        ],
        rules: [
          catalogueRuleOf({
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
          catalogueBlockOf({
            id: 'ui',
          }),
        ],
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
          catalogueBlockOf({
            id: 'ui',
          }),
          catalogueBlockOf({
            id: 'kit',
            layer: Layer.Implementation,
            source: 'rules',
          }),
        ],
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
      condition: 'a rule is stated twice',
      expected: {
        ancestors: ancestorsOf({}),
        answers: [],
        blocks: [
          catalogueBlockOf({
            chapters: [
              'foundation/screens.md',
            ],
            id: 'ui',
          }),
        ],
        rules: [
          catalogueRuleOf({
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
          catalogueBlockOf({
            id: 'api',
          }),
          catalogueBlockOf({
            id: 'ui',
            requires: [
              'api',
              'ghost',
            ],
          }),
        ],
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
          catalogueBlockOf({
            extends: 'ghost',
            id: 'kit',
            layer: Layer.Implementation,
            source: 'rules',
          }),
        ],
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
          catalogueBlockOf({
            id: 'api',
          }),
          catalogueBlockOf({
            extends: 'api',
            id: 'ui',
          }),
        ],
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
          catalogueBlockOf({
            id: 'kit',
            layer: Layer.Implementation,
          }),
          catalogueBlockOf({
            id: 'lint',
            layer: Layer.Implementation,
            source: 'rules',
          }),
        ],
        rules: [
          catalogueRuleOf({
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
    // Arrange
    const given = sources;

    // Act
    const catalogue = catalogueOf(given);

    // Assert
    expect(catalogue).toStrictEqual(expected);
  });
});
