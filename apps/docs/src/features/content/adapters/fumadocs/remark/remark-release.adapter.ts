import type { Code, InlineCode, Root } from 'mdast';
import { visit } from 'unist-util-visit';

interface ReleaseOptions {
  version: string;
}

const PLACEHOLDER = '<version>';

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
