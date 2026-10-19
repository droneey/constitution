import type { GlideList } from './glide.types';

/** the sidebar is left out, since its block is the library's own */
const GLIDE_LISTS: Readonly<Record<string, GlideList>> = {
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
};

export { GLIDE_LISTS };
