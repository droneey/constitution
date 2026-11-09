import { basename, dirname } from 'node:path';

import type { MetaFile, SidebarFolder, SiteLayout } from '#/shared/types';

import { BlockLayer } from '../../../domain/block/entities';
import { Page } from '../../../domain/page/entities';
import { PATH_SEPARATOR } from '../../../domain/shared/constants';
import {
  axisFoldersOf,
  childBlocksOf,
  coreChaptersOf,
  layerBlocksOf,
  seamHoldersOf,
} from './blocks.adapter';
import { SEAMS_FOLDER } from './blocks.constants';
import { LAYER_FOLDERS, layerGroupFolders } from './folders.constants';
import { sidebarOf } from './navigation.adapter';
import {
  blockLayers,
  GLOSSARY,
  QUICK_START,
  siteDocuments,
  siteLayers,
} from './repository.constants';

const metaFile = (path: string, sidebarFolder: SidebarFolder): MetaFile => ({
  data: sidebarFolder,
  path,
  type: 'meta',
});

const titleOfAxis = (axis: string): string => `${axis.charAt(0).toUpperCase()}${axis.slice(1)}`;

const listedIn = (
  sidebarFoldersByPath: Map<string, SidebarFolder>,
  folderPath: string,
  page: string,
): void => {
  sidebarFoldersByPath.set(folderPath, {
    pages: [
      ...(sidebarFoldersByPath.get(folderPath)?.pages ?? []),
      page,
    ],
  });
};

// Why: in an axis folder, the library's `...` lists its other pages, so its seams come after all
// else.
const blockSubfolders = (): readonly MetaFile[] => {
  const sidebarFoldersByPath = new Map<string, SidebarFolder>();

  for (const axisFolder of Object.values(BlockLayer).flatMap(axisFoldersOf).map(Page.sitePathOf)) {
    listedIn(sidebarFoldersByPath, dirname(axisFolder), basename(axisFolder));
    sidebarFoldersByPath.set(axisFolder, {
      title: titleOfAxis(basename(axisFolder)),
    });
  }

  for (const childBlock of Object.values(BlockLayer).flatMap(childBlocksOf)) {
    listedIn(sidebarFoldersByPath, dirname(childBlock), basename(childBlock));
  }

  for (const axisFolder of Object.values(BlockLayer).flatMap(seamHoldersOf).map(Page.sitePathOf)) {
    sidebarFoldersByPath.set(axisFolder, {
      ...sidebarFoldersByPath.get(axisFolder),
      pages: [
        '...',
        SEAMS_FOLDER,
      ],
    });
  }

  return [
    ...sidebarFoldersByPath,
  ].map(([folderPath, sidebarFolder]) => metaFile(`${folderPath}/meta.json`, sidebarFolder));
};

/**
 * @throws {SourceError} when the chapters core's passport lists and those on disk differ, or a
 * passport's front matter names no base it can read
 */
const blockFoldersOf = (): readonly MetaFile[] => {
  const chapters = coreChaptersOf().map(Page.sitePathOf);
  const axes = [
    ...new Set(chapters.map((chapter) => chapter.slice(0, chapter.indexOf(PATH_SEPARATOR)))),
  ];

  return [
    ...siteLayers
      .filter((siteLayer) => !blockLayers.includes(siteLayer))
      .map((siteLayer) =>
        metaFile(`${siteLayer}/meta.json`, {
          ...layerGroupFolders[siteLayer],
          pages: blockLayers
            .filter((layer) => layer.startsWith(`${siteLayer}/`))
            .map((layer) => layer.slice(siteLayer.length + 1)),
        }),
      ),
    ...Object.values(BlockLayer).map((layer) =>
      metaFile(`${layer}/meta.json`, {
        ...LAYER_FOLDERS[layer],
        pages:
          layer === BlockLayer.Core
            ? axes
            : [
                ...layerBlocksOf(layer),
              ],
      }),
    ),
    ...blockSubfolders(),
    ...axes.map((axis) =>
      metaFile(`${BlockLayer.Core}/${axis}/meta.json`, {
        title: titleOfAxis(axis),
        pages: chapters
          .filter((chapter) => chapter.startsWith(`${axis}${PATH_SEPARATOR}`))
          .map((chapter) => chapter.slice(axis.length + PATH_SEPARATOR.length)),
      }),
    ),
  ];
};

/**
 * @throws {SourceError} when the README has no Documentation section, the chapters core's
 * passport lists and those on disk differ, or a passport's front matter names no base it can read
 */
const siteLayoutOf = (baseUrl: string): SiteLayout => ({
  documents: siteDocuments,
  folders: [
    metaFile('meta.json', {
      pages: sidebarOf(baseUrl).pages,
      title: 'Constitution',
    }),
    ...blockFoldersOf(),
  ],
  glossary: GLOSSARY,
  quickStart: QUICK_START,
});

export { blockFoldersOf, metaFile, siteLayoutOf };
