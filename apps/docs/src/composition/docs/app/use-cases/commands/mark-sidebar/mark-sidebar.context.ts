import { createContext } from 'react';

import type { MarkSidebar } from '../../../../domain/use-cases/commands/mark-sidebar';

export const MarkSidebarContext = createContext<MarkSidebar | undefined>(undefined);
