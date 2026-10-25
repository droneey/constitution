/** below this width the open sidebar pushes the page out of view */
const NARROW_SCREEN_QUERY = '(width < 48rem)';

enum SidebarMark {
  Collapsed = 'collapsed',
  Open = 'open',
}

export { NARROW_SCREEN_QUERY, SidebarMark };
