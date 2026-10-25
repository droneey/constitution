import { createContext } from 'react';

export interface DocsFrame {
  isNarrow: () => boolean;
  markSidebarCollapsed: () => void;
  markSidebarOpen: () => void;
}

export const DocsFrameContext = createContext<DocsFrame | undefined>(undefined);
