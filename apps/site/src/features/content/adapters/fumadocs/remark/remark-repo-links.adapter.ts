import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

import { addressOf, repositoryPathOf } from '../repository';

/**
 * The Markdown links from file to file, written for GitHub, lead to the site's pages, and to GitHub
 * for a file the site does not render.
 */
const remarkRepoLinks =
  ({ baseUrl }: { baseUrl: string }) =>
  (tree: Root, file: VFile): void => {
    visit(tree, 'link', (link) => {
      const target = file.path === undefined ? undefined : repositoryPathOf(file.path, link.url);

      if (target !== undefined) {
        link.url = addressOf(baseUrl, target.path, target.hash);
      }
    });
  };

export { remarkRepoLinks };
