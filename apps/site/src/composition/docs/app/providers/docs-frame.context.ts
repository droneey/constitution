import { createContext } from 'react';

/** the document around the layout: how wide the screen is, and the sidebar's state its frame shows */
export interface DocsFrame {
  /** whether the open sidebar would push the page out of view */
  isNarrow: () => boolean;
  /** tells the frame around the page whether the sidebar is collapsed */
  markSidebar: (collapsed: boolean) => void;
}

/** the frame the root builds over the document, for the sidebar that keeps it */
export const DocsFrameContext = createContext<DocsFrame | undefined>(undefined);
