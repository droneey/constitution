import type { BaseSlots } from '#/libs/ui';
import { SearchTrigger, Sidebar } from '#/libs/ui';

import { DocsSidebarFieldsWidget, DocsSidebarWidget } from '../../widgets';

const searchTrigger: BaseSlots['searchTrigger'] = {
  full: DocsSidebarFieldsWidget,
  sm: SearchTrigger,
};

// one sidebar at every width, so the library's drawer is left out
const sidebar = {
  drawer: (): undefined => undefined,
  main: DocsSidebarWidget,
  provider: Sidebar.Provider,
};

export { searchTrigger, sidebar };
