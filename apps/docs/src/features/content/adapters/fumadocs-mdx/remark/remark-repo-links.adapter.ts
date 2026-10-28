import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

import { AbsolutePath } from '../../../domain/value-objects';
import { addressOf, linkTargetOf } from '../repository';

interface RepoLinksOptions {
  readonly baseUrl: string;
}

/** @throws {InvalidValueError} when the file's path is relative */
const remarkRepoLinks =
  ({ baseUrl }: RepoLinksOptions) =>
  (tree: Root, file: VFile): void => {
    if (file.path === undefined) {
      return;
    }

    const filePath = AbsolutePath.create(file.path);

    visit(tree, 'link', (link) => {
      const target = linkTargetOf(filePath, link.url);

      if (target !== undefined) {
        link.url = addressOf(baseUrl, target.path, target.hash);
      }
    });
  };

export { remarkRepoLinks };
