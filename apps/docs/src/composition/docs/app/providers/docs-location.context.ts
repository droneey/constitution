import { createContext } from 'react';

interface DocsLocation {
  href: string;
}

/** for the pieces the layout renders on its own, which take no props from the screen */
export const DocsLocationContext = createContext<DocsLocation>({
  // Stryker disable next-line StringLiteral: outside a page any address links each release to its site's root, as the empty one does
  href: '/',
});
