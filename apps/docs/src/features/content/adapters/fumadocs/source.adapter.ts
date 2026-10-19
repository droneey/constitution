// Stryker disable all: it loads the collections fumadocs-mdx generates at build time, which no spec can load; the site's build proves it

import type { InferPageType, LLMsWithPages, MetaData, Source } from 'fumadocs-core/source';
import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

import { docsRoute } from '#/shared/constants';
import { blocks, documents, glossary, guide, overview, quickStart } from '#collections/server';

import { crossLinks, mainFileAsIndex, markdownOfPage, renamed } from './pages.adapter';
import {
  axisFoldersOf,
  BLOCK_LAYERS,
  coreChaptersOf,
  GLOSSARY,
  layerBlocksOf,
  QUICK_START,
  SEAMS,
  SITE_DOCUMENTS,
  SITE_LAYERS,
  seamHoldersOf,
  sidebarOf,
} from './repository';

interface SidebarFolder {
  icon?: string;
  pages?: string[];
  title?: string;
}

/** the title and icon of each folder of blocks in the sidebar, by its folder in blocks/ */
const LAYER_FOLDERS: Readonly<Record<string, Pick<SidebarFolder, 'icon' | 'title'>>> = {
  contexts: {
    icon: 'Boxes',
    title: 'Contexts',
  },
  'contexts/languages': {
    icon: 'Code',
    title: 'Languages',
  },
  'contexts/platforms': {
    icon: 'MonitorSmartphone',
    title: 'Platforms',
  },
  core: {
    icon: 'ScrollText',
    title: 'Core',
  },
  domains: {
    icon: 'Shapes',
    title: 'Domains',
  },
  implementations: {
    icon: 'Wrench',
    title: 'Implementations',
  },
};

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

/** an axis folder's title in the sidebar, its name capitalised, since its main chapter, the folder's page, is titled as its block */
const titleOfAxis = (axis: string): string => `${axis.charAt(0).toUpperCase()}${axis.slice(1)}`;

/**
 * The folders inside the blocks: an axis folder is titled by its axis, since its main chapter, the
 * folder's page, is titled as its block, and a folder that holds seams lists them after all else.
 */
const blockSubfolders = (): ReturnType<typeof metaFile>[] => {
  const folders = new Map<string, SidebarFolder>();
  const layers = BLOCK_LAYERS.filter((layer) => layer !== 'core');

  for (const folder of layers.flatMap(axisFoldersOf)) {
    folders.set(folder, {
      title: titleOfAxis(folder.slice(folder.lastIndexOf('/') + 1)),
    });
  }
  for (const folder of layers.flatMap(seamHoldersOf)) {
    folders.set(folder, {
      ...folders.get(folder),
      pages: [
        '...',
        SEAMS,
      ],
    });
  }

  return [
    ...folders,
  ].map(([folder, meta]) => metaFile(`${folder}/meta.json`, meta));
};

/** what parts an axis from a chapter's name in core's list: `<axis>/<name>` */
const AXIS_SEPARATOR = '/';

/** the sidebar's folders of the blocks: each layer's blocks, an abstract one above those that extend it, a folder of layers by its layers, and core's chapters in the order placement lists them */
const blockFolders = (): ReturnType<typeof metaFile>[] => {
  const chapters = coreChaptersOf();
  const base = chapters.filter((chapter) => !chapter.includes(AXIS_SEPARATOR));
  const axes = [
    ...new Set(
      chapters
        .filter((chapter) => chapter.includes(AXIS_SEPARATOR))
        .map((chapter) => chapter.slice(0, chapter.indexOf(AXIS_SEPARATOR))),
    ),
  ];

  return [
    ...SITE_LAYERS.filter((folder) => !BLOCK_LAYERS.includes(folder)).map((folder) =>
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
            ? [
                ...base,
                ...axes,
              ]
            : [
                ...layerBlocksOf(layer),
              ],
      }),
    ),
    ...blockSubfolders(),
    ...axes.map((axis) =>
      metaFile(`core/${axis}/meta.json`, {
        pages: chapters
          .filter((chapter) => chapter.startsWith(`${axis}${AXIS_SEPARATOR}`))
          .map((chapter) => chapter.slice(axis.length + AXIS_SEPARATOR.length)),
      }),
    ),
  ];
};

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
      ...blockFolders(),
    ],
  };

  return loader(
    {
      blocks: renamed(blocks.toFumadocsSource(), mainFileAsIndex),
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
