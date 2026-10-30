import { createContext } from 'react';

import type { MarkSidebar } from '../../../../application/use-cases/commands/mark-sidebar';

export const MarkSidebarContext = createContext<MarkSidebar | undefined>(undefined);
