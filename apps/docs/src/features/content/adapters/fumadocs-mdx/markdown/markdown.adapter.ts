import type { Heading, RootContent, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as mdastTextOf } from 'mdast-util-to-string';

import { SUBSECTION_HEADING_DEPTH, TITLE_HEADING_DEPTH } from './markdown.constants';
import { takeTermIds } from './term-ids.adapter';

const headingTextOf = (heading: Heading): string =>
  mdastTextOf(heading, {
    includeHtml: false,
  }).trim();

const isHeading = (node: RootContent, depth: number): node is Heading =>
  // Stryker disable next-line ConditionalExpression: only a heading has a depth, so checking its type only narrows it
  node.type === 'heading' && node.depth === depth;

const isSectionHeading = (node: RootContent): node is Heading =>
  // Stryker disable next-line ConditionalExpression: only a heading has a depth, so checking its type only narrows it
  node.type === 'heading' && node.depth <= SUBSECTION_HEADING_DEPTH;

const titleOf = (markdown: string): string | undefined => {
  const title = fromMarkdown(markdown).children.find((node) =>
    isHeading(node, TITLE_HEADING_DEPTH),
  );

  return title === undefined ? undefined : headingTextOf(title);
};

const summaryOf = (markdown: string): string | undefined => {
  const tree = fromMarkdown(markdown);
  const [summary] = tree.children.flatMap((node) =>
    node.type === 'blockquote' ? node.children : [],
  );

  if (summary === undefined) {
    return undefined;
  }

  takeTermIds(summary);

  const [firstLine] = mdastTextOf(summary).split('\n', 1);

  return firstLine;
};

const textNode = (words: string): Text => ({
  // Stryker disable next-line StringLiteral: mdast-util-to-hast renders a node that holds a value as text whatever its type, so the page is the same
  type: 'text',
  value: words,
});

export { headingTextOf, isHeading, isSectionHeading, summaryOf, textNode, titleOf };
