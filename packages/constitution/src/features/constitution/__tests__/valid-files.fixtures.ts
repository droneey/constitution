import type { Files } from './constitution.fixtures';
import { blockFiles, chapterFile, rule } from './constitution.fixtures';

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
  'hooks/hooks.json': JSON.stringify({
    hooks: {},
  }),
  'templates/PROJECT.md': '# Project Context\n',
  'templates/DECISIONS.md': '# Decisions\n',
  'templates/block/block.md': '---\nid: <id>\n---\n',
  'templates/block/foundation/chapter.md': '# <Chapter>\n',
  'templates/constitution.yaml': 'axes: []\n',
  'vocabulary.yaml': [
    'architecture:',
    '  concepts: [port, binding unit]',
    '  folders: [adapters/]',
    '  suffixes: [.port]',
    'workflow:',
    '  concepts: [squash merge]',
    '  folders: [feature/]',
    '  suffixes: []',
    '',
  ].join('\n'),
});

const upperFiles = (): Files => ({
  ...blockFiles({
    body: [
      '# Core',
      '',
      'Read [principles](foundation/principles.md).',
      '',
      '## Its chapters',
      '',
      '- `foundation/`: [principles](foundation/principles.md).',
      '- `workflow/`: [workflow](workflow/workflow.md).',
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
      'workflow/workflow.md': chapterFile(
        'Workflow',
        rule({
          slug: 'rules-bind',
        }),
      ),
    },
    id: 'core',
  }),
  ...blockFiles({
    body: '# i18n\n',
    dir: 'blocks/domains/i18n',
    files: {
      'plurals.md': chapterFile(
        'Plurals',
        rule({
          slug: 'i18n-plurals-by-cldr',
          tags: '[ux]',
        }),
      ),
    },
    id: 'i18n',
  }),
  ...blockFiles({
    body: '# Remote data\n',
    dir: 'blocks/domains/remote-data',
    files: {
      'architecture/reads.md': chapterFile(
        'Reads',
        rule({
          slug: 'reads-are-cancellable',
          tags: '[data]',
        }),
      ),
    },
    id: 'remote-data',
  }),
  ...blockFiles({
    body: '# UI\n',
    dir: 'blocks/domains/ui',
    files: {
      'architecture/with/remote-data.md': chapterFile(
        'Remote data',
        rule({
          parent: 'reads-are-cancellable',
          slug: 'optimistic-writes-roll-back',
          tags: '[ux]',
        }),
      ),
      'screens.md': chapterFile(
        'Screens',
        rule({
          slug: 'four-data-states',
          tags: '[ux, a11y]',
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
          tags: '[security]',
        }),
      ),
    },
    id: 'untrusted-client',
  }),
});

const contextFiles = (): Files => ({
  ...blockFiles({
    body: '# TypeScript\n',
    dir: 'blocks/contexts/languages/typescript',
    files: {
      'types.md': chapterFile(
        'Types',
        rule({
          slug: 'any-never-typed',
          statement: 'A TypeScript value is never typed `any`.',
        }),
      ),
    },
    id: 'typescript',
    dictionary: [
      'TypeScript',
      '.ts',
      'index.ts',
    ],
  }),
  ...blockFiles({
    body: '# Browser\n',
    dir: 'blocks/contexts/platforms/browser',
    files: {
      'architecture/render.md': chapterFile(
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
    abstract: true,
    body: '# React\n',
    dir: 'blocks/implementations/_react',
    files: {
      'hooks.md': chapterFile(
        'Hooks',
        rule({
          slug: 'hooks-at-top-level',
          statement: 'A React hook is called only at the top level.',
        }),
      ),
    },
    id: '_react',
    dictionary: [
      'React',
    ],
    requires: [
      'ui',
    ],
  }),
  ...blockFiles({
    body: '# Biome\n\nBiome checks every `.ts` file.\n',
    dir: 'blocks/implementations/biome',
    id: 'biome',
    dictionary: [
      'Biome',
    ],
    languages: [
      'typescript',
    ],
    requires: [
      'typescript',
    ],
  }),
  ...blockFiles({
    body: [
      '# Lingui',
      '',
      'Lingui compiles its catalogs.',
      '',
      '## Requirements',
      '',
      '| Requirement | How | Met |',
      '|---|---|---|',
      '| `i18n-plurals-by-cldr` | ICU plural | yes |',
      '',
    ].join('\n'),
    dir: 'blocks/implementations/lingui',
    id: 'lingui',
    dictionary: [
      'Lingui',
    ],
    requires: [
      'i18n',
      'typescript',
    ],
  }),
  ...blockFiles({
    body: '# React DOM\n',
    dir: 'blocks/implementations/react-dom',
    extends: '_react',
    files: {
      'workflow/portals.md': chapterFile(
        'Portals',
        rule({
          slug: 'portals-for-overlays',
          statement: 'React DOM renders an overlay through a portal.',
        }),
      ),
    },
    id: 'react-dom',
    dictionary: [
      'React DOM',
    ],
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
