import { describe, expect, it } from 'bun:test';

import type { Page, PageSlugs } from '../../../domain/entities';
import { createFumadocsContent } from '../source.adapter';
import { siteCollectionsFixture, siteLayoutFixture } from './source.fixtures';

interface OutlineNode {
  readonly children?: readonly OutlineNode[];
  readonly icon?: string;
  readonly index?: OutlineNode;
  readonly name: string;
  readonly type: string;
  readonly url?: string;
}

const CROSS_LINK_MARK = 'data-cross-link';

const contentFixture = (): ReturnType<typeof createFumadocsContent> =>
  createFumadocsContent({
    collections: siteCollectionsFixture(),
    layout: siteLayoutFixture(),
  });

/** each entry of the tree as `<type> <address or name>`, then its marks, its children indented */
const outlineOf = (node: OutlineNode, depth = 0): readonly string[] => [
  [
    `${'  '.repeat(depth)}${node.type} ${node.url ?? node.name}`,
    ...(node.icon === undefined
      ? []
      : [
          'icon',
        ]),
    ...(node.name.includes(CROSS_LINK_MARK)
      ? [
          'cross-link',
        ]
      : []),
  ].join(' '),
  ...(node.index === undefined ? [] : outlineOf(node.index, depth + 1)),
  ...(node.children ?? []).flatMap((child) => outlineOf(child, depth + 1)),
];

/** the ids of the documents the exported index holds: a page, and each section of its text */
const indexedIdsOf = (exported: unknown): unknown =>
  JSON.parse(JSON.stringify(exported)).internalDocumentIDStore.internalIdToId;

describe('createFumadocsContent', () => {
  it.each<{
    condition: string;
    expected: Page | undefined;
    slugs: PageSlugs;
  }>([
    {
      condition: 'they name the overview',
      expected: {
        collection: 'overview',
        description: 'About Overview',
        path: 'README.md',
        title: 'Overview',
      },
      slugs: [],
    },
    {
      condition: "they name a block's passport, served as its folder's index",
      expected: {
        collection: 'blocks',
        description: 'About Core',
        path: 'core/core.md',
        title: 'Core',
      },
      slugs: [
        'core',
      ],
    },
    {
      condition: "they name a block's chapter",
      expected: {
        collection: 'blocks',
        description: 'About Code',
        path: 'core/foundation/code.md',
        title: 'Code',
      },
      slugs: [
        'core',
        'foundation',
        'code',
      ],
    },
    {
      condition: 'they name a document by its name on the site',
      expected: {
        collection: 'documents',
        description: 'About Decisions',
        path: 'DECISIONS.md',
        title: 'Decisions',
      },
      slugs: [
        'decisions',
      ],
    },
    {
      condition: 'they name the glossary',
      expected: {
        collection: 'glossary',
        description: 'About Glossary',
        path: 'PROJECT.md',
        title: 'Glossary',
      },
      slugs: [
        'glossary',
      ],
    },
    {
      condition: 'they name the quick start',
      expected: {
        collection: 'quickStart',
        description: 'About Start',
        path: 'README.md',
        title: 'Start',
      },
      slugs: [
        'quick-start',
      ],
    },
    {
      condition: 'they name a guide',
      expected: {
        collection: 'guide',
        description: 'About Upgrade',
        path: 'guides/upgrade.md',
        title: 'Upgrade',
      },
      slugs: [
        'guides',
        'upgrade',
      ],
    },
    {
      condition: 'they name no page',
      expected: undefined,
      slugs: [
        'guides',
        'moved',
      ],
    },
  ])('should find the page and where its body is when $condition', async ({ expected, slugs }) => {
    // Arrange
    const content = contentFixture();

    // Act
    const page = await content.find(slugs);

    // Assert
    expect(page).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'a page has the slugs',
      expected: '# Upgrade (/docs/guides/upgrade)\n\npinned',
      slugs: [
        'guides',
        'upgrade',
      ],
    },
    {
      condition: 'no page has them',
      expected: undefined,
      slugs: [
        'guides',
        'moved',
      ],
    },
  ])(
    'should read the page in Markdown, headed by its title and address, when $condition',
    async ({ expected, slugs }) => {
      // Arrange
      const content = contentFixture();

      // Act
      const markdown = await content.findMarkdown(slugs);

      // Assert
      expect(markdown).toBe(expected);
    },
  );

  it('should list every page by its slugs', async () => {
    // Arrange
    const content = contentFixture();

    // Act
    const catalog = await content.readCatalog();

    // Assert
    expect({
      guide: catalog['guides/upgrade'],
      slugs: Object.keys(catalog),
    }).toStrictEqual({
      guide: {
        collection: 'guide',
        description: 'About Upgrade',
        path: 'guides/upgrade.md',
        title: 'Upgrade',
      },
      slugs: [
        'core',
        'core/foundation/code',
        'decisions',
        'glossary',
        'guides/upgrade',
        '',
        'quick-start',
      ],
    });
  });

  it('should list every page of the sidebar with its address and summary', async () => {
    // Arrange
    const content = contentFixture();

    // Act
    const index = await content.readIndex();

    // Assert
    expect(index.split('\n')).toStrictEqual([
      '# Constitution',
      '',
      '- [Overview](/docs): About Overview',
      '- [Start](/docs/quick-start): About Start',
      '- [Upgrade](/docs/guides/upgrade): About Upgrade',
      '- [Glossary](/docs/glossary#main)',
      '- Core',
      '  - [Core](/docs/core): About Core',
      '  - Foundation',
      '    - [Code](/docs/core/foundation/code): About Code',
    ]);
  });

  it('should hold every page in Markdown, each headed by its title and address', async () => {
    // Arrange
    const content = contentFixture();

    // Act
    const text = await content.readFullText();

    // Assert
    expect(text.split('\n\n')).toStrictEqual([
      '# Core (/docs/core)',
      'rules',
      '# Code (/docs/core/foundation/code)',
      'read',
      '# Decisions (/docs/decisions)',
      'decided',
      '# Glossary (/docs/glossary)',
      'terms',
      '# Upgrade (/docs/guides/upgrade)',
      'pinned',
      '# Overview (/docs)',
      'overview',
      '# Start (/docs/quick-start)',
      'install',
    ]);
  });

  it.each<{
    expected: string;
    read: (content: ReturnType<typeof createFumadocsContent>) => Promise<string | undefined>;
    text: string;
  }>([
    {
      expected: [
        '# Constitution',
        '',
        '- [Overview](/v0.70.0/docs): About Overview',
        '- [Start](/v0.70.0/docs/quick-start): About Start',
        '- [Upgrade](/v0.70.0/docs/guides/upgrade): About Upgrade',
        '- [Glossary](/v0.70.0/docs/glossary#main)',
        '- Core',
        '  - [Core](/v0.70.0/docs/core): About Core',
        '  - Foundation',
        '    - [Code](/v0.70.0/docs/core/foundation/code): About Code',
      ].join('\n'),
      read: (content) => content.readIndex(),
      text: 'index',
    },
    {
      expected: '# Upgrade (/v0.70.0/docs/guides/upgrade)\n\npinned',
      read: (content) =>
        content.findMarkdown([
          'guides',
          'upgrade',
        ]),
      text: "page's Markdown",
    },
  ])(
    "should address the pages under the site's base in the $text when the site is served under one",
    async ({ expected, read }) => {
      // Arrange
      const content = createFumadocsContent({
        collections: siteCollectionsFixture(),
        layout: siteLayoutFixture(),
        siteBase: '/v0.70.0/',
      });

      // Act
      const text = await read(content);

      // Assert
      expect(text).toBe(expected);
    },
  );

  it.each([
    {
      condition: "the site is served at the host's root",
      siteBase: '/',
    },
    {
      condition: "the site is served under a release's base, which the router adds itself",
      siteBase: '/v0.70.0/',
    },
  ])(
    "should lay the tree out by the sidebar, with the pages' icons and the cross links marked, when $condition",
    async ({ siteBase }) => {
      // Arrange
      const content = createFumadocsContent({
        collections: siteCollectionsFixture(),
        layout: siteLayoutFixture(),
        siteBase,
      });

      // Act
      const navigation = await content.readNavigation();

      // Assert
      expect(outlineOf(JSON.parse(JSON.stringify(navigation.data)))).toStrictEqual([
        'root Constitution',
        '  page /docs',
        '  page /docs/quick-start',
        '  page /docs/guides/upgrade icon',
        '  page /docs/glossary#main cross-link',
        '  folder Core',
        '    page /docs/core',
        '    folder Foundation',
        '      page /docs/core/foundation/code',
      ]);
    },
  );

  it('should index every page and section of its text for the search', async () => {
    // Arrange
    const content = contentFixture();

    // Act
    const exported = await content.export();

    // Assert
    expect(indexedIdsOf(exported)).toStrictEqual([
      '/docs/core',
      '/docs/core-0',
      '/docs/core-1',
      '/docs/core/foundation/code',
      '/docs/core/foundation/code-0',
      '/docs/core/foundation/code-1',
      '/docs/decisions',
      '/docs/decisions-0',
      '/docs/decisions-1',
      '/docs/glossary',
      '/docs/glossary-0',
      '/docs/glossary-1',
      '/docs/guides/upgrade',
      '/docs/guides/upgrade-0',
      '/docs/guides/upgrade-1',
      '/docs',
      '/docs-0',
      '/docs-1',
      '/docs/quick-start',
      '/docs/quick-start-0',
      '/docs/quick-start-1',
    ]);
  });
});
