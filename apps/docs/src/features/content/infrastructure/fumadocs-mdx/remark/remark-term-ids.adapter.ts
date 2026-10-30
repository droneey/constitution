import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';
import type { Root } from 'mdast';

import { idMarkOf, takeTermIds } from '../markdown';

type SourceFile = Parameters<typeof replaceSource>[0];

const remarkTermIds =
  () =>
  (tree: Root, file: SourceFile): void => {
    for (const { id, strong, text } of takeTermIds(tree)) {
      // Why: no step before this one gives a bold data of its own.
      strong.data = {
        hProperties: {
          id,
        },
      };
      // Why: the page's Markdown, for language models and the search, is cut from its source.
      replaceSource(file, text, (source) => source.stringify(text).slice(idMarkOf(id).length));
    }
  };

export { remarkTermIds };
