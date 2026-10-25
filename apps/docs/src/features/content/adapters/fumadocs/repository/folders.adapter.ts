import { axisFoldersOf, coreChaptersOf, layerBlocksOf, seamHoldersOf } from './blocks.adapter';
import { SEAMS_FOLDER } from './blocks.constants';
import { AXIS_SEPARATOR, LAYER_FOLDERS } from './folders.constants';
import type { MetaFile, SidebarFolder } from './folders.types';
import { BLOCK_LAYERS, siteLayers } from './repository.constants';

const metaFile = (path: string, folder: SidebarFolder): MetaFile => ({
  data: folder,
  path,
  type: 'meta',
});

/** an axis folder has no page of its own to give it a title */
const titleOfAxis = (axis: string): string => `${axis.charAt(0).toUpperCase()}${axis.slice(1)}`;

/** In an axis folder, the library's `...` lists its other pages, so its seams come after all else. */
const blockSubfolders = (): readonly MetaFile[] => {
  const folders = new Map<string, SidebarFolder>();

  for (const folder of BLOCK_LAYERS.flatMap(axisFoldersOf)) {
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

  for (const folder of BLOCK_LAYERS.flatMap(seamHoldersOf)) {
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

/** the `meta.json` of every folder of blocks the sidebar shows: its title, its icon and the order of its pages */
const blockFoldersOf = (): readonly MetaFile[] => {
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

export { blockFoldersOf, metaFile };
