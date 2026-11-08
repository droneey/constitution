import { afterEach, describe, expect, it } from 'bun:test';

import { blockFoldersOf, siteLayoutOf } from '../folders.adapter';
import { enterRepository } from './repository.fixtures';

const BLOCKS = 'packages/constitution/blocks';

const blockFiles: Readonly<Record<string, string>> = {
  [`${BLOCKS}/core/core.md`]: [
    '# Core',
    '',
    '- `@foundation/`: [placement](@foundation/placement.md), [code](@foundation/code.md).',
    '- `@architecture/`: [layers](@architecture/layers.md).',
    '',
  ].join('\n'),
  [`${BLOCKS}/core/@architecture/layers.md`]: '# Layers\n',
  [`${BLOCKS}/core/@foundation/code.md`]: '# Code\n',
  [`${BLOCKS}/core/@foundation/placement.md`]: '# Placement\n',
  [`${BLOCKS}/domains/people/people.md`]: '---\nid: people\n---\n',
  [`${BLOCKS}/domains/people/accounts/accounts.md`]: '---\nid: people/accounts\n---\n',
  [`${BLOCKS}/domains/people/accounts/@foundation/with/transports/http.md`]: '# HTTP\n',
  [`${BLOCKS}/domains/people/@architecture/consent.md`]: '# Consent\n',
  [`${BLOCKS}/contexts/platforms/client/client.md`]: '---\nid: client\n---\n',
  [`${BLOCKS}/contexts/platforms/client/browser/browser.md`]: '---\nid: client/browser\n---\n',
  [`${BLOCKS}/contexts/languages/css/css.md`]: '---\nid: css\n---\n',
  [`${BLOCKS}/implementations/react/react.md`]: '---\nid: react\n---\n',
};

const repository = {
  leave: (): void => undefined,
};

afterEach(() => {
  repository.leave();
  repository.leave = (): void => undefined;
});

describe('blockFoldersOf', () => {
  it("should title every folder of blocks, name each axis folder without its mark, and list a block's own blocks after its axes", () => {
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
            'people',
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
            'client',
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
            'react',
          ],
          title: 'Implementations',
        },
        path: 'implementations/meta.json',
        type: 'meta',
      },
      {
        data: {
          pages: [
            'architecture',
            'accounts',
          ],
        },
        path: 'domains/people/meta.json',
        type: 'meta',
      },
      {
        data: {
          title: 'Architecture',
        },
        path: 'domains/people/architecture/meta.json',
        type: 'meta',
      },
      {
        data: {
          pages: [
            'foundation',
          ],
        },
        path: 'domains/people/accounts/meta.json',
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
        path: 'domains/people/accounts/foundation/meta.json',
        type: 'meta',
      },
      {
        data: {
          pages: [
            'browser',
          ],
        },
        path: 'contexts/platforms/client/meta.json',
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
      folders: 14,
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
