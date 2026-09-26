import type { Files } from './fixtures';
import { mainFile, rule } from './fixtures';

const pluginFiles = (): Files => ({
  '.claude-plugin/marketplace.json': JSON.stringify({
    name: 'droneey',
    plugins: [
      {
        name: 'constitution',
        source: './',
      },
    ],
  }),
  '.claude-plugin/plugin.json': JSON.stringify({
    name: 'constitution',
  }),
  'README.md': '# constitution\n\nStart with [core](blocks/core/core.md).\n',
  'hooks/hooks.json': JSON.stringify({
    hooks: {},
  }),
});

const upperFiles = (): Files => ({
  'blocks/core/core.md': mainFile({
    body: `# Core\n\nRead [principles](principles.md).\n\n${rule({
      slug: 'rules-bind',
    })}`,
    chapters: [
      'principles.md',
    ],
    id: 'core',
    kind: 'core',
  }),
  'blocks/core/principles.md': `# Principles\n\n${rule({
    check: 'tool — architecture',
    slug: 'dependencies-point-inward',
  })}`,
  'blocks/domains/i18n/i18n.md': mainFile({
    body: `# i18n\n\n${rule({
      slug: 'i18n-plurals-by-cldr',
      tags: 'ux',
    })}`,
    id: 'i18n',
    kind: 'domain',
  }),
  'blocks/domains/remote-data/remote-data.md': mainFile({
    body: `# Remote data\n\n${rule({
      slug: 'reads-are-cancellable',
      tags: 'data',
    })}`,
    id: 'remote-data',
    kind: 'domain',
  }),
  'blocks/domains/ui/ui.md': mainFile({
    body: `# UI\n\n${rule({
      check: 'test',
      slug: 'four-data-states',
      tags: 'ux, a11y',
    })}`,
    governs: [
      '**/ui/**',
    ],
    id: 'ui',
    kind: 'domain',
  }),
  'blocks/domains/ui/with/remote-data.md': `# UI with remote data\n\n${rule({
    implementsSlug: 'reads-are-cancellable',
    slug: 'optimistic-writes-roll-back',
    tags: 'ux, data',
  })}`,
  'blocks/domains/untrusted-client/untrusted-client.md': mainFile({
    body: `# Untrusted client\n\n${rule({
      slug: 'no-secret-in-the-client',
      tags: 'security',
    })}`,
    id: 'untrusted-client',
    kind: 'domain',
  }),
});

const contextFiles = (): Files => ({
  'blocks/contexts/languages/typescript/typescript.md': mainFile({
    body: `# TypeScript\n\n${rule({
      check: 'tool — types',
      slug: 'no-any',
      statement: 'A TypeScript value is never typed `any`.',
      tags: 'types',
    })}`,
    checks: [
      'types',
    ],
    id: 'typescript',
    kind: 'context',
    owns: [
      'TypeScript',
      '.ts',
      'index.ts',
    ],
  }),
  'blocks/contexts/platforms/browser/browser.md': mainFile({
    body: `# Browser\n\n${rule({
      slug: 'no-window-during-render',
    })}`,
    id: 'browser',
    kind: 'context',
    requires: [
      'untrusted-client',
    ],
  }),
});

const implementationFiles = (): Files => ({
  'blocks/implementations/_react/_react.md': mainFile({
    abstract: true,
    body: `# React\n\n${rule({
      check: 'tool — lint',
      slug: 'hooks-at-top-level',
      statement: 'A React hook is called only at the top level.',
    })}`,
    id: '_react',
    kind: 'implementation',
    owns: [
      'React',
    ],
    requires: [
      'ui',
    ],
  }),
  'blocks/implementations/biome/biome.md': mainFile({
    body: '# Biome\n\nBiome checks every `.ts` file.\n',
    checks: [
      'format',
      'lint',
    ],
    id: 'biome',
    kind: 'implementation',
    owns: [
      'Biome',
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
      '| Requirement | How | Status |',
      '|---|---|---|',
      '| `i18n-plurals-by-cldr` | ICU plural | met |',
      '',
    ].join('\n'),
    id: 'lingui',
    kind: 'implementation',
    owns: [
      'Lingui',
    ],
    requires: [
      'i18n',
      'typescript',
    ],
  }),
  'blocks/implementations/react-dom/react-dom.md': mainFile({
    body: `# React DOM\n\n${rule({
      slug: 'portals-for-overlays',
      statement: 'React DOM renders an overlay through a portal.',
    })}`,
    extends: '_react',
    id: 'react-dom',
    kind: 'implementation',
    owns: [
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
