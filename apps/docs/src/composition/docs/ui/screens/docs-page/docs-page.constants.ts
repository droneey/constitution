import type { BaseSlots } from '#/libs/ui';
import { SearchTrigger, Sidebar } from '#/libs/ui';

import { DocsSidebarFieldsWidget, DocsSidebarWidget } from '../../widgets';

const searchTrigger: BaseSlots['searchTrigger'] = {
  full: DocsSidebarFieldsWidget,
  sm: SearchTrigger,
};

const sidebar = {
  // Why: the page keeps one sidebar at every width, so it draws no drawer.
  drawer: (): undefined => undefined,
  main: DocsSidebarWidget,
  provider: Sidebar.Provider,
};

export { searchTrigger, sidebar };
