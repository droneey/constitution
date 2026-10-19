import { createContext } from 'react';

export interface DocsFrame {
  isNarrow: () => boolean;
  markSidebar: (collapsed: boolean) => void;
}

export const DocsFrameContext = createContext<DocsFrame | undefined>(undefined);
