import type { Code, InlineCode, Root } from 'mdast';
import { visit } from 'unist-util-visit';

interface ReleaseOptions {
  /** the release the site is built from */
  version: string;
}

const PLACEHOLDER = '<version>';

/** the code of a page names the release the reader is on where the repository's Markdown leaves a placeholder */
const remarkRelease =
  ({ version }: ReleaseOptions): ((tree: Root) => void) =>
  (tree): void => {
    const named = (node: Code | InlineCode): void => {
      node.value = node.value.replaceAll(PLACEHOLDER, version);
    };

    visit(tree, 'code', named);
    visit(tree, 'inlineCode', named);
  };

export type { ReleaseOptions };
export { remarkRelease };
