import type { Files } from './constitution.fixtures';
import { blockFiles, mainFile, rule } from './constitution.fixtures';
import { digestFiles } from './valid-digests.fixtures';

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
  'templates/block.md': '---\nid: <id>\n---\n',
  'templates/constitution.yaml': 'version: <installed version>\n',
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
    body: '# Core\n\nRead [principles](principles.md).\n',
    dir: 'blocks/core',
    files: {
      'principles.md': `# Principles\n\n${rule({
        slug: 'dependencies-point-inward',
      })}`,
      'workflow/workflow.md': `# Workflow\n\n${rule({
        slug: 'rules-bind',
      })}`,
    },
    id: 'core',
  }),
  ...blockFiles({
    body: '# i18n\n',
    dir: 'blocks/domains/i18n',
    files: {
      'plurals.md': `# Plurals\n\n${rule({
        slug: 'i18n-plurals-by-cldr',
        tags: '[ux]',
      })}`,
    },
    id: 'i18n',
  }),
  ...blockFiles({
    body: '# Remote data\n',
    dir: 'blocks/domains/remote-data',
    files: {
      'architecture/remote-data.md': `# Remote data\n\n${rule({
        slug: 'reads-are-cancellable',
        tags: '[data]',
      })}`,
    },
    id: 'remote-data',
  }),
  ...blockFiles({
    body: '# UI\n',
    dir: 'blocks/domains/ui',
    files: {
      'architecture/with/remote-data.md': `# UI with remote data\n\n${rule({
        parent: 'reads-are-cancellable',
        slug: 'optimistic-writes-roll-back',
        tags: '[ux]',
      })}`,
      'screens.md': `# Screens\n\n${rule({
        slug: 'four-data-states',
        tags: '[ux, a11y]',
      })}`,
    },
    governs: [
      '**/ui/**',
    ],
    id: 'ui',
  }),
  ...blockFiles({
    body: `# Untrusted client\n\n${rule({
      slug: 'no-secret-in-the-client',
      tags: '[security]',
    })}`,
    dir: 'blocks/domains/untrusted-client',
    id: 'untrusted-client',
  }),
});

const contextFiles = (): Files => ({
  ...blockFiles({
    body: '# TypeScript\n',
    dir: 'blocks/contexts/languages/typescript',
    files: {
      'types.md': `# Types\n\n${rule({
        slug: 'no-any',
        statement: 'A TypeScript value is never typed `any`.',
      })}`,
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
      'architecture/browser.md': `# Browser\n\n${rule({
        slug: 'no-window-during-render',
      })}`,
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
      'hooks.md': `# Hooks\n\n${rule({
        slug: 'hooks-at-top-level',
        statement: 'A React hook is called only at the top level.',
      })}`,
    },
    id: '_react',
    dictionary: [
      'React',
    ],
    requires: [
      'ui',
    ],
  }),
  'blocks/implementations/biome/biome.md': mainFile({
    body: '# Biome\n\nBiome checks every `.ts` file.\n',
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
  'blocks/implementations/lingui/lingui.md': mainFile({
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
      'workflow/portals.md': `# Portals\n\n${rule({
        slug: 'portals-for-overlays',
        statement: 'React DOM renders an overlay through a portal.',
      })}`,
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
  ...digestFiles(),
  ...upperFiles(),
  ...contextFiles(),
  ...implementationFiles(),
});

export { validFiles };
