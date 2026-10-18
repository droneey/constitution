// Stryker disable all: it loads the collections fumadocs-mdx generates at build time, which no spec can load; the site's build proves it

import type { InferPageType, LLMsWithPages, MetaData, Source } from 'fumadocs-core/source';
import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

import { docsRoute } from '#/shared/constants';
import { blocks, documents, glossary, guide, overview, quickStart } from '#collections/server';

import { cardAsIndex, crossLinks, markdownOfPage, renamed } from './pages.adapter';
import { GLOSSARY, QUICK_START, SITE_DOCUMENTS, sidebarOf } from './repository';

// Core's chapters in the order core's placement chapter names them, until the Constitution lists it as data.
const CORE_ORDER = [
  'placement',
  'code',
  'names',
  'functions',
  'relations',
  'types',
  'errors',
  'effects',
  'security',
  'dependencies',
  'tools',
  'changes',
  'layout',
  'comments',
  'tests',
  'agents',
  'architecture',
  'workflow',
];

interface SidebarFolder {
  icon?: string;
  pages: string[];
  title: string;
}

type GuidePageData =
  ReturnType<typeof guide.toFumadocsSource> extends Source<infer TConfig>
    ? TConfig['pageData']
    : never;

/** the guides, and the folders of the sidebar the site adds to them */
type GuideSource = Source<{
  metaData: MetaData;
  pageData: GuidePageData;
}>;

const lazily = <TValue>(make: () => TValue): (() => TValue) => {
  let made:
    | {
        kept: TValue;
      }
    | undefined;

  return (): TValue => {
    made ??= {
      kept: make(),
    };

    return made.kept;
  };
};

const metaFile = (
  path: string,
  folder: SidebarFolder,
): {
  data: SidebarFolder;
  path: string;
  type: 'meta';
} => ({
  data: folder,
  path,
  type: 'meta',
});

/** the loader of every page the site renders, built when first asked, since building it reads the repository */
const contentSource = lazily(() => {
  const sidebar = sidebarOf(docsRoute);
  const guideSource: GuideSource = {
    files: [
      ...guide.toFumadocsSource().files,
      metaFile('meta.json', {
        pages: sidebar.pages,
        title: 'Constitution',
      }),
      metaFile('core/meta.json', {
        icon: 'ScrollText',
        pages: CORE_ORDER,
        title: 'Core',
      }),
    ],
  };

  return loader(
    {
      blocks: renamed(blocks.toFumadocsSource(), cardAsIndex),
      documents: renamed(documents.toFumadocsSource(), (path) => `${SITE_DOCUMENTS[path]}.md`),
      glossary: renamed(glossary.toFumadocsSource(), () => `${GLOSSARY}.md`),
      guide: guideSource,
      overview: renamed(overview.toFumadocsSource(), () => 'index.md'),
      quickStart: renamed(quickStart.toFumadocsSource(), () => `${QUICK_START}.md`),
    },
    {
      baseUrl: docsRoute,
      plugins: [
        lucideIconsPlugin(),
        crossLinks,
      ],
    },
  );
});

type ContentPage = InferPageType<ReturnType<typeof contentSource>>;

/** the pages as Markdown for language models: an index, every page at once, one page */
const contentLlms = (): LLMsWithPages<ContentPage, string> =>
  llms(contentSource(), {
    renderPage: markdownOfPage,
  });

export { contentLlms, contentSource };
