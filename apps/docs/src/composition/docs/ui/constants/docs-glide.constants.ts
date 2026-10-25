import type { GlideLists } from '@droneey/design-browser/react-dom';

/** the sidebar is left out, since its block is the library's own */
export const GLIDE_LISTS: GlideLists = {
  "nav[aria-label='Versions']": {
    rows: 'a',
    filled: "[aria-current='page']",
  },
  '[data-toc-list]': {
    rows: 'a',
  },
  '#fd-search-list': {
    rows: "[role='option']",
    marked: 'aria-selected',
  },
  "[role='menu']": {
    rows: ":is([role='menuitem'], [role='menuitemradio']):not([role='group'] *)",
    marked: 'data-highlighted',
  },
  "[role='group']:has(> [role='menuitemradio'])": {
    rows: "[role='menuitemradio']",
    marked: 'data-highlighted',
    filled: "[aria-checked='true']",
  },
} as const;
