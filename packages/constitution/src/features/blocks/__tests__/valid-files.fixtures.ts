import type { Files } from './constitution.fixtures';
import { blockFiles, chapterFile, rule, vocabularyChapterFile } from './constitution.fixtures';

const pluginFiles = (): Files => ({
  '.claude-plugin/marketplace.json': JSON.stringify({
    name: 'droneey',
    plugins: [
      {
        name: 'constitution',
        source: {
          ref: 'v1.0.0',
          repo: 'droneey/constitution',
          source: 'github',
        },
      },
    ],
  }),
  '.claude-plugin/plugin.json': JSON.stringify({
    name: 'constitution',
    repository: 'https://github.com/droneey/constitution',
  }),
  'DECISIONS.md': [
    '# Decision Log',
    '',
    '## ADR-0001 — Blocks sit in layers',
    '**Date:** 2026-09-25 · **Status:** Accepted',
    '',
    '- **Decision.** Four layers; see [core](blocks/core/core.md).',
    '',
    '## ADR-0002 — Two links join blocks',
    '**Date:** 2026-09-25 · **Status:** Accepted',
    '',
  ].join('\n'),
  'README.md': '# constitution\n\nStart with [core](blocks/core/core.md).\n',
  'ai/hooks/hooks.json': JSON.stringify({
    hooks: {},
  }),
  'templates/PROJECT.md': '# Project Context\n',
  'templates/DECISIONS.md': '# Decisions\n',
  'templates/block/block.md': '---\nid: <id>\n---\n',
  'templates/block/@foundation/chapter.md': '# <Chapter>\n',
  'templates/constitution.yaml': 'axes: []\n',
});

const upperFiles = (): Files => ({
  ...blockFiles({
    body: [
      '# Core',
      '',
      'Read [principles](@foundation/principles.md).',
      '',
      '## Its chapters',
      '',
      '- `@foundation/`: [principles](@foundation/principles.md).',
      '- `@workflow/`: [workflow](@workflow/workflow.md).',
      '',
    ].join('\n'),
    dir: 'blocks/core',
    files: {
      'principles.md': chapterFile(
        'Principles',
        rule({
          slug: 'dependencies-point-inward',
        }),
      ),
      '@workflow/workflow.md': chapterFile(
        'Workflow',
        rule({
          slug: 'rules-bind',
        }),
      ),
    },
    id: 'core',
  }),
  ...blockFiles({
    body: '# i18n\n\n> The words of the program in every locale.\n',
    dir: 'blocks/domains/i18n',
    files: {
      'plurals.md': chapterFile(
        'Plurals',
        rule({
          slug: 'i18n-plurals-by-cldr',
        }),
      ),
    },
    id: 'i18n',
  }),
  ...blockFiles({
    body: '# Remote data\n\n> The data the program reads from afar.\n',
    dir: 'blocks/domains/remote-data',
    files: {
      '@architecture/reads.md': chapterFile(
        'Reads',
        rule({
          slug: 'reads-are-cancellable',
        }),
      ),
    },
    id: 'remote-data',
  }),
  ...blockFiles({
    body: '# UI\n\n> The screens of the program.\n',
    dir: 'blocks/domains/ui',
    files: {
      '@architecture/with/remote-data.md': chapterFile(
        'Remote data',
        rule({
          tightens: 'reads-are-cancellable',
          slug: 'optimistic-writes-roll-back',
        }),
      ),
      'screens.md': chapterFile(
        'Screens',
        rule({
          slug: 'four-data-states',
        }),
      ),
    },
    governs: [
      '**/ui/**',
    ],
    id: 'ui',
  }),
  ...blockFiles({
    dir: 'blocks/domains/untrusted-client',
    files: {
      'secrets.md': chapterFile(
        'Secrets',
        rule({
          slug: 'secret-never-held-by-the-client',
        }),
      ),
    },
    id: 'untrusted-client',
  }),
});

const contextFiles = (): Files => ({
  ...blockFiles({
    body: '# TypeScript\n\n> A program written in TypeScript.\n',
    dir: 'blocks/contexts/languages/typescript',
    files: {
      'types.md': vocabularyChapterFile({
        rules: [
          rule({
            slug: 'any-never-typed',
            statement: 'A TypeScript value is never typed `any`.',
          }),
        ],
        title: 'Types',
        vocabulary:
          '**TypeScript** files end in **`.ts`**{#typescript-source}, and a package opens at **`index.ts`**.',
      }),
    },
    id: 'typescript',
  }),
  ...blockFiles({
    body: '# Browser\n\n> A program that runs in a browser.\n',
    dir: 'blocks/contexts/platforms/browser',
    files: {
      '@architecture/render.md': chapterFile(
        'Render',
        rule({
          slug: 'window-never-read-during-render',
        }),
      ),
    },
    id: 'browser',
    requires: [
      'untrusted-client',
    ],
  }),
});

const implementationFiles = (): Files => ({
  ...blockFiles({
    body: '# React\n\n> The components of React.\n',
    dir: 'blocks/implementations/react',
    files: {
      'hooks.md': vocabularyChapterFile({
        rules: [
          rule({
            slug: 'hooks-at-top-level',
            statement: 'A React hook is called only at the top level.',
          }),
        ],
        title: 'Hooks',
        vocabulary: 'The components of **React**.',
      }),
    },
    id: 'react',
    requires: [
      'ui',
    ],
  }),
  ...blockFiles({
    body: '# Biome\n\n> The linter and formatter Biome.\n',
    dir: 'blocks/implementations/biome',
    files: {
      'checks.md': vocabularyChapterFile({
        rules: [
          rule({
            slug: 'biome-checks-every-file',
            statement: 'Biome checks every `.ts` file.',
          }),
        ],
        title: 'Checks',
        vocabulary: '**Biome** checks every `.ts` file.',
      }),
    },
    id: 'biome',
    languages: [
      'typescript',
    ],
    requires: [
      'typescript',
    ],
  }),
  ...blockFiles({
    body: '# Lingui\n\n> The translation library Lingui.\n',
    dir: 'blocks/implementations/lingui',
    files: {
      'catalogs.md': vocabularyChapterFile({
        rules: [
          rule({
            slug: 'catalog-compiled-before-every-build',
            statement: 'Lingui compiles every catalog before a build.',
          }),
        ],
        title: 'Catalogs',
        vocabulary: '**Lingui** compiles its catalogs.',
      }),
    },
    id: 'lingui',
    requires: [
      'i18n',
      'typescript',
    ],
  }),
  ...blockFiles({
    body: '# React DOM\n\n> React in a browser.\n',
    dir: 'blocks/implementations/react/react-dom',
    files: {
      '@workflow/portals.md': vocabularyChapterFile({
        rules: [
          rule({
            slug: 'portals-for-overlays',
            statement: 'React DOM renders every overlay through a portal.',
          }),
        ],
        title: 'Portals',
        vocabulary: '**React DOM** renders to a browser.',
      }),
    },
    id: 'react/react-dom',
    requires: [
      'browser',
    ],
  }),
});

const validFiles = (): Files => ({
  ...pluginFiles(),
  ...upperFiles(),
  ...contextFiles(),
  ...implementationFiles(),
});

export { validFiles };
