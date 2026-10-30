import { afterEach, describe, expect, it } from 'bun:test';

import { blockFoldersOf, siteLayoutOf } from '../folders.adapter';
import { enterRepository } from './repository.fixtures';

const BLOCKS = 'packages/constitution/blocks';

const cardOf = (id: string, base: string): string =>
  `---\nid: ${id}\nextends: ${base}\n---\n\n# ${id}\n`;

const blockFiles: Readonly<Record<string, string>> = {
  [`${BLOCKS}/core/core.md`]: [
    '# Core',
    '',
    '- `foundation/`: [placement](foundation/placement.md), [code](foundation/code.md).',
    '- `architecture/`: [layers](architecture/layers.md).',
    '',
  ].join('\n'),
  [`${BLOCKS}/core/architecture/layers.md`]: '# Layers\n',
  [`${BLOCKS}/core/foundation/code.md`]: '# Code\n',
  [`${BLOCKS}/core/foundation/placement.md`]: '# Placement\n',
  [`${BLOCKS}/domains/ui/ui.md`]: cardOf('ui', 'null'),
  [`${BLOCKS}/domains/ui/architecture/screens.md`]: '# Screens\n',
  [`${BLOCKS}/domains/ui/foundation/with/react.md`]: '# React\n',
  [`${BLOCKS}/contexts/platforms/browser/browser.md`]: cardOf('browser', 'null'),
  [`${BLOCKS}/contexts/languages/css/css.md`]: cardOf('css', 'null'),
  [`${BLOCKS}/implementations/react-dom/react-dom.md`]: cardOf('react-dom', '_react'),
  [`${BLOCKS}/implementations/_react/_react.md`]: cardOf('_react', 'null'),
};

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
  repository.leave = (): void => undefined;
});

describe('blockFoldersOf', () => {
  it('should title every folder of blocks and order its pages: layers, blocks, axes and seams last', () => {
    // Arrange
    repository.leave = enterRepository({
      files: blockFiles,
    }).leave;

    // Act
    const folders = blockFoldersOf();

    // Assert
    expect(folders).toStrictEqual([
      {
        data: {
          icon: 'Boxes',
          pages: [
            'platforms',
            'languages',
          ],
          title: 'Contexts',
        },
        path: 'contexts/meta.json',
        type: 'meta',
      },
      {
        data: {
          icon: 'ScrollText',
          pages: [
            'foundation',
            'architecture',
          ],
          title: 'Core',
        },
        path: 'core/meta.json',
        type: 'meta',
      },
      {
        data: {
          icon: 'Shapes',
          pages: [
            'ui',
          ],
          title: 'Domains',
        },
        path: 'domains/meta.json',
        type: 'meta',
      },
      {
        data: {
          icon: 'MonitorSmartphone',
          pages: [
            'browser',
          ],
          title: 'Platforms',
        },
        path: 'contexts/platforms/meta.json',
        type: 'meta',
      },
      {
        data: {
          icon: 'Code',
          pages: [
            'css',
          ],
          title: 'Languages',
        },
        path: 'contexts/languages/meta.json',
        type: 'meta',
      },
      {
        data: {
          icon: 'Wrench',
          pages: [
            '_react',
            'react-dom',
          ],
          title: 'Implementations',
        },
        path: 'implementations/meta.json',
        type: 'meta',
      },
      {
        data: {
          pages: [
            'foundation',
            'architecture',
          ],
        },
        path: 'domains/ui/meta.json',
        type: 'meta',
      },
      {
        data: {
          pages: [
            '...',
            'with',
          ],
          title: 'Foundation',
        },
        path: 'domains/ui/foundation/meta.json',
        type: 'meta',
      },
      {
        data: {
          title: 'Architecture',
        },
        path: 'domains/ui/architecture/meta.json',
        type: 'meta',
      },
      {
        data: {
          pages: [
            'placement',
            'code',
          ],
          title: 'Foundation',
        },
        path: 'core/foundation/meta.json',
        type: 'meta',
      },
      {
        data: {
          pages: [
            'layers',
          ],
          title: 'Architecture',
        },
        path: 'core/architecture/meta.json',
        type: 'meta',
      },
    ]);
  });
});

describe('siteLayoutOf', () => {
  it("should add the README's sidebar as the guide's folder, before the folders of blocks", () => {
    // Arrange
    repository.leave = enterRepository({
      files: {
        ...blockFiles,
        'README.md': '## Documentation\n\n### Guides\n\n- [Upgrade](docs/guides/upgrade.md)',
      },
    }).leave;

    // Act
    const layout = siteLayoutOf('/docs');

    // Assert
    expect({
      documents: layout.documents,
      folders: layout.folders.length,
      glossary: layout.glossary,
      guide: layout.folders[0],
      quickStart: layout.quickStart,
    }).toStrictEqual({
      documents: {
        'CONTRIBUTING.md': 'contributing',
        'DECISIONS.md': 'decisions',
      },
      folders: 12,
      glossary: 'glossary',
      guide: {
        data: {
          pages: [
            '---Guides---',
            'index',
            'quick-start',
            './guides/upgrade',
          ],
          title: 'Constitution',
        },
        path: 'meta.json',
        type: 'meta',
      },
      quickStart: 'quick-start',
    });
  });
});
