import type { MetaFile, SidebarFolder, SiteLayout } from '#/shared/types';

import { PATH_SEPARATOR } from '../../../domain/constants';
import { BlockLayer } from '../../../domain/entities';
import { axisFoldersOf, coreChaptersOf, layerBlocksOf, seamHoldersOf } from './blocks.adapter';
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

/** an axis folder has no page of its own to give it a title */
const titleOfAxis = (axis: string): string => `${axis.charAt(0).toUpperCase()}${axis.slice(1)}`;

/** In an axis folder, the library's `...` lists its other pages, so its seams come after all else. */
const blockSubfolders = (): readonly MetaFile[] => {
  const sidebarFoldersByPath = new Map<string, SidebarFolder>();

  for (const axisFolder of Object.values(BlockLayer).flatMap(axisFoldersOf)) {
    const blockFolder = axisFolder.slice(0, axisFolder.lastIndexOf('/'));
    const axis = axisFolder.slice(blockFolder.length + 1);

    sidebarFoldersByPath.set(blockFolder, {
      pages: [
        ...(sidebarFoldersByPath.get(blockFolder)?.pages ?? []),
        axis,
      ],
    });
    sidebarFoldersByPath.set(axisFolder, {
      title: titleOfAxis(axis),
    });
  }

  for (const axisFolder of Object.values(BlockLayer).flatMap(seamHoldersOf)) {
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

/** the `meta.json` of every folder of blocks the sidebar shows: its title, its icon and the order of its pages */
const blockFoldersOf = (): readonly MetaFile[] => {
  const chapters = coreChaptersOf();
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

/** what the site's loader serves beside the guide's own files: the README's sidebar as the guide's folder, and every folder of blocks */
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
