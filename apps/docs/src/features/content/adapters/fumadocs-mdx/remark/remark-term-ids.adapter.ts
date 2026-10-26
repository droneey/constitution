import { replaceSource } from 'fumadocs-core/mdx-plugins/stringifier';
import type { Root } from 'mdast';

import { idMarkOf, takeTermIds } from '../markdown';

type SourceFile = Parameters<typeof replaceSource>[0];

/**
 * A block's page shows no id after a term: the id becomes the bold's anchor, which the glossary
 * links to. No step before this one gives a bold data of its own.
 */
const remarkTermIds =
  () =>
  (tree: Root, file: SourceFile): void => {
    for (const { id, strong, text } of takeTermIds(tree)) {
      strong.data = {
        hProperties: {
          id,
        },
      };
      // the page's Markdown, for language models and the search, is cut from its source
      replaceSource(file, text, (source) => source.stringify(text).slice(idMarkOf(id).length));
    }
  };

export { remarkTermIds };
