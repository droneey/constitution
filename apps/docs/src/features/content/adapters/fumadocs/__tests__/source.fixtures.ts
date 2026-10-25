import type { SiteCollections, SiteLayout } from '../source.adapter';

type SiteSource = ReturnType<SiteCollections['guide']['toFumadocsSource']>;

interface PageInput {
  readonly icon?: string;
  /** in its collection */
  readonly path: string;
  readonly text: string;
  readonly title: string;
}

const sourceOf = (pages: readonly PageInput[]): SiteSource => ({
  files: pages.map(({ icon, path, text, title }) => ({
    data: {
      description: `About ${title}`,
      ...(icon === undefined
        ? {}
        : {
            icon,
          }),
      getText: () => Promise.resolve(text),
      structuredData: {
        contents: [
          {
            content: text,
            heading: undefined,
          },
        ],
        headings: [],
      },
      title,
    },
    path,
    type: 'page',
  })),
});

const collectionOf = (pages: readonly PageInput[]): SiteCollections['guide'] => ({
  toFumadocsSource: () => sourceOf(pages),
});

/** an overview, a guide, a block's passport and chapter, a document, the glossary and the quick start */
export const siteCollectionsFixture = (): SiteCollections => ({
  blocks: collectionOf([
    {
      path: 'core/core.md',
      text: 'rules',
      title: 'Core',
    },
    {
      path: 'core/foundation/code.md',
      text: 'read',
      title: 'Code',
    },
  ]),
  documents: collectionOf([
    {
      path: 'DECISIONS.md',
      text: 'decided',
      title: 'Decisions',
    },
  ]),
  glossary: collectionOf([
    {
      path: 'PROJECT.md',
      text: 'terms',
      title: 'Glossary',
    },
  ]),
  guide: collectionOf([
    {
      icon: 'Package',
      path: 'guides/upgrade.md',
      text: 'pinned',
      title: 'Upgrade',
    },
  ]),
  overview: collectionOf([
    {
      path: 'README.md',
      text: 'overview',
      title: 'Overview',
    },
  ]),
  quickStart: collectionOf([
    {
      path: 'README.md',
      text: 'install',
      title: 'Start',
    },
  ]),
});

export const siteLayoutFixture = (): SiteLayout => ({
  documents: {
    'DECISIONS.md': 'decisions',
  },
  folders: [
    {
      data: {
        pages: [
          'index',
          'quick-start',
          './guides/upgrade',
          '[Glossary](/docs/glossary)',
          'core',
        ],
        title: 'Constitution',
      },
      path: 'meta.json',
      type: 'meta',
    },
  ],
  glossary: 'glossary',
  quickStart: 'quick-start',
});
