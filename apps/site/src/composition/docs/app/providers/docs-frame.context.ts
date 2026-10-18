import { createContext } from 'react';

/** the document around the layout */
export interface DocsFrame {
  /** whether the open sidebar would push the page out of view */
  isNarrow: () => boolean;
  markSidebar: (collapsed: boolean) => void;
}

/** the frame the root builds over the document, for the sidebar that keeps it */
export const DocsFrameContext = createContext<DocsFrame | undefined>(undefined);
