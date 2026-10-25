import type { InferPageType, LLMsWithPages, MetaData, Source } from 'fumadocs-core/source';
import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

import { DOCS_ROUTE } from '#/shared/constants';
import { blocks, documents, glossary, guide, overview, quickStart } from '#collections/server';

import { createSitePaths, crossLinks, markdownOfPage, passportAsIndex } from './pages.adapter';
import {
  blockFoldersOf,
  GLOSSARY,
  metaFile,
  QUICK_START,
  SITE_DOCUMENTS,
  sidebarOf,
} from './repository';

type GuidePageData =
  ReturnType<typeof guide.toFumadocsSource> extends Source<infer TConfig>
    ? TConfig['pageData']
    : never;

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

/** built when first asked, since building it reads the repository */
const siteContent = lazily(() => {
  const { collectionPathOf, servedUnderSitePaths } = createSitePaths();
  const sidebar = sidebarOf(DOCS_ROUTE);
  const guideSource: GuideSource = {
    files: [
      ...guide.toFumadocsSource().files,
      metaFile('meta.json', {
        pages: sidebar.pages,
        title: 'Constitution',
      }),
      ...blockFoldersOf(),
    ],
  };

  const source = loader(
    {
      blocks: servedUnderSitePaths(blocks.toFumadocsSource(), passportAsIndex),
      documents: servedUnderSitePaths(
        documents.toFumadocsSource(),
        (path) => `${SITE_DOCUMENTS[path]}.md`,
      ),
      glossary: servedUnderSitePaths(glossary.toFumadocsSource(), () => `${GLOSSARY}.md`),
      guide: guideSource,
      overview: servedUnderSitePaths(overview.toFumadocsSource(), () => 'index.md'),
      quickStart: servedUnderSitePaths(quickStart.toFumadocsSource(), () => `${QUICK_START}.md`),
    },
    {
      baseUrl: DOCS_ROUTE,
      plugins: [
        lucideIconsPlugin(),
        crossLinks,
      ],
    },
  );

  return {
    collectionPathOf,
    source,
  };
});

const contentSource = (): ReturnType<typeof siteContent>['source'] => siteContent().source;

const collectionPathOf = (path: string): string => siteContent().collectionPathOf(path);

type ContentPage = InferPageType<ReturnType<typeof contentSource>>;

const contentLlms = (): LLMsWithPages<ContentPage, string> =>
  llms(contentSource(), {
    renderPage: markdownOfPage,
  });

export { collectionPathOf, contentLlms, contentSource };
