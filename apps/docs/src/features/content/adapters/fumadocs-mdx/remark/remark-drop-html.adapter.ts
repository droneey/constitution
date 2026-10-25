import type { Heading, Parent, Root } from 'mdast';
import { visit } from 'unist-util-visit';

const dropHtmlOf = (parent: Parent): void => {
  parent.children = parent.children.filter((child) => child.type !== 'html');

  for (const child of parent.children) {
    if ('children' in child) {
      dropHtmlOf(child);
    }
  }
};

const trimSpaceLeftByHtml = (heading: Heading): void => {
  const first = heading.children.at(0);
  const last = heading.children.at(-1);

  if (first?.type === 'text') {
    first.value = first.value.trimStart();
  }

  if (last?.type === 'text') {
    last.value = last.value.trimEnd();
  }
};

/**
 * A page of the README drops its raw HTML — the banner, the badges, the marks of its headings —
 * since the site draws its own.
 */
const remarkDropHtml =
  () =>
  (tree: Root): void => {
    dropHtmlOf(tree);
    visit(tree, 'heading', trimSpaceLeftByHtml);
  };

export { remarkDropHtml };
