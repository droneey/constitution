// Stryker disable all: it loads the collections fumadocs-mdx generates at build time, which no spec can load; the site's build proves it

import type { InferPageType, LLMsWithPages, MetaData, Source } from 'fumadocs-core/source';
import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

import { DOCS_ROUTE } from '#/shared/constants';
import { blocks, documents, glossary, guide, overview, quickStart } from '#collections/server';

import { crossLinks, markdownOfPage, passportAsIndex, servedUnderSitePaths } from './pages.adapter';
import {
  axisFoldersOf,
  BLOCK_LAYERS,
  coreChaptersOf,
  GLOSSARY,
  layerBlocksOf,
  QUICK_START,
  SEAMS_FOLDER,
  SITE_DOCUMENTS,
  seamHoldersOf,
  sidebarOf,
  siteLayers,
} from './repository';
import { AXIS_SEPARATOR, LAYER_FOLDERS } from './source.constants';
import type { SidebarFolder } from './source.types';

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

/** an axis folder has no page of its own to give it a title */
const titleOfAxis = (axis: string): string => `${axis.charAt(0).toUpperCase()}${axis.slice(1)}`;

/** In an axis folder, the library's `...` lists its other pages, so its seams come after all else. */
const blockSubfolders = (): ReturnType<typeof metaFile>[] => {
  const folders = new Map<string, SidebarFolder>();
  const layers = BLOCK_LAYERS.filter((layer) => layer !== 'core');

  for (const folder of layers.flatMap(axisFoldersOf)) {
    const block = folder.slice(0, folder.lastIndexOf('/'));
    const axis = folder.slice(block.length + 1);

    folders.set(block, {
      pages: [
        ...(folders.get(block)?.pages ?? []),
        axis,
      ],
    });
    folders.set(folder, {
      title: titleOfAxis(axis),
    });
  }

  for (const folder of layers.flatMap(seamHoldersOf)) {
    folders.set(folder, {
      ...folders.get(folder),
      pages: [
        '...',
        SEAMS_FOLDER,
      ],
    });
  }

  return [
    ...folders,
  ].map(([folder, meta]) => metaFile(`${folder}/meta.json`, meta));
};

const blockFolders = (): ReturnType<typeof metaFile>[] => {
  const chapters = coreChaptersOf();
  const axes = [
    ...new Set(chapters.map((chapter) => chapter.slice(0, chapter.indexOf(AXIS_SEPARATOR)))),
  ];

  return [
    ...siteLayers
      .filter((folder) => !BLOCK_LAYERS.includes(folder))
      .map((folder) =>
        metaFile(`${folder}/meta.json`, {
          ...LAYER_FOLDERS[folder],
          pages: BLOCK_LAYERS.filter((layer) => layer.startsWith(`${folder}/`)).map((layer) =>
            layer.slice(folder.length + 1),
          ),
        }),
      ),
    ...BLOCK_LAYERS.map((layer) =>
      metaFile(`${layer}/meta.json`, {
        ...LAYER_FOLDERS[layer],
        pages:
          layer === 'core'
            ? axes
            : [
                ...layerBlocksOf(layer),
              ],
      }),
    ),
    ...blockSubfolders(),
    ...axes.map((axis) =>
      metaFile(`core/${axis}/meta.json`, {
        title: titleOfAxis(axis),
        pages: chapters
          .filter((chapter) => chapter.startsWith(`${axis}${AXIS_SEPARATOR}`))
          .map((chapter) => chapter.slice(axis.length + AXIS_SEPARATOR.length)),
      }),
    ),
  ];
};

/** built when first asked, since building it reads the repository */
const contentSource = lazily(() => {
  const sidebar = sidebarOf(DOCS_ROUTE);
  const guideSource: GuideSource = {
    files: [
      ...guide.toFumadocsSource().files,
      metaFile('meta.json', {
        pages: sidebar.pages,
        title: 'Constitution',
      }),
      ...blockFolders(),
    ],
  };

  return loader(
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
});

type ContentPage = InferPageType<ReturnType<typeof contentSource>>;

const contentLlms = (): LLMsWithPages<ContentPage, string> =>
  llms(contentSource(), {
    renderPage: markdownOfPage,
  });

export { contentLlms, contentSource };
