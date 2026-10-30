import type { SidebarFolder } from '#/shared/types';

import { BlockLayer } from '../../../domain/block/entities';

type FolderHeading = Pick<SidebarFolder, 'icon' | 'title'>;

const LAYER_FOLDERS = {
  [BlockLayer.Core]: {
    icon: 'ScrollText',
    title: 'Core',
  },
  [BlockLayer.Domain]: {
    icon: 'Shapes',
    title: 'Domains',
  },
  [BlockLayer.Implementation]: {
    icon: 'Wrench',
    title: 'Implementations',
  },
  [BlockLayer.Language]: {
    icon: 'Code',
    title: 'Languages',
  },
  [BlockLayer.Platform]: {
    icon: 'MonitorSmartphone',
    title: 'Platforms',
  },
} as const satisfies Readonly<Record<BlockLayer, FolderHeading>>;

const layerGroupFolders: Readonly<Record<string, FolderHeading>> = {
  contexts: {
    icon: 'Boxes',
    title: 'Contexts',
  },
};

export { LAYER_FOLDERS, layerGroupFolders };
