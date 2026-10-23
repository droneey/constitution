import { describe, expect, it } from 'bun:test';

import { Axis, Layer } from '#/kernel/constants';

import type { BlockFixture } from '../../../../../__tests__/project.fixtures';
import { Folder, parsers, ruleOf } from '../../../../../__tests__/project.fixtures';
import { WarningCode } from '../../../../entities';
import { resolveProject } from '../resolve-project.utils';
import { configOf, parsedOf, requirementsOf, sourceOf, TODAY, unitOf } from './resolution.fixtures';

const UI: BlockFixture = {
  body: [
    ruleOf({
      level: 'MUST',
      slug: 'inputs-are-labelled',
    }),
    ruleOf({
      level: 'SHOULD',
      slug: 'focus-is-shown',
    }),
    ruleOf({
      level: 'MUST',
      slug: 'themes-are-tokens',
    }),
  ].join('\n'),
  files: {
    'workflow/release.md': ruleOf({
      level: 'MUST',
      slug: 'screens-are-reviewed',
    }),
    'foundation/with/redux.md': ruleOf({
      level: 'MUST',
      slug: 'state-is-not-in-screens',
    }),
  },
  governs: [
    '**/*.tsx',
  ],
  id: 'ui',
};
const BASE: BlockFixture = {
  abstract: true,
  id: 'base',
};
const STORE: BlockFixture = {
  abstract: true,
  extends: 'base',
  id: 'store',
};
const REDUX: BlockFixture = {
  extends: 'store',
  folder: Folder.Implementation,
  id: 'redux',
};
const ZUSTAND: BlockFixture = {
  extends: 'store',
  folder: Folder.Implementation,
  id: 'zustand',
};
const MOBX: BlockFixture = {
  extends: 'store',
  folder: Folder.Implementation,
  id: 'mobx',
};
const WEB: BlockFixture = {
  folder: Folder.Platform,
  id: 'web',
};
const TYPESCRIPT: BlockFixture = {
  folder: Folder.Language,
  id: 'typescript',
};
const REACT: BlockFixture = {
  body: requirementsOf({
    'focus-is-shown': 'no',
    'inputs-are-labelled': 'no',
    'no-such-rule': 'no',
    'screens-are-reviewed': 'no',
    'state-is-not-in-screens': 'no',
    'themes-are-tokens': 'yes',
  }),
  folder: Folder.Implementation,
  id: 'react',
};
const VITE: BlockFixture = {
  body: requirementsOf({
    'inputs-are-labelled': 'no',
  }),
  folder: Folder.Implementation,
  id: 'vite',
  requires: [
    'ui',
  ],
};
const CATALOGUE = sourceOf({
  blocks: [
    UI,
    BASE,
    STORE,
    REDUX,
    ZUSTAND,
    MOBX,
    WEB,
    TYPESCRIPT,
    REACT,
    VITE,
  ],
});

describe('resolveProject', () => {
  it.each([
    {
      condition: 'no key it knows is written',
      text: 'colour: blue\n',
      warnings: [
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no axes key — add axes: [architecture, workflow]',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no domains key — add domains: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no platforms key — add platforms: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no languages key — add languages: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no implementations key — add implementations: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no packages key — add packages: {}',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no packs key — add packs: []',
        },
        {
          code: WarningCode.Config,
          message:
            'constitution.yaml has no check key — add check: <the command that runs every check, or null>',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has no overrides key — add overrides: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml has the unknown key colour — remove it',
        },
      ],
    },
    {
      condition: 'every key is left empty',
      text: 'axes:\ndomains:\nplatforms:\nlanguages:\nimplementations:\npackages:\npacks:\ncheck:\noverrides:\n',
      warnings: [
        {
          code: WarningCode.Config,
          message:
            'constitution.yaml leaves axes empty — write axes: [architecture, workflow], or axes: [] for neither',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml leaves domains empty — write domains: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml leaves platforms empty — write platforms: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml leaves languages empty — write languages: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml leaves implementations empty — write implementations: []',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml leaves packages empty — write packages: {}',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml leaves packs empty — write packs: []',
        },
        {
          code: WarningCode.Config,
          message:
            'constitution.yaml leaves check empty — name the command that runs every check, or write check: null',
        },
        {
          code: WarningCode.Config,
          message: 'constitution.yaml leaves overrides empty — write overrides: []',
        },
      ],
    },
    {
      condition: 'a package leaves a list empty',
      text: 'axes: []\ndomains: []\nplatforms: []\nlanguages: []\nimplementations: []\npackages:\n  apps/web:\n    domains:\npacks: []\ncheck: null\noverrides: []\n',
      warnings: [
        {
          code: WarningCode.Config,
          message: 'apps/web leaves domains empty — write domains: []',
        },
      ],
    },
    {
      condition: 'axes names foundation or a word that is no axis',
      text: 'axes: [foundation, colour, workflow]\ndomains: []\nplatforms: []\nlanguages: []\nimplementations: []\npackages:\n  apps/web:\n    axes: [foundation]\npacks: []\ncheck: null\noverrides: []\n',
      warnings: [
        {
          code: WarningCode.Config,
          message:
            'constitution.yaml lists foundation in axes — foundation is always followed, remove it',
        },
        {
          code: WarningCode.Config,
          message: 'axes names colour — write architecture or workflow',
        },
        {
          code: WarningCode.Config,
          message: 'apps/web lists foundation in axes — foundation is always followed, remove it',
        },
      ],
    },
  ])('should warn of the keys of constitution.yaml when $condition', ({ text, warnings }) => {
    // Arrange
    const config = parsedOf(text);

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        CATALOGUE,
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.warnings).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'a block is named by a path',
      keys: {
        domains: 'domains: [rules/ui]',
      },
      warnings: [
        {
          code: WarningCode.Unknown,
          message:
            'rules/ui is a path — put the block in a pack listed under packs: and name it by its id',
        },
      ],
    },
    {
      condition: 'a name is no block',
      keys: {
        domains: 'domains: [forms]',
      },
      warnings: [
        {
          code: WarningCode.Unknown,
          message: 'forms is not a block — check the name',
        },
      ],
    },
    {
      condition: 'core is listed',
      keys: {
        platforms: 'platforms: [core]',
      },
      warnings: [
        {
          code: WarningCode.WrongKey,
          message: 'core is always active — remove it from platforms',
        },
      ],
    },
    {
      condition: 'abstract blocks are listed',
      keys: {
        domains: 'domains: [store, base]',
      },
      warnings: [
        {
          code: WarningCode.Abstract,
          message: 'store cannot be listed — list mobx, redux or zustand',
        },
        {
          code: WarningCode.Abstract,
          message: 'base cannot be listed — list store',
        },
      ],
    },
    {
      condition: 'blocks are listed under the key of another layer',
      keys: {
        domains: 'domains: [web]',
        implementations: 'implementations: [typescript]',
        languages: 'languages: [ui]',
        platforms: 'platforms: [redux]',
      },
      warnings: [
        {
          code: WarningCode.WrongKey,
          message: 'web is a platform — move it from domains to platforms',
        },
        {
          code: WarningCode.WrongKey,
          message: 'redux is an implementation — move it from platforms to implementations',
        },
        {
          code: WarningCode.WrongKey,
          message: 'ui is a domain — move it from languages to domains',
        },
        {
          code: WarningCode.WrongKey,
          message: 'typescript is a language — move it from implementations to languages',
        },
      ],
    },
    {
      condition: 'packs name folders, not blocks',
      keys: {
        packs: 'packs: [rules]',
      },
      warnings: [],
    },
  ])('should warn of a name it cannot activate when $condition', ({ keys, warnings }) => {
    // Arrange
    const config = configOf(keys);

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        CATALOGUE,
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.warnings).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'the abstract block it needs has no heir',
      keys: {
        implementations: 'implementations: [vite]',
      },
      sources: [
        sourceOf({
          blocks: [
            {
              abstract: true,
              id: 'ui',
            },
            VITE,
          ],
        }),
      ],
      warnings: [
        {
          code: WarningCode.Missing,
          message: 'vite needs ui — add one of its heirs to domains',
        },
      ],
    },
    {
      condition: 'the repository and a package each list a block whose need is not listed',
      keys: {
        implementations: 'implementations: [vite]',
        packages:
          'packages:\n  apps/web:\n    implementations: [vite, nest]\n  apps/api:\n    platforms: [web]',
      },
      sources: [
        sourceOf({
          blocks: [
            UI,
            STORE,
            BASE,
            WEB,
            VITE,
            {
              folder: Folder.Implementation,
              id: 'nest',
              requires: [
                'store',
                'web',
                'core',
                'typescript',
              ],
            },
          ],
        }),
      ],
      warnings: [
        {
          code: WarningCode.Missing,
          message: 'vite needs ui — add ui to domains',
        },
        {
          code: WarningCode.Missing,
          message: 'nest in apps/web needs store — add one of its heirs to domains',
        },
        {
          code: WarningCode.Missing,
          message: 'nest in apps/web needs web — add web to platforms',
        },
        {
          code: WarningCode.Constitution,
          message: 'nest requires typescript, which is not a block — fix its front matter',
        },
      ],
    },
  ])('should warn of a need not listed when $condition', ({ keys, sources, warnings }) => {
    // Arrange
    const config = configOf(keys);

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources,
      today: TODAY,
    });

    // Assert
    expect(resolution.warnings).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'the repository lists the library',
      keys: {
        axes: 'axes: [architecture]',
        domains: 'domains: [ui]',
        implementations: 'implementations: [react]',
        packages: 'packages:\n  apps/web:\n    axes: [workflow]',
      },
      warnings: [
        {
          code: WarningCode.NotMet,
          message: 'react does not meet inputs-are-labelled — see its Requirements table',
        },
        {
          code: WarningCode.NotMet,
          message:
            'react in apps/web does not meet screens-are-reviewed — see its Requirements table',
        },
      ],
    },
    {
      condition: 'a package lists the library',
      keys: {
        domains: 'domains: [ui]',
        packages: 'packages:\n  apps/web:\n    implementations: [vite]',
      },
      warnings: [
        {
          code: WarningCode.NotMet,
          message:
            'vite in apps/web does not meet inputs-are-labelled — see its Requirements table',
        },
      ],
    },
    {
      condition: 'two packages list the library',
      keys: {
        domains: 'domains: [ui]',
        packages:
          'packages:\n  apps/web:\n    implementations: [vite]\n  apps/api:\n    implementations: [vite]',
      },
      warnings: [
        {
          code: WarningCode.NotMet,
          message:
            'vite in apps/web does not meet inputs-are-labelled — see its Requirements table',
        },
        {
          code: WarningCode.NotMet,
          message:
            'vite in apps/api does not meet inputs-are-labelled — see its Requirements table',
        },
      ],
    },
    {
      condition: 'the repository lowers the rule a package lists the library for',
      keys: {
        domains: 'domains: [ui]',
        overrides:
          'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.',
        packages: 'packages:\n  apps/web:\n    implementations: [vite]',
      },
      warnings: [],
    },
    {
      condition: 'a package lowers the rule it lists the library for',
      keys: {
        domains: 'domains: [ui]',
        packages:
          'packages:\n  apps/web:\n    implementations: [vite]\n    overrides:\n      - rule: inputs-are-labelled\n        level: MAY\n        reason: A reason.',
      },
      warnings: [],
    },
  ])('should warn of a MUST a library does not meet when $condition', ({ keys, warnings }) => {
    // Arrange
    const config = configOf(keys);

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        CATALOGUE,
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.warnings).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'overrides leave out fields',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n  - level: SHOULD\n  - reason: A reason.\n    until: 2026-07-01',
      warnings: [
        {
          code: WarningCode.Config,
          message: 'the override on line 10 has no level, reason — complete it or remove it',
        },
        {
          code: WarningCode.Config,
          message: 'the override on line 11 has no rule, reason — complete it or remove it',
        },
        {
          code: WarningCode.Config,
          message: 'the override on line 12 has no rule, level — complete it or remove it',
        },
      ],
    },
    {
      condition: 'an override sets MUST',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: MUST\n    reason: A reason.',
      warnings: [
        {
          code: WarningCode.Config,
          message: 'the override of inputs-are-labelled sets the level MUST — write SHOULD or MAY',
        },
      ],
    },
    {
      condition: 'until is no date',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: soon\n  - rule: focus-is-shown\n    level: SHOULD\n    reason: A reason.\n    until: x2026-07-01\n  - rule: themes-are-tokens\n    level: SHOULD\n    reason: A reason.\n    until: 2026-07-01x',
      warnings: [
        {
          code: WarningCode.Config,
          message:
            'the override of inputs-are-labelled has until soon — write a date as YYYY-MM-DD',
        },
        {
          code: WarningCode.Config,
          message:
            'the override of focus-is-shown has until x2026-07-01 — write a date as YYYY-MM-DD',
        },
        {
          code: WarningCode.Config,
          message:
            'the override of themes-are-tokens has until 2026-07-01x — write a date as YYYY-MM-DD',
        },
      ],
    },
    {
      condition: 'an override names no rule or has expired',
      overrides:
        'overrides:\n  - rule: no-such-rule\n    level: MAY\n    reason: A reason.\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: 2026-06-14\n  - rule: focus-is-shown\n    level: MAY\n    reason: A reason.\n    until: 2026-06-15',
      warnings: [
        {
          code: WarningCode.Override,
          message: 'no-such-rule names no rule — check the slug',
        },
        {
          code: WarningCode.Override,
          message: 'inputs-are-labelled expired on 2026-06-14 — renew or remove it',
        },
      ],
    },
  ])('should warn of an override that cannot hold when $condition', ({ overrides, warnings }) => {
    // Arrange
    const config = configOf({
      overrides,
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        CATALOGUE,
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.warnings).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'neither the repository nor its package writes axes',
      text: 'packages:\n  apps/web:\n    domains: []\n',
      units: [
        unitOf(),
        unitOf({
          path: 'apps/web',
          scope: 1,
        }),
      ],
    },
    {
      condition: 'the repository picks workflow and its package leaves axes out',
      text: 'axes: [workflow, foundation]\npackages:\n  apps/web:\n    domains: []\n',
      units: [
        unitOf({
          axes: [
            Axis.Foundation,
            Axis.Workflow,
          ],
        }),
        unitOf({
          axes: [
            Axis.Foundation,
            Axis.Workflow,
          ],
          path: 'apps/web',
          scope: 1,
        }),
      ],
    },
    {
      condition: 'the repository picks architecture and its package leaves axes empty',
      text: 'axes: [architecture]\npackages:\n  apps/web:\n    axes:\n',
      units: [
        unitOf({
          axes: [
            Axis.Foundation,
            Axis.Architecture,
          ],
        }),
        unitOf({
          axes: [
            Axis.Foundation,
            Axis.Architecture,
          ],
          path: 'apps/web',
          scope: 1,
        }),
      ],
    },
    {
      condition: 'the repository picks neither axis and its package picks both',
      text: 'axes: []\npackages:\n  apps/web:\n    axes: [workflow, architecture, colour]\n',
      units: [
        unitOf({
          axes: [
            Axis.Foundation,
          ],
        }),
        unitOf({
          path: 'apps/web',
          scope: 1,
        }),
      ],
    },
  ])(
    'should give each scope foundation and the axes it picks when $condition',
    ({ text, units }) => {
      // Arrange
      const config = parsedOf(text);

      // Act
      const resolution = resolveProject({
        config,
        parser: parsers().frontMatterParser,
        sources: [
          sourceOf(),
        ],
        today: TODAY,
      });

      // Assert
      expect(resolution.units).toStrictEqual(units);
    },
  );

  it('should add to the repository the blocks each package lists, with their bases, when packages list blocks', () => {
    // Arrange
    const config = configOf({
      check: 'check: bun run check',
      domains: 'domains: [ui]',
      packages:
        'packages:\n  apps/web:\n    implementations: [redux]\n  apps/api:\n    platforms: [web]\n    implementations: [redis]',
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        sourceOf({
          blocks: [
            {
              governs: [
                '**/*.tsx',
              ],
              id: 'ui',
            },
            BASE,
            STORE,
            {
              ...REDUX,
              governs: [
                '**/*.store.ts',
              ],
            },
            ZUSTAND,
            WEB,
            {
              abstract: true,
              extends: 'gone',
              id: 'cache',
            },
            {
              extends: 'cache',
              folder: Folder.Implementation,
              governs: [
                '**/*.cache.ts',
              ],
              id: 'redis',
            },
          ],
        }),
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution).toStrictEqual({
      active: [
        {
          app: '',
          files: [
            'blocks/domains/ui/ui.md',
          ],
          globs: [
            '**/*.tsx',
          ],
          id: 'ui',
          scope: 0,
        },
        {
          app: 'apps/web',
          files: [
            'blocks/domains/base/base.md',
          ],
          globs: [
            '**/*.store.ts',
          ],
          id: 'base',
          scope: 1,
        },
        {
          app: 'apps/web',
          files: [
            'blocks/domains/store/store.md',
          ],
          globs: [
            '**/*.store.ts',
          ],
          id: 'store',
          scope: 1,
        },
        {
          app: 'apps/web',
          files: [
            'blocks/domains/ui/ui.md',
          ],
          globs: [
            '**/*.tsx',
          ],
          id: 'ui',
          scope: 1,
        },
        {
          app: 'apps/web',
          files: [
            'blocks/implementations/redux/redux.md',
          ],
          globs: [
            '**/*.store.ts',
          ],
          id: 'redux',
          scope: 1,
        },
        {
          app: 'apps/api',
          files: [
            'blocks/domains/cache/cache.md',
          ],
          globs: [
            '**/*.cache.ts',
          ],
          id: 'cache',
          scope: 2,
        },
        {
          app: 'apps/api',
          files: [
            'blocks/domains/ui/ui.md',
          ],
          globs: [
            '**/*.tsx',
          ],
          id: 'ui',
          scope: 2,
        },
        {
          app: 'apps/api',
          files: [
            'blocks/contexts/platforms/web/web.md',
          ],
          globs: [],
          id: 'web',
          scope: 2,
        },
        {
          app: 'apps/api',
          files: [
            'blocks/implementations/redis/redis.md',
          ],
          globs: [
            '**/*.cache.ts',
          ],
          id: 'redis',
          scope: 2,
        },
      ],
      blocks: [
        {
          id: 'core',
          layer: Layer.Core,
        },
        {
          id: 'base',
          layer: Layer.Domain,
        },
        {
          id: 'cache',
          layer: Layer.Domain,
        },
        {
          id: 'store',
          layer: Layer.Domain,
        },
        {
          id: 'ui',
          layer: Layer.Domain,
        },
        {
          id: 'web',
          layer: Layer.Platform,
        },
        {
          id: 'redis',
          layer: Layer.Implementation,
        },
        {
          id: 'redux',
          layer: Layer.Implementation,
        },
        {
          id: 'zustand',
          layer: Layer.Implementation,
        },
      ],
      check: 'bun run check',
      count: 8,
      index: [
        '## Domains (blocks/domains/<id>/<id>.md)',
        "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.",
        '- ui: The ui block.',
        '## apps/web',
        '- base [domains]: The base block.',
        '- store [domains]: The store block.',
        '- redux [implementations]',
        '## apps/api',
        '- cache [domains]: The cache block.',
        '- web [contexts/platforms]: The web block.',
        '- redis [implementations]',
      ],
      musts: [],
      units: [
        unitOf({
          blocks: new Set([
            'core',
            'ui',
          ]),
        }),
        unitOf({
          blocks: new Set([
            'core',
            'ui',
            'redux',
            'store',
            'base',
          ]),
          path: 'apps/web',
          scope: 1,
        }),
        unitOf({
          blocks: new Set([
            'core',
            'ui',
            'web',
            'redis',
            'cache',
            'gone',
          ]),
          path: 'apps/api',
          scope: 2,
        }),
      ],
      warnings: [
        {
          code: WarningCode.Constitution,
          message: 'cache extends gone, which is not a block — fix its front matter',
        },
      ],
    });
  });

  it('should lower each rule an override names and every rule that takes its level from it when overrides hold', () => {
    // Arrange
    const config = configOf({
      domains: 'domains: [forms]',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n  - rule: loops-back\n    level: MAY\n    reason: A reason.',
      packages:
        'packages:\n  apps/web:\n    overrides:\n      - rule: inputs-are-labelled\n        level: MAY\n        reason: A reason.\n        until: 2026-06-15\n  apps/api:\n    domains: []',
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        sourceOf({
          blocks: [
            {
              body: [
                ruleOf({
                  level: 'MUST',
                  slug: 'inputs-are-labelled',
                }),
                ruleOf({
                  parent: 'inputs-are-labelled',
                  slug: 'labels-are-visible',
                }),
                ruleOf({
                  parent: 'labels-are-visible',
                  slug: 'labels-are-above',
                }),
                ruleOf({
                  level: 'MUST',
                  parent: 'inputs-are-labelled',
                  slug: 'labels-are-translated',
                }),
                ruleOf({
                  parent: 'loops-ahead',
                  slug: 'loops-back',
                }),
                ruleOf({
                  parent: 'loops-back',
                  slug: 'loops-ahead',
                }),
              ].join('\n'),
              id: 'forms',
            },
          ],
          core: {
            body: ruleOf({
              level: 'MUST',
              slug: 'names-say-what',
            }),
          },
        }),
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution).toStrictEqual({
      active: [
        {
          app: '',
          files: [
            'blocks/domains/forms/forms.md',
          ],
          globs: [],
          id: 'forms',
          scope: 0,
        },
        {
          app: 'apps/web',
          files: [
            'blocks/domains/forms/forms.md',
          ],
          globs: [],
          id: 'forms',
          scope: 1,
        },
        {
          app: 'apps/api',
          files: [
            'blocks/domains/forms/forms.md',
          ],
          globs: [],
          id: 'forms',
          scope: 2,
        },
      ],
      blocks: [
        {
          id: 'core',
          layer: Layer.Core,
        },
        {
          id: 'forms',
          layer: Layer.Domain,
        },
      ],
      check: '',
      count: 2,
      index: [
        '## Domains (blocks/domains/<id>/<id>.md)',
        "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.",
        '- forms: The forms block.',
        '## Overrides',
        '- inputs-are-labelled: MAY in apps/web until 2026-06-15',
        '- inputs-are-labelled: SHOULD',
        '- loops-back: MAY',
      ],
      musts: [
        {
          block: 'forms',
          rule: 'inputs-are-labelled (MAY in apps/web; SHOULD)',
        },
        {
          block: 'forms',
          rule: 'labels-are-visible (MAY in apps/web via inputs-are-labelled; SHOULD via inputs-are-labelled)',
        },
        {
          block: 'forms',
          rule: 'labels-are-above (MAY in apps/web via inputs-are-labelled; SHOULD via inputs-are-labelled)',
        },
        {
          block: 'forms',
          rule: 'labels-are-translated',
        },
        {
          block: 'forms',
          rule: 'loops-back (MAY; MAY via loops-back)',
        },
        {
          block: 'forms',
          rule: 'loops-ahead (MAY via loops-back)',
        },
      ],
      units: [
        unitOf({
          blocks: new Set([
            'core',
            'forms',
          ]),
          lowered: new Set([
            'inputs-are-labelled',
            'labels-are-visible',
            'labels-are-above',
            'loops-back',
            'loops-ahead',
          ]),
        }),
        unitOf({
          blocks: new Set([
            'core',
            'forms',
          ]),
          lowered: new Set([
            'inputs-are-labelled',
            'labels-are-visible',
            'labels-are-above',
          ]),
          path: 'apps/web',
          scope: 1,
        }),
        unitOf({
          blocks: new Set([
            'core',
            'forms',
          ]),
          path: 'apps/api',
          scope: 2,
        }),
      ],
      warnings: [],
    });
  });

  it('should list the MUST rules active in any scope when blocks, axes and seams differ by scope', () => {
    // Arrange
    const config = configOf({
      axes: 'axes: [architecture]',
      domains: 'domains: [ui]',
      packages: 'packages:\n  apps/web:\n    axes: [workflow]',
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        sourceOf({
          blocks: [
            UI,
            REDUX,
            {
              body: ruleOf({
                level: 'MUST',
                slug: 'builds-are-cached',
              }),
              folder: Folder.Implementation,
              id: 'vite',
            },
          ],
          core: {
            body: ruleOf({
              level: 'MUST',
              slug: 'names-say-what',
            }),
          },
        }),
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.musts).toStrictEqual([
      {
        block: 'ui',
        rule: 'inputs-are-labelled',
      },
      {
        block: 'ui',
        rule: 'themes-are-tokens',
      },
      {
        block: 'ui',
        rule: 'screens-are-reviewed',
      },
    ]);
  });

  it('should list the repository blocks by layer, what each package adds, then the overrides when the project spans packages and a pack', () => {
    // Arrange
    const config = configOf({
      axes: 'axes: [architecture]',
      domains: 'domains: [ui]',
      implementations: 'implementations: [react, lint]',
      languages: 'languages: [typescript]',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: 2026-07-01',
      packages:
        'packages:\n  apps/web:\n    axes: [architecture, workflow]\n    platforms: [web]\n    implementations: [redux]\n    overrides:\n      - rule: themes-are-tokens\n        level: MAY\n        reason: A reason.\n  apps/api:\n    domains: []',
      packs: 'packs: [./rules]',
      platforms: 'platforms: [browser]',
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        sourceOf({
          blocks: [
            {
              ...UI,
              files: {
                'architecture/layers.md': '# Layers\n',
                'architecture/with/redux.md': '# Redux\n',
                'foundation/writing.md-files.md': '# Writing .md files\n',
                'foundation/with/react.md': '# React\n',
                'workflow/release.md': '# Release\n',
                'workflow/with/react.md': '# React\n',
              },
            },
            TYPESCRIPT,
            {
              folder: Folder.Platform,
              id: 'browser',
            },
            {
              files: {
                'workflow/deploy.md': '# Deploy\n',
              },
              folder: Folder.Platform,
              id: 'web',
            },
            REACT,
            REDUX,
          ],
          core: {
            files: {
              'workflow/delivery.md': '# Delivery\n',
            },
          },
        }),
        sourceOf({
          blocks: [
            {
              folder: Folder.Implementation,
              id: 'lint',
            },
          ],
          source: './rules',
        }),
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.index).toStrictEqual([
      '## Domains (blocks/domains/<id>/<id>.md)',
      "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.",
      '- ui: The ui block. (writing.md-files, with/react; architecture: layers)',
      '## Platforms (blocks/contexts/platforms/<id>/<id>.md)',
      '- browser: The browser block.',
      '## Languages (blocks/contexts/languages/<id>/<id>.md)',
      '- typescript: The typescript block.',
      '## Implementations (blocks/implementations/<id>/<id>.md)',
      '- react',
      '- lint [./rules]',
      '## apps/web',
      '- ui [domains]: Also: architecture: with/redux; workflow: release, with/react',
      '- web [contexts/platforms]: The web block. (workflow: deploy)',
      '- redux [implementations]',
      '## Overrides',
      '- themes-are-tokens: MAY in apps/web',
      '- inputs-are-labelled: SHOULD until 2026-07-01',
    ]);
  });

  it('should give each active block its files and the globs of every block that needs it when blocks need others', () => {
    // Arrange
    const config = configOf({
      axes: 'axes: [architecture]',
      domains: 'domains: [ui]',
      implementations: 'implementations: [react, lint]',
      languages: 'languages: [typescript]',
      packages: 'packages:\n  apps/web:\n    axes: [architecture, workflow]',
      packs: 'packs: [./rules]',
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        sourceOf({
          blocks: [
            {
              files: {
                'architecture/layers.md': '# Layers\n',
                'foundation/with/react.md': '# React\n',
                'workflow/release.md': '# Release\n',
                'workflow/with/lint.md': '# Lint\n',
                'workflow/with/redux.md': '# Redux\n',
              },
              governs: [
                '**/*.tsx',
                '**/*.css',
                '**/*.tsx',
              ],
              id: 'ui',
              requires: [
                'core',
              ],
            },
            {
              folder: Folder.Language,
              governs: [
                '**/*.ts',
              ],
              id: 'typescript',
              requires: [
                'react',
              ],
            },
            {
              folder: Folder.Implementation,
              governs: [
                '**/*.jsx',
                '**/*.tsx',
              ],
              id: 'react',
              requires: [
                'typescript',
                'core',
              ],
            },
            REDUX,
          ],
          core: {
            files: {
              'foundation/with/lint.md': '# Lint\n',
            },
            governs: [
              '**/*.md',
            ],
          },
        }),
        sourceOf({
          blocks: [
            {
              files: {
                'architecture/rules.md': '# Rules\n',
              },
              folder: Folder.Implementation,
              governs: [
                '**/*',
              ],
              id: 'lint',
            },
          ],
          source: './rules',
        }),
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.active).toStrictEqual([
      {
        app: '',
        files: [
          'blocks/domains/ui/ui.md',
          'blocks/domains/ui/architecture/layers.md',
          'blocks/domains/ui/foundation/with/react.md',
        ],
        globs: [
          '**/*.tsx',
          '**/*.css',
        ],
        id: 'ui',
        scope: 0,
      },
      {
        app: '',
        files: [
          'blocks/contexts/languages/typescript/typescript.md',
        ],
        globs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'typescript',
        scope: 0,
      },
      {
        app: '',
        files: [
          'blocks/implementations/react/react.md',
        ],
        globs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'react',
        scope: 0,
      },
      {
        app: '',
        files: [
          './rules/blocks/implementations/lint/lint.md',
          './rules/blocks/implementations/lint/architecture/rules.md',
        ],
        globs: [
          '**/*',
        ],
        id: 'lint',
        scope: 0,
      },
      {
        app: 'apps/web',
        files: [
          'blocks/domains/ui/ui.md',
          'blocks/domains/ui/architecture/layers.md',
          'blocks/domains/ui/workflow/release.md',
          'blocks/domains/ui/foundation/with/react.md',
          'blocks/domains/ui/workflow/with/lint.md',
        ],
        globs: [
          '**/*.tsx',
          '**/*.css',
        ],
        id: 'ui',
        scope: 1,
      },
      {
        app: 'apps/web',
        files: [
          'blocks/contexts/languages/typescript/typescript.md',
        ],
        globs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'typescript',
        scope: 1,
      },
      {
        app: 'apps/web',
        files: [
          'blocks/implementations/react/react.md',
        ],
        globs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'react',
        scope: 1,
      },
      {
        app: 'apps/web',
        files: [
          './rules/blocks/implementations/lint/lint.md',
          './rules/blocks/implementations/lint/architecture/rules.md',
        ],
        globs: [
          '**/*.tsx',
          '**/*.css',
          '**/*',
        ],
        id: 'lint',
        scope: 1,
      },
    ]);
  });

  it('should hold no core in any scope when the release has none', () => {
    // Arrange
    const config = configOf({
      packages: 'packages:\n  apps/web:\n    domains: []',
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        {
          files: [],
          source: '',
          where: '/work/project/.droneey/constitution',
        },
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution).toStrictEqual({
      active: [],
      blocks: [],
      check: '',
      count: 0,
      index: [],
      musts: [],
      units: [
        unitOf({
          blocks: new Set(),
        }),
        unitOf({
          blocks: new Set(),
          path: 'apps/web',
          scope: 1,
        }),
      ],
      warnings: [],
    });
  });

  it.each([
    {
      check: 'check: bun run check',
      condition: 'it names a command',
      expected: 'bun run check',
    },
    {
      check: 'check: null',
      condition: 'it is null',
      expected: '',
    },
    {
      check: 'check: ~',
      condition: 'it is YAML’s other null',
      expected: '',
    },
    {
      check: 'check:',
      condition: 'it is left empty',
      expected: '',
    },
  ])('should give the check constitution.yaml names when $condition', ({ check, expected }) => {
    // Arrange
    const config = configOf({
      check,
    });

    // Act
    const resolution = resolveProject({
      config,
      parser: parsers().frontMatterParser,
      sources: [
        sourceOf(),
      ],
      today: TODAY,
    });

    // Assert
    expect(resolution.check).toBe(expected);
  });
});
