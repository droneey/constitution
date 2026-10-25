import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

import { addressOf, repositoryPathOf } from '../repository';

interface RepoLinksOptions {
  readonly baseUrl: string;
}

const remarkRepoLinks =
  ({ baseUrl }: RepoLinksOptions) =>
  (tree: Root, file: VFile): void => {
    visit(tree, 'link', (link) => {
      const target = file.path === undefined ? undefined : repositoryPathOf(file.path, link.url);

      if (target !== undefined) {
        link.url = addressOf(baseUrl, target.path, target.hash);
      }
    });
  };

export { remarkRepoLinks };
