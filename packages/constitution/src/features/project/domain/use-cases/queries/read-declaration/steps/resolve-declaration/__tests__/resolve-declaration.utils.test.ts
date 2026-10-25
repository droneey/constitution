import { describe, expect, it } from 'bun:test';

import { warningOf } from '#/__tests__/warning.fixtures';
import { Axis, Layer, Level } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningCode } from '#/kernel/entities';
import { BlockSource, UnitPath } from '#/kernel/value-objects';

import type { BlockFixture } from '../../../../../../../__tests__/project.fixtures';
import { Folder, parsers, ruleOf } from '../../../../../../../__tests__/project.fixtures';
import type { UnreadMember } from '../../../../../../entities';
import { MemberProblem } from '../../../../../../entities';
import { resolveDeclaration } from '../resolve-declaration.utils';
import {
  activeOf,
  addedEntryOf,
  catalogueEntryOf,
  configOf,
  filesOn,
  listedOf,
  listedOverrideOf,
  listingOf,
  loweringOf,
  memberYamlOf,
  mustOf,
  ownEntryOf,
  parsedOf,
  requirementsOf,
  sourceOf,
  today,
  unitListingOf,
  unitOf,
  yamlOf,
} from './resolution.fixtures';

const ui: BlockFixture = {
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
} as const;
const STORE: BlockFixture = {
  abstract: true,
  extends: 'base',
  id: 'store',
} as const;
const REDUX: BlockFixture = {
  extends: 'store',
  folder: Folder.Implementation,
  id: 'redux',
} as const;
const ZUSTAND: BlockFixture = {
  extends: 'store',
  folder: Folder.Implementation,
  id: 'zustand',
} as const;
const MOBX: BlockFixture = {
  extends: 'store',
  folder: Folder.Implementation,
  id: 'mobx',
} as const;
const WEB: BlockFixture = {
  folder: Folder.Platform,
  id: 'web',
} as const;
const TYPESCRIPT: BlockFixture = {
  folder: Folder.Language,
  id: 'typescript',
} as const;
const react: BlockFixture = {
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
const vite: BlockFixture = {
  body: requirementsOf({
    'inputs-are-labelled': 'no',
  }),
  folder: Folder.Implementation,
  id: 'vite',
  requires: [
    'ui',
  ],
};
const catalogue = sourceOf({
  blocks: [
    ui,
    BASE,
    STORE,
    REDUX,
    ZUSTAND,
    MOBX,
    WEB,
    TYPESCRIPT,
    react,
    vite,
  ],
});

describe('resolveDeclaration', () => {
  it.each<{
    condition: string;
    members: Readonly<Record<string, string>>;
    text: string;
    unread: readonly UnreadMember[];
    warnings: readonly ProjectWarning[];
  }>([
    {
      condition: 'no key it knows is written',
      members: {},
      text: 'colour: blue\n',
      unread: [],
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'axes',
            'axes: [architecture, workflow]',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'domains',
            'domains: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'platforms',
            'platforms: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'languages',
            'languages: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'implementations',
            'implementations: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'packs',
            'packs: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'check',
            'check: <the command that runs every check, or null>',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'overrides',
            'overrides: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'colour',
          ],
        }),
      ],
    },
    {
      condition: 'every key is left empty',
      members: {},
      text: 'axes:\ndomains:\nplatforms:\nlanguages:\nimplementations:\npacks:\ncheck:\noverrides:\n',
      unread: [],
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'axes',
            'write axes: [architecture, workflow]',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'domains',
            'write domains: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'platforms',
            'write platforms: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'languages',
            'write languages: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'implementations',
            'write implementations: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'packs',
            'write packs: []',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'check',
            'write check: null',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'overrides',
            'write overrides: []',
          ],
        }),
      ],
    },
    {
      condition: 'a member leaves a list empty',
      members: {
        'apps/web': memberYamlOf({
          domains: 'domains:',
        }),
      },
      text: yamlOf(),
      unread: [],
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'domains',
          ],
        }),
      ],
    },
    {
      condition: 'a member writes only some keys and names a check',
      members: {
        'apps/web': 'domains: []\ncheck: bun run check\ncolour: blue\n',
      },
      text: yamlOf(),
      unread: [],
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'axes',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'platforms',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'languages',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'implementations',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'packs',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'overrides',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'check',
            'only the repository',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'colour',
          ],
        }),
      ],
    },
    {
      condition: "the repository still lists its packages' blocks",
      members: {},
      text: yamlOf({
        packages: 'packages:\n  apps/web:\n    domains: [ui]',
      }),
      unread: [],
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'packages',
            'of its own',
          ],
        }),
      ],
    },
    {
      condition: 'axes names foundation or a word that is no axis',
      members: {
        'apps/web': memberYamlOf({
          axes: 'axes: [foundation]',
        }),
      },
      text: yamlOf({
        axes: 'axes: [foundation, colour, workflow]',
      }),
      unread: [],
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'constitution.yaml',
            'foundation',
            'axes',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'axes',
            'colour',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web/constitution.yaml',
            'foundation',
            'axes',
          ],
        }),
      ],
    },
    {
      condition: 'members of the workspace hold no constitution.yaml it can read',
      members: {},
      text: yamlOf(),
      unread: [
        {
          path: UnitPath.create('apps/web'),
          problem: MemberProblem.Missing,
        },
        {
          line: 3,
          path: UnitPath.create('apps/api'),
          problem: MemberProblem.Unparsed,
        },
        {
          path: UnitPath.create('packages/ui'),
          problem: MemberProblem.Unreadable,
        },
      ],
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/web',
            'constitution.yaml',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'apps/api/constitution.yaml',
            '3',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'packages/ui/constitution.yaml',
          ],
        }),
      ],
    },
  ])(
    'should warn of the keys of each constitution.yaml when $condition',
    ({ members, text, unread, warnings }) => {
      // Arrange
      const config = parsedOf(text, members, unread);

      // Act
      const resolution = resolveDeclaration({
        config,
        parser: parsers().cardParser,
        sources: [
          catalogue,
        ],
        today,
      });

      // Assert
      expect(resolution.warnings).toStrictEqual(warnings);
    },
  );

  it.each([
    {
      blocks: [
        'core',
      ],
      condition: 'a block is named by a path',
      keys: {
        domains: 'domains: [rules/ui]',
      },
      warnings: [
        warningOf({
          code: WarningCode.Unknown,
          names: [
            'rules/ui',
            'packs',
          ],
        }),
      ],
    },
    {
      blocks: [
        'core',
      ],
      condition: 'a name is no block',
      keys: {
        domains: 'domains: [forms]',
      },
      warnings: [
        warningOf({
          code: WarningCode.Unknown,
          names: [
            'forms',
          ],
        }),
      ],
    },
    {
      blocks: [
        'core',
      ],
      condition: 'core is listed',
      keys: {
        platforms: 'platforms: [core]',
      },
      warnings: [
        warningOf({
          code: WarningCode.WrongKey,
          names: [
            'core',
            'always active',
            'platforms',
          ],
        }),
      ],
    },
    {
      blocks: [
        'core',
      ],
      condition: 'abstract blocks are listed',
      keys: {
        domains: 'domains: [store, base]',
      },
      warnings: [
        warningOf({
          code: WarningCode.Abstract,
          names: [
            'store',
            'mobx',
            'redux',
            'zustand',
          ],
        }),
        warningOf({
          code: WarningCode.Abstract,
          names: [
            'base',
            'store',
          ],
        }),
      ],
    },
    {
      blocks: [
        'core',
        'web',
        'redux',
        'store',
        'base',
        'ui',
        'typescript',
      ],
      condition: 'blocks are listed under the key of another layer',
      keys: {
        domains: 'domains: [web]',
        implementations: 'implementations: [typescript]',
        languages: 'languages: [ui]',
        platforms: 'platforms: [redux]',
      },
      warnings: [
        warningOf({
          code: WarningCode.WrongKey,
          names: [
            'web',
            'domains',
            'platforms',
          ],
        }),
        warningOf({
          code: WarningCode.WrongKey,
          names: [
            'redux',
            'platforms',
            'implementations',
          ],
        }),
        warningOf({
          code: WarningCode.WrongKey,
          names: [
            'ui',
            'languages',
            'domains',
          ],
        }),
        warningOf({
          code: WarningCode.WrongKey,
          names: [
            'typescript',
            'implementations',
            'languages',
          ],
        }),
      ],
    },
    {
      blocks: [
        'core',
      ],
      condition: 'packs name folders, not blocks',
      keys: {
        packs: 'packs: [rules]',
      },
      warnings: [],
    },
  ])('should warn of a name it cannot activate when $condition', ({ blocks, keys, warnings }) => {
    // Arrange
    const config = configOf(keys);

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources: [
        catalogue,
      ],
      today,
    });

    // Assert
    expect({
      blocks: [
        ...(resolution.units[0]?.blocks ?? []),
      ].map((id): string => id),
      warnings: resolution.warnings,
    }).toStrictEqual({
      blocks: [
        ...blocks,
      ],
      warnings,
    });
  });

  it.each([
    {
      condition: 'the abstract block it needs has no heir',
      keys: {
        implementations: 'implementations: [vite]',
      },
      members: {},
      sources: [
        sourceOf({
          blocks: [
            {
              abstract: true,
              id: 'ui',
            },
            vite,
          ],
        }),
      ],
      warnings: [
        warningOf({
          code: WarningCode.Missing,
          names: [
            'vite',
            'ui',
            'domains',
          ],
        }),
      ],
    },
    {
      condition: 'the repository and a member each list blocks whose needs they do not list',
      keys: {
        implementations: 'implementations: [vite]',
      },
      members: {
        'apps/api': {
          platforms: 'platforms: [web]',
        },
        'apps/web': {
          implementations: 'implementations: [vite, nest]',
        },
      },
      sources: [
        sourceOf({
          blocks: [
            ui,
            STORE,
            BASE,
            WEB,
            vite,
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
        warningOf({
          code: WarningCode.Missing,
          names: [
            'vite',
            'ui',
            'domains',
          ],
        }),
        warningOf({
          code: WarningCode.Missing,
          names: [
            'nest',
            'apps/web',
            'store',
            'domains',
          ],
        }),
        warningOf({
          code: WarningCode.Missing,
          names: [
            'nest',
            'apps/web',
            'web',
            'platforms',
          ],
        }),
        warningOf({
          code: WarningCode.Missing,
          names: [
            'vite',
            'apps/web',
            'ui',
            'domains',
          ],
        }),
        warningOf({
          code: WarningCode.Constitution,
          names: [
            'nest',
            'typescript',
          ],
        }),
      ],
    },
  ])('should warn of a need not listed when $condition', ({ keys, members, sources, warnings }) => {
    // Arrange
    const config = configOf(keys, members);

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources,
      today,
    });

    // Assert
    expect(resolution.warnings).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'the repository and a member of another axis list the library',
      keys: {
        axes: 'axes: [architecture]',
        domains: 'domains: [ui]',
        implementations: 'implementations: [react]',
      },
      members: {
        'apps/web': {
          axes: 'axes: [workflow]',
          domains: 'domains: [ui]',
          implementations: 'implementations: [react]',
        },
      },
      warnings: [
        warningOf({
          code: WarningCode.NotMet,
          names: [
            'react',
            'inputs-are-labelled',
          ],
        }),
        warningOf({
          code: WarningCode.NotMet,
          names: [
            'react',
            'apps/web',
            'inputs-are-labelled',
          ],
        }),
        warningOf({
          code: WarningCode.NotMet,
          names: [
            'react',
            'apps/web',
            'screens-are-reviewed',
          ],
        }),
      ],
    },
    {
      condition: 'two members list the library',
      keys: {},
      members: {
        'apps/api': {
          domains: 'domains: [ui]',
          implementations: 'implementations: [vite]',
        },
        'apps/web': {
          domains: 'domains: [ui]',
          implementations: 'implementations: [vite]',
        },
      },
      warnings: [
        warningOf({
          code: WarningCode.NotMet,
          names: [
            'vite',
            'apps/api',
            'inputs-are-labelled',
          ],
        }),
        warningOf({
          code: WarningCode.NotMet,
          names: [
            'vite',
            'apps/web',
            'inputs-are-labelled',
          ],
        }),
      ],
    },
    {
      condition:
        'the repository lowers the rule a member lists the library for, which reaches no member',
      keys: {
        domains: 'domains: [ui]',
        overrides:
          'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.',
      },
      members: {
        'apps/web': {
          domains: 'domains: [ui]',
          implementations: 'implementations: [vite]',
        },
      },
      warnings: [
        warningOf({
          code: WarningCode.NotMet,
          names: [
            'vite',
            'apps/web',
            'inputs-are-labelled',
          ],
        }),
      ],
    },
    {
      condition: 'a member lowers the rule it lists the library for',
      keys: {
        domains: 'domains: [ui]',
      },
      members: {
        'apps/web': {
          domains: 'domains: [ui]',
          implementations: 'implementations: [vite]',
          overrides:
            'overrides:\n  - rule: inputs-are-labelled\n    level: MAY\n    reason: A reason.',
        },
      },
      warnings: [],
    },
  ])(
    'should warn of a MUST a library does not meet when $condition',
    ({ keys, members, warnings }) => {
      // Arrange
      const config = configOf(keys, members);

      // Act
      const resolution = resolveDeclaration({
        config,
        parser: parsers().cardParser,
        sources: [
          catalogue,
        ],
        today,
      });

      // Assert
      expect(resolution.warnings).toStrictEqual(warnings);
    },
  );

  it.each([
    {
      condition: 'overrides leave out fields',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n  - level: SHOULD\n  - reason: A reason.\n    until: 2026-07-01',
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            '9',
            'level, reason',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            '10',
            'rule, reason',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            '11',
            'rule, level',
          ],
        }),
      ],
    },
    {
      condition: 'an override leaves out only its rule',
      overrides: 'overrides:\n  - level: SHOULD\n    reason: A reason.',
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            '9',
            'rule',
          ],
        }),
      ],
    },
    {
      condition: 'an override leaves out only its level',
      overrides: 'overrides:\n  - rule: inputs-are-labelled\n    reason: A reason.',
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            '9',
            'level',
          ],
        }),
      ],
    },
    {
      condition: 'an override leaves out only its reason',
      overrides: 'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD',
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            '9',
            'reason',
          ],
        }),
      ],
    },
    {
      condition: 'an override sets MUST',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: MUST\n    reason: A reason.',
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'inputs-are-labelled',
            'MUST',
          ],
        }),
      ],
    },
    {
      condition: 'until is no calendar date written YYYY-MM-DD',
      overrides:
        'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: soon\n  - rule: focus-is-shown\n    level: SHOULD\n    reason: A reason.\n    until: x2026-07-01\n  - rule: themes-are-tokens\n    level: SHOULD\n    reason: A reason.\n    until: 2026-07-01x\n  - rule: hooks-at-top-level\n    level: SHOULD\n    reason: A reason.\n    until: 2026-02-30\n  - rule: screens-are-reviewed\n    level: SHOULD\n    reason: A reason.\n    until: 2026-07-01T10:00\n  - rule: state-is-not-in-screens\n    level: SHOULD\n    reason: A reason.\n    until: +002026-07-01',
      warnings: [
        warningOf({
          code: WarningCode.Config,
          names: [
            'inputs-are-labelled',
            'soon',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'focus-is-shown',
            'x2026-07-01',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'themes-are-tokens',
            '2026-07-01x',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'hooks-at-top-level',
            '2026-02-30',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'screens-are-reviewed',
            '2026-07-01T10:00',
          ],
        }),
        warningOf({
          code: WarningCode.Config,
          names: [
            'state-is-not-in-screens',
            '+002026-07-01',
          ],
        }),
      ],
    },
    {
      condition: 'an override names no rule or has expired',
      overrides:
        'overrides:\n  - rule: no-such-rule\n    level: MAY\n    reason: A reason.\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: 2026-06-14\n  - rule: focus-is-shown\n    level: MAY\n    reason: A reason.\n    until: 2026-06-15',
      warnings: [
        warningOf({
          code: WarningCode.Override,
          names: [
            'no-such-rule',
          ],
        }),
        warningOf({
          code: WarningCode.Override,
          names: [
            'inputs-are-labelled',
            '2026-06-14',
          ],
        }),
      ],
    },
  ])('should warn of an override that cannot hold when $condition', ({ overrides, warnings }) => {
    // Arrange
    const config = configOf({
      overrides,
    });

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources: [
        catalogue,
      ],
      today,
    });

    // Assert
    expect(resolution.warnings).toStrictEqual(warnings);
  });

  it.each([
    {
      condition: 'neither the repository nor its member writes axes',
      members: {
        'apps/web': 'domains: []\n',
      },
      text: 'domains: []\n',
      units: [
        unitOf(),
        unitOf({
          path: 'apps/web',
        }),
      ],
    },
    {
      condition:
        'the repository picks workflow and its member, which takes nothing from it, leaves axes out',
      members: {
        'apps/web': 'domains: []\n',
      },
      text: 'axes: [workflow, foundation]\n',
      units: [
        unitOf({
          axes: [
            Axis.Foundation,
            Axis.Workflow,
          ],
        }),
        unitOf({
          path: 'apps/web',
        }),
      ],
    },
    {
      condition: 'the repository picks architecture and its member leaves axes empty',
      members: {
        'apps/web': 'axes:\n',
      },
      text: 'axes: [architecture]\n',
      units: [
        unitOf({
          axes: [
            Axis.Foundation,
            Axis.Architecture,
          ],
        }),
        unitOf({
          path: 'apps/web',
        }),
      ],
    },
    {
      condition: 'the repository picks neither axis and its member picks both',
      members: {
        'apps/web': 'axes: [workflow, architecture, colour]\n',
      },
      text: 'axes: []\n',
      units: [
        unitOf({
          axes: [
            Axis.Foundation,
          ],
        }),
        unitOf({
          path: 'apps/web',
        }),
      ],
    },
  ])(
    'should give each scope foundation and the axes it picks when $condition',
    ({ members, text, units }) => {
      // Arrange
      const config = parsedOf(text, members);

      // Act
      const resolution = resolveDeclaration({
        config,
        parser: parsers().cardParser,
        sources: [
          sourceOf(),
        ],
        today,
      });

      // Assert
      expect(resolution.units).toStrictEqual(units);
    },
  );

  it('should hold in each unit the blocks its own file lists, with their bases, when members list blocks', () => {
    // Arrange
    const config = configOf(
      {
        check: 'check: bun run check',
        domains: 'domains: [ui]',
      },
      {
        'apps/web': {
          implementations: 'implementations: [redux]',
        },
        'apps/api': {
          implementations: 'implementations: [redis]',
          platforms: 'platforms: [web]',
        },
      },
    );

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
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
      today,
    });

    // Assert
    expect(resolution).toStrictEqual({
      active: [
        activeOf({
          files: [
            'blocks/domains/ui/ui.md',
          ],
          governs: [
            '**/*.tsx',
          ],
          id: 'ui',
        }),
        activeOf({
          files: [
            'blocks/domains/base/base.md',
          ],
          governs: [
            '**/*.store.ts',
          ],
          id: 'base',
          unit: 'apps/web',
        }),
        activeOf({
          files: [
            'blocks/domains/store/store.md',
          ],
          governs: [
            '**/*.store.ts',
          ],
          id: 'store',
          unit: 'apps/web',
        }),
        activeOf({
          files: [
            'blocks/implementations/redux/redux.md',
          ],
          governs: [
            '**/*.store.ts',
          ],
          id: 'redux',
          unit: 'apps/web',
        }),
        activeOf({
          files: [
            'blocks/domains/cache/cache.md',
          ],
          governs: [
            '**/*.cache.ts',
          ],
          id: 'cache',
          unit: 'apps/api',
        }),
        activeOf({
          files: [
            'blocks/contexts/platforms/web/web.md',
          ],
          governs: [],
          id: 'web',
          unit: 'apps/api',
        }),
        activeOf({
          files: [
            'blocks/implementations/redis/redis.md',
          ],
          governs: [
            '**/*.cache.ts',
          ],
          id: 'redis',
          unit: 'apps/api',
        }),
      ],
      blocks: [
        catalogueEntryOf('core', Layer.Core),
        catalogueEntryOf('base', Layer.Domain),
        catalogueEntryOf('cache', Layer.Domain),
        catalogueEntryOf('store', Layer.Domain),
        catalogueEntryOf('ui', Layer.Domain),
        catalogueEntryOf('web', Layer.Platform),
        catalogueEntryOf('redis', Layer.Implementation),
        catalogueEntryOf('redux', Layer.Implementation),
        catalogueEntryOf('zustand', Layer.Implementation),
      ],
      check: 'bun run check',
      listing: listingOf({
        repository: [
          listedOf({
            id: 'ui',
            layer: Layer.Domain,
          }),
        ],
        units: [
          unitListingOf({
            entries: [
              ownEntryOf(
                listedOf({
                  id: 'base',
                  layer: Layer.Domain,
                }),
              ),
              ownEntryOf(
                listedOf({
                  id: 'store',
                  layer: Layer.Domain,
                }),
              ),
              ownEntryOf(
                listedOf({
                  id: 'redux',
                  layer: Layer.Implementation,
                }),
              ),
            ],
            leftOutBlocks: [
              'ui',
            ],
            unit: 'apps/web',
          }),
          unitListingOf({
            entries: [
              ownEntryOf(
                listedOf({
                  id: 'cache',
                  layer: Layer.Domain,
                }),
              ),
              ownEntryOf(
                listedOf({
                  id: 'web',
                  layer: Layer.Platform,
                }),
              ),
              ownEntryOf(
                listedOf({
                  id: 'redis',
                  layer: Layer.Implementation,
                }),
              ),
            ],
            leftOutBlocks: [
              'ui',
            ],
            unit: 'apps/api',
          }),
        ],
      }),
      musts: [],
      units: [
        unitOf({
          blocks: [
            'core',
            'ui',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'redux',
            'store',
            'base',
          ],
          path: 'apps/web',
        }),
        unitOf({
          blocks: [
            'core',
            'web',
            'redis',
            'cache',
          ],
          path: 'apps/api',
        }),
      ],
      warnings: [
        warningOf({
          code: WarningCode.Constitution,
          names: [
            'cache',
            'gone',
          ],
        }),
      ],
    });
  });

  it('should lower each rule an override names and every rule that takes its level from it when overrides hold', () => {
    // Arrange
    const config = configOf(
      {
        domains: 'domains: [forms]',
        overrides:
          'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n  - rule: loops-back\n    level: MAY\n    reason: A reason.',
      },
      {
        'apps/web': {
          domains: 'domains: [forms]',
          overrides:
            'overrides:\n  - rule: inputs-are-labelled\n    level: MAY\n    reason: A reason.\n    until: 2026-06-15',
        },
        'apps/api': {
          domains: 'domains: [forms]',
        },
      },
    );

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
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
                  tightens: 'inputs-are-labelled',
                  slug: 'labels-are-visible',
                }),
                ruleOf({
                  tightens: 'labels-are-visible',
                  slug: 'labels-are-above',
                }),
                ruleOf({
                  level: 'MUST',
                  tightens: 'inputs-are-labelled',
                  slug: 'labels-are-translated',
                }),
                ruleOf({
                  tightens: 'loops-ahead',
                  slug: 'loops-back',
                }),
                ruleOf({
                  tightens: 'loops-back',
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
      today,
    });

    // Assert
    expect(resolution).toStrictEqual({
      active: [
        activeOf({
          files: [
            'blocks/domains/forms/forms.md',
          ],
          governs: [],
          id: 'forms',
        }),
        activeOf({
          files: [
            'blocks/domains/forms/forms.md',
          ],
          governs: [],
          id: 'forms',
          unit: 'apps/web',
        }),
        activeOf({
          files: [
            'blocks/domains/forms/forms.md',
          ],
          governs: [],
          id: 'forms',
          unit: 'apps/api',
        }),
      ],
      blocks: [
        catalogueEntryOf('core', Layer.Core),
        catalogueEntryOf('forms', Layer.Domain),
      ],
      listing: listingOf({
        overrides: [
          listedOverrideOf({
            level: Level.Should,
            rule: 'inputs-are-labelled',
          }),
          listedOverrideOf({
            level: Level.May,
            rule: 'loops-back',
          }),
          listedOverrideOf({
            level: Level.May,
            rule: 'inputs-are-labelled',
            unit: 'apps/web',
            until: '2026-06-15',
          }),
        ],
        repository: [
          listedOf({
            id: 'forms',
            layer: Layer.Domain,
          }),
        ],
        units: [
          unitListingOf({
            unit: 'apps/web',
          }),
          unitListingOf({
            unit: 'apps/api',
          }),
        ],
      }),
      musts: [
        mustOf({
          block: 'forms',
          lowerings: [
            loweringOf({
              level: Level.Should,
            }),
            loweringOf({
              level: Level.May,
              unit: 'apps/web',
            }),
          ],
          slug: 'inputs-are-labelled',
        }),
        mustOf({
          block: 'forms',
          lowerings: [
            loweringOf({
              level: Level.Should,
              via: 'inputs-are-labelled',
            }),
            loweringOf({
              level: Level.May,
              unit: 'apps/web',
              via: 'inputs-are-labelled',
            }),
          ],
          slug: 'labels-are-visible',
        }),
        mustOf({
          block: 'forms',
          lowerings: [
            loweringOf({
              level: Level.Should,
              via: 'inputs-are-labelled',
            }),
            loweringOf({
              level: Level.May,
              unit: 'apps/web',
              via: 'inputs-are-labelled',
            }),
          ],
          slug: 'labels-are-above',
        }),
        mustOf({
          block: 'forms',
          slug: 'labels-are-translated',
        }),
        mustOf({
          block: 'forms',
          lowerings: [
            loweringOf({
              level: Level.May,
            }),
            loweringOf({
              level: Level.May,
              via: 'loops-back',
            }),
          ],
          slug: 'loops-back',
        }),
        mustOf({
          block: 'forms',
          lowerings: [
            loweringOf({
              level: Level.May,
              via: 'loops-back',
            }),
          ],
          slug: 'loops-ahead',
        }),
      ],
      units: [
        unitOf({
          blocks: [
            'core',
            'forms',
          ],
          loweredRules: [
            'inputs-are-labelled',
            'labels-are-visible',
            'labels-are-above',
            'loops-back',
            'loops-ahead',
          ],
        }),
        unitOf({
          blocks: [
            'core',
            'forms',
          ],
          loweredRules: [
            'inputs-are-labelled',
            'labels-are-visible',
            'labels-are-above',
          ],
          path: 'apps/web',
        }),
        unitOf({
          blocks: [
            'core',
            'forms',
          ],
          path: 'apps/api',
        }),
      ],
      warnings: [],
    });
  });

  it('should list the MUST rules active in any scope when blocks, axes and seams differ by scope', () => {
    // Arrange
    const config = configOf(
      {
        axes: 'axes: [architecture]',
        domains: 'domains: [ui]',
      },
      {
        'apps/web': {
          axes: 'axes: [workflow]',
          domains: 'domains: [ui]',
        },
      },
    );

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources: [
        sourceOf({
          blocks: [
            ui,
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
      today,
    });

    // Assert
    expect(resolution.musts).toStrictEqual([
      mustOf({
        block: 'ui',
        slug: 'inputs-are-labelled',
      }),
      mustOf({
        block: 'ui',
        slug: 'themes-are-tokens',
      }),
      mustOf({
        block: 'ui',
        slug: 'screens-are-reviewed',
      }),
    ]);
  });

  it('should list the repository blocks by layer, what each member adds and leaves out, then the overrides when the project spans members and a pack', () => {
    // Arrange
    const config = configOf(
      {
        axes: 'axes: [architecture]',
        domains: 'domains: [ui]',
        implementations: 'implementations: [react, lint]',
        languages: 'languages: [typescript]',
        overrides:
          'overrides:\n  - rule: inputs-are-labelled\n    level: SHOULD\n    reason: A reason.\n    until: 2026-07-01',
        packs: 'packs: [./rules]',
        platforms: 'platforms: [browser]',
      },
      {
        'apps/web': {
          domains: 'domains: [ui]',
          implementations: 'implementations: [react, redux, lint]',
          languages: 'languages: [typescript]',
          overrides:
            'overrides:\n  - rule: themes-are-tokens\n    level: MAY\n    reason: A reason.',
          packs: 'packs: [../../rules]',
          platforms: 'platforms: [browser, web]',
        },
        'apps/api': {
          axes: 'axes: []',
        },
      },
    );

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources: [
        sourceOf({
          blocks: [
            {
              ...ui,
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
            react,
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
      today,
    });

    // Assert
    expect(resolution.listing).toStrictEqual(
      listingOf({
        overrides: [
          listedOverrideOf({
            level: Level.Should,
            rule: 'inputs-are-labelled',
            until: '2026-07-01',
          }),
          listedOverrideOf({
            level: Level.May,
            rule: 'themes-are-tokens',
            unit: 'apps/web',
          }),
        ],
        repository: [
          listedOf({
            files: [
              filesOn({
                axis: Axis.Foundation,
                chapters: [
                  'writing.md-files',
                ],
                seams: [
                  'react',
                ],
              }),
              filesOn({
                axis: Axis.Architecture,
                chapters: [
                  'layers',
                ],
              }),
            ],
            id: 'ui',
            layer: Layer.Domain,
          }),
          listedOf({
            id: 'browser',
            layer: Layer.Platform,
          }),
          listedOf({
            id: 'typescript',
            layer: Layer.Language,
          }),
          listedOf({
            id: 'react',
            layer: Layer.Implementation,
          }),
          listedOf({
            id: 'lint',
            layer: Layer.Implementation,
            pack: './rules',
          }),
        ],
        units: [
          unitListingOf({
            entries: [
              addedEntryOf({
                files: [
                  filesOn({
                    axis: Axis.Architecture,
                    seams: [
                      'redux',
                    ],
                  }),
                  filesOn({
                    axis: Axis.Workflow,
                    chapters: [
                      'release',
                    ],
                    seams: [
                      'react',
                    ],
                  }),
                ],
                id: 'ui',
                layer: Layer.Domain,
              }),
              ownEntryOf(
                listedOf({
                  files: [
                    filesOn({
                      axis: Axis.Workflow,
                      chapters: [
                        'deploy',
                      ],
                    }),
                  ],
                  id: 'web',
                  layer: Layer.Platform,
                }),
              ),
              ownEntryOf(
                listedOf({
                  id: 'redux',
                  layer: Layer.Implementation,
                }),
              ),
            ],
            unit: 'apps/web',
          }),
          unitListingOf({
            leftOutAxes: [
              Axis.Architecture,
            ],
            leftOutBlocks: [
              'ui',
              'browser',
              'typescript',
              'react',
              'lint',
            ],
            unit: 'apps/api',
          }),
        ],
      }),
    );
  });

  it('should give each active block its files and the globs of every block that needs it when blocks need others', () => {
    // Arrange
    const config = configOf(
      {
        axes: 'axes: [architecture]',
        domains: 'domains: [ui]',
        implementations: 'implementations: [react, lint]',
        languages: 'languages: [typescript]',
        packs: 'packs: [./rules]',
      },
      {
        'apps/web': {
          domains: 'domains: [ui]',
          implementations: 'implementations: [react, lint]',
          languages: 'languages: [typescript]',
          packs: 'packs: [../../rules]',
        },
      },
    );

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
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
      today,
    });

    // Assert
    expect(resolution.active).toStrictEqual([
      activeOf({
        files: [
          'blocks/domains/ui/ui.md',
          'blocks/domains/ui/architecture/layers.md',
          'blocks/domains/ui/foundation/with/react.md',
        ],
        governs: [
          '**/*.tsx',
          '**/*.css',
        ],
        id: 'ui',
      }),
      activeOf({
        files: [
          'blocks/contexts/languages/typescript/typescript.md',
        ],
        governs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'typescript',
      }),
      activeOf({
        files: [
          'blocks/implementations/react/react.md',
        ],
        governs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'react',
      }),
      activeOf({
        files: [
          './rules/blocks/implementations/lint/lint.md',
          './rules/blocks/implementations/lint/architecture/rules.md',
        ],
        governs: [
          '**/*',
        ],
        id: 'lint',
      }),
      activeOf({
        files: [
          'blocks/domains/ui/ui.md',
          'blocks/domains/ui/architecture/layers.md',
          'blocks/domains/ui/workflow/release.md',
          'blocks/domains/ui/foundation/with/react.md',
          'blocks/domains/ui/workflow/with/lint.md',
        ],
        governs: [
          '**/*.tsx',
          '**/*.css',
        ],
        id: 'ui',
        unit: 'apps/web',
      }),
      activeOf({
        files: [
          'blocks/contexts/languages/typescript/typescript.md',
        ],
        governs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'typescript',
        unit: 'apps/web',
      }),
      activeOf({
        files: [
          'blocks/implementations/react/react.md',
        ],
        governs: [
          '**/*.tsx',
          '**/*.css',
          '**/*.ts',
          '**/*.jsx',
        ],
        id: 'react',
        unit: 'apps/web',
      }),
      activeOf({
        files: [
          './rules/blocks/implementations/lint/lint.md',
          './rules/blocks/implementations/lint/architecture/rules.md',
        ],
        governs: [
          '**/*.tsx',
          '**/*.css',
          '**/*',
        ],
        id: 'lint',
        unit: 'apps/web',
      }),
    ]);
  });

  it('should leave out a block of a pack its unit does not list when only the repository lists the pack', () => {
    // Arrange
    const config = configOf(
      {
        implementations: 'implementations: [lint]',
        packs: 'packs: [./rules]',
      },
      {
        'apps/web': {
          implementations: 'implementations: [lint]',
          packs: 'packs: [../../other]',
        },
      },
    );

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources: [
        sourceOf(),
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
      today,
    });

    // Assert
    expect({
      blocks: resolution.units.map((unit): readonly string[] => [
        ...unit.blocks,
      ]),
      warnings: resolution.warnings,
    }).toStrictEqual({
      blocks: [
        [
          'core',
          'lint',
        ],
        [
          'core',
        ],
      ],
      warnings: [
        warningOf({
          code: WarningCode.Pack,
          names: [
            'lint',
            './rules',
            'apps/web/constitution.yaml',
            'packs',
          ],
        }),
      ],
    });
  });

  it('should hold no core in any scope when the release has none', () => {
    // Arrange
    const config = configOf(
      {},
      {
        'apps/web': {},
      },
    );

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources: [
        {
          files: [],
          source: BlockSource.create(),
          where: '/work/project/.droneey/constitution',
        },
      ],
      today,
    });

    // Assert
    expect(resolution).toStrictEqual({
      active: [],
      blocks: [],
      listing: listingOf({
        units: [
          unitListingOf({
            unit: 'apps/web',
          }),
        ],
      }),
      musts: [],
      units: [
        unitOf({
          blocks: [],
        }),
        unitOf({
          blocks: [],
          path: 'apps/web',
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
      expected: undefined,
    },
    {
      check: 'check: ~',
      condition: 'it is YAML’s other null',
      expected: undefined,
    },
    {
      check: 'check:',
      condition: 'it is left empty',
      expected: undefined,
    },
  ])('should give the check constitution.yaml names when $condition', ({ check, expected }) => {
    // Arrange
    const config = configOf({
      check,
    });

    // Act
    const resolution = resolveDeclaration({
      config,
      parser: parsers().cardParser,
      sources: [
        sourceOf(),
      ],
      today,
    });

    // Assert
    expect(resolution.check).toBe(expected);
  });
});
