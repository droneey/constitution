/** below this width the open sidebar pushes the page out of view */
const NARROW = '(width < 48rem)';

/** the browser's document as the frame around the layout; the frame's styles read `data-sidebar` */
export const documentFrame = {
  isNarrow: (): boolean => globalThis.matchMedia(NARROW).matches,
  markSidebar: (collapsed: boolean): void => {
    document.documentElement.dataset.sidebar = collapsed ? 'collapsed' : 'open';
  },
};
