import type { Code, InlineCode, Root } from 'mdast';
import { visit } from 'unist-util-visit';

import { VERSION_PLACEHOLDER } from './remark-release.constants';

interface ReleaseOptions {
  version: string;
}

const remarkRelease =
  ({ version }: ReleaseOptions): ((tree: Root) => void) =>
  (tree): void => {
    const named = (node: Code | InlineCode): void => {
      node.value = node.value.replaceAll(VERSION_PLACEHOLDER, version);
    };

    visit(tree, 'code', named);
    visit(tree, 'inlineCode', named);
  };

export type { ReleaseOptions };
export { remarkRelease };
