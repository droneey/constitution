import { createFromSource } from 'fumadocs-core/search/server';
import type { LLMsWithPages, MetaData, PageData, Source } from 'fumadocs-core/source';
import { llms, loader } from 'fumadocs-core/source';
import type { SerializedPageTree } from 'fumadocs-core/source/client';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

import { DOCS_ROUTE } from '#/shared/constants';

import type { PagesQueryRepository, SearchIndex } from '../../domain/contracts';
import type { Page, PageCatalog, PageSlugs } from '../../domain/entities';
import { catalogKeyOf } from '../../domain/entities';
import {
  createSitePaths,
  crossLinks,
  linksUnder,
  markdownOfPage,
  passportAsIndex,
  textOfName,
} from './pages.adapter';

/** what the site reads of a compiled page: its heading, its text for language models and its search's data */
interface SitePageData extends PageData {
  readonly description: string;
  readonly getText: (kind: 'processed') => Promise<string>;
  readonly title: string;
}

type SiteSource = Source<{
  metaData: MetaData;
  pageData: SitePageData;
}>;

/** a collection fumadocs-mdx compiled */
interface SiteCollection {
  readonly toFumadocsSource: () => SiteSource;
}

/** the collections `source.config.ts` declares, by their names */
interface SiteCollections {
  readonly blocks: SiteCollection;
  readonly documents: SiteCollection;
  readonly glossary: SiteCollection;
  readonly guide: SiteCollection;
  readonly overview: SiteCollection;
  readonly quickStart: SiteCollection;
}

/** a `meta.json` the site adds to the guide's folders, which the repository has no file for */
interface SiteMetaFile {
  readonly data: MetaData;
  readonly path: string;
  readonly type: 'meta';
}

/** what the site serves beside the guide's own files, as the repository lays it out */
interface SiteLayout {
  /** the site's name of each document of the repository's root, by its file */
  readonly documents: Readonly<Record<string, string>>;
  /** the guide's sidebar and every folder of blocks */
  readonly folders: readonly SiteMetaFile[];
  readonly glossary: string;
  readonly quickStart: string;
}

interface FumadocsContentInput {
  readonly collections: SiteCollections;
  readonly layout: SiteLayout;
  /** the path the site is served under, ending in a slash; the host's root when left out */
  readonly siteBase?: string;
}

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

/**
 * The pages of the collections fumadocs-mdx compiled, served under the site's base, and the index
 * its search exports; the loader is built when first read, since building it reads the repository.
 */
const createFumadocsContent = ({
  collections: { blocks, documents, glossary, guide, overview, quickStart },
  layout,
  siteBase = '/',
}: FumadocsContentInput): PagesQueryRepository<SerializedPageTree> & SearchIndex => {
  const content = lazily(() => {
    const { collectionPathOf, servedUnderSitePaths } = createSitePaths();
    const guideSource: SiteSource = {
      files: [
        ...guide.toFumadocsSource().files,
        ...layout.folders,
      ],
    };

    const sources = {
      blocks: servedUnderSitePaths(blocks.toFumadocsSource(), passportAsIndex),
      documents: servedUnderSitePaths(
        documents.toFumadocsSource(),
        (path) => `${layout.documents[path]}.md`,
      ),
      glossary: servedUnderSitePaths(glossary.toFumadocsSource(), () => `${layout.glossary}.md`),
      guide: guideSource,
      overview: servedUnderSitePaths(overview.toFumadocsSource(), () => 'index.md'),
      quickStart: servedUnderSitePaths(
        quickStart.toFumadocsSource(),
        () => `${layout.quickStart}.md`,
      ),
    };
    const plugins = [
      lucideIconsPlugin(),
      crossLinks,
    ];
    const source = loader(sources, {
      baseUrl: DOCS_ROUTE,
      plugins,
    });
    // the router puts the site's base before every address it links, but a text for language models
    // is read as it is, so its addresses carry the base themselves
    const textSource = loader(sources, {
      // Stryker disable next-line MethodExpression: the loader joins a doubled slash, so the addresses are the same
      baseUrl: `${siteBase}${DOCS_ROUTE.slice(1)}`,
      plugins: [
        ...plugins,
        linksUnder(siteBase),
      ],
    });

    return {
      collectionPathOf,
      llms: lazily(() =>
        llms(textSource, {
          renderName: ({ name }) => textOfName(name),
          renderPage: markdownOfPage,
        }),
      ),
      source,
      textSource,
    };
  });

  type ContentPage = NonNullable<ReturnType<ReturnType<typeof content>['source']['getPage']>>;

  const pageAt = (slugs: PageSlugs): ContentPage | undefined =>
    content().source.getPage([
      ...slugs,
    ]);

  const llmsOf = (): LLMsWithPages<ContentPage, string> => content().llms();

  const pageOf = (page: ContentPage): Page => ({
    collection: page.type,
    description: page.data.description,
    path: content().collectionPathOf(page.path),
    title: page.data.title,
  });

  return {
    export: () =>
      // in English, the search's own language
      createFromSource(content().source).export(),
    find: (slugs): Promise<Page | undefined> => {
      const page = pageAt(slugs);

      return Promise.resolve(page === undefined ? undefined : pageOf(page));
    },
    findMarkdown: async (slugs): Promise<string | undefined> => {
      const page = content().textSource.getPage([
        ...slugs,
      ]);

      return page === undefined ? undefined : await llmsOf().page(page);
    },
    readCatalog: (): Promise<PageCatalog> =>
      Promise.resolve(
        Object.fromEntries(
          content()
            .source.getPages()
            .map((page) => [
              catalogKeyOf(page.slugs),
              pageOf(page),
            ]),
        ),
      ),
    readFullText: () => llmsOf().full(),
    readIndex: () => Promise.resolve(llmsOf().index()),
    readNavigation: () => content().source.serializePageTree(content().source.getPageTree()),
  };
};

export type { SiteCollections, SiteLayout };
export { createFumadocsContent };
