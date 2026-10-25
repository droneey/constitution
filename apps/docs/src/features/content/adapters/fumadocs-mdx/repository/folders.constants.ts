import type { SidebarFolder } from './folders.types';

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
} as const;

const AXIS_SEPARATOR = '/';

export { AXIS_SEPARATOR, LAYER_FOLDERS };
