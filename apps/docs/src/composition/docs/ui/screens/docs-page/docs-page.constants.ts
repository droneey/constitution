import type { BaseSlots } from '#/libs/ui';
import { SearchTrigger, Sidebar } from '#/libs/ui';

import { DocsSidebarFieldsWidget } from '../../widgets/docs-sidebar-fields-widget';
import { DocsSidebarWidget } from '../../widgets/docs-sidebar-widget';

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
