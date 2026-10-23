import { describe, expect, it } from 'bun:test';

import { Axis, Layer, Level } from '#/kernel/constants';

import { passportOf, ruleOf } from '../../../../../__tests__/project.fixtures';
import { WarningCode } from '../../../../entities';
import type { CatalogueSource } from '../catalogue.utils';
import {
  catalogueBlockOf,
  catalogueOf,
  catalogueRuleOf,
  packOf,
  sourceOf,
} from './catalogue.fixtures';

const PLAIN = '# A file\n';

describe('readCatalogue', () => {
  it('should read every block, chapter, seam, rule and answer in catalogue order when the release and a pack are whole', () => {
    // Arrange
    const sources = [
      sourceOf({
        files: {
          'blocks/domains/ui/architecture/with/api.md': ruleOf({
            parent: 'core-rule',
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
              parent: 'ui-review',
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
      ancestors: new Map([
        [
          'api',
          [],
        ],
        [
          'kit',
          [
            'api',
          ],
        ],
      ]),
      answers: [
        {
          block: 'ui',
          met: 'yes',
          requirement: 'formatter',
        },
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
          parent: 'core-rule',
          slug: 'ui-calls-api',
          with: 'api',
        }),
        catalogueRuleOf({
          block: 'kit',
          isLevelStated: false,
          level: Level.May,
          parent: 'ui-review',
          slug: 'kit-rule',
        }),
      ],
      warnings: [],
    });
  });

  it('should list the bases of a block nearest first when its bases chain, close in a cycle or end at no block', () => {
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
      ancestors: new Map([
        [
          'a',
          [],
        ],
        [
          'b',
          [
            'a',
          ],
        ],
        [
          'c',
          [
            'b',
            'a',
          ],
        ],
        [
          'ghost',
          [],
        ],
        [
          'd',
          [
            'ghost',
          ],
        ],
        [
          'e',
          [
            'd',
            'ghost',
          ],
        ],
        [
          'y',
          [
            'x',
          ],
        ],
        [
          'x',
          [
            'y',
            'x',
          ],
        ],
      ]),
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
          code: WarningCode.Constitution,
          message: 'd extends ghost, which is not a block — fix its front matter',
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
        ancestors: new Map(),
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
            code: WarningCode.Pack,
            message: 'tools/rules is not installed — run mise install, or check the path',
          },
        ],
      },
      sources: [
        sourceOf({}),
        {
          source: 'tools/rules',
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
        ancestors: new Map(),
        answers: [],
        blocks: [],
        rules: [],
        warnings: [
          {
            code: WarningCode.Constitution,
            message:
              '/release/blocks/README.md is not inside a block folder of a domain, a context or an implementation',
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
        ancestors: new Map(),
        answers: [],
        blocks: [],
        rules: [],
        warnings: [
          {
            code: WarningCode.Pack,
            message:
              '/project/rules/blocks/core/core.md is not inside a block folder of a domain, a context or an implementation',
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
        ancestors: new Map(),
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
            code: WarningCode.Constitution,
            message: '/release/blocks/domains/ui/ui.md cannot be read — its rules are left out',
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
        ancestors: new Map(),
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
            code: WarningCode.Pack,
            message:
              '/project/rules/blocks/domains/ui/foundation/screens.md cannot be read — its rules are left out',
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
      condition: 'a passport has no front matter',
      expected: {
        ancestors: new Map(),
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
            code: WarningCode.Constitution,
            message:
              '/release/blocks/domains/ui/ui.md has no front matter — the block is read without it',
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
        ancestors: new Map(),
        answers: [],
        blocks: [
          catalogueBlockOf({
            id: 'ui',
          }),
        ],
        rules: [],
        warnings: [
          'foundation/a.md/b.md',
          'foundation/with/a.md/b.md',
          'foundation/deep/with/a.md',
          'foundation/deep/x.md',
          'foundation/with/deep/x.md',
          'guides/a.md',
          'guides/with/a.md',
          'notes.md',
        ].map((name) => ({
          code: WarningCode.Constitution,
          message: `/release/blocks/domains/ui/${name} is not a block file — move or remove it`,
        })),
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
        ancestors: new Map(),
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
            code: WarningCode.Pack,
            message:
              '/project/rules/blocks/domains/ui/ui.md repeats the block ui — the one read first is used',
          },
          {
            code: WarningCode.Pack,
            message:
              '/project/more/blocks/domains/ui/ui.md repeats the block ui — the one read first is used',
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
        ancestors: new Map(),
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
            code: WarningCode.Constitution,
            message:
              '/release/blocks/domains/ui/foundation/screens.md repeats the rule one — the first is used',
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
      condition: 'a block requires an unknown block',
      expected: {
        ancestors: new Map(),
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
            code: WarningCode.Constitution,
            message: 'ui requires ghost, which is not a block — fix its front matter',
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
              ],
            }),
          },
        }),
      ],
    },
    {
      condition: 'a block of a pack extends an unknown block',
      expected: {
        ancestors: new Map(),
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
            code: WarningCode.Pack,
            message: 'kit extends ghost, which is not a block — fix its front matter',
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
        ancestors: new Map([
          [
            'api',
            [],
          ],
          [
            'ui',
            [
              'api',
            ],
          ],
        ]),
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
            code: WarningCode.Constitution,
            message:
              'ui extends api, a concrete block; a block extends only an abstract base — require it instead',
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
      condition: 'a rule tightens an unknown rule',
      expected: {
        ancestors: new Map(),
        answers: [],
        blocks: [
          catalogueBlockOf({
            id: 'kit',
            layer: Layer.Implementation,
          }),
        ],
        rules: [
          catalogueRuleOf({
            block: 'kit',
            isLevelStated: false,
            parent: 'ghost',
            slug: 'kit-rule',
          }),
        ],
        warnings: [
          {
            code: WarningCode.Constitution,
            message: 'kit-rule → ghost: ghost is an unknown rule — check the slug',
          },
        ],
      },
      sources: [
        sourceOf({
          files: {
            'blocks/implementations/kit/kit.md': passportOf({
              body: ruleOf({
                parent: 'ghost',
                slug: 'kit-rule',
              }),
              id: 'kit',
            }),
          },
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
