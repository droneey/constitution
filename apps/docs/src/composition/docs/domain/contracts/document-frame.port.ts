/** the document the pages render in, whose frame the sidebar and the screen's width shape */
export interface DocumentFrame {
  /** below this width the open sidebar pushes the page out of view */
  readonly isNarrow: () => boolean;
  readonly markSidebarCollapsed: () => void;
  readonly markSidebarOpen: () => void;
}
