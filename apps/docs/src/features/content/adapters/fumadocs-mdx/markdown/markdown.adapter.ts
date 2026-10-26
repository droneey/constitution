import type { Heading, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as mdastTextOf } from 'mdast-util-to-string';

import { takeTermIds } from './term-ids.adapter';

/** the words of Markdown, without the ids of its terms */
const plainTextOf = (markdown: string): string => {
  const tree = fromMarkdown(markdown);

  takeTermIds(tree);

  return mdastTextOf(tree);
};

/** without the HTML a heading holds, such as the README's marks */
const headingTextOf = (heading: Heading): string =>
  mdastTextOf(heading, {
    includeHtml: false,
  }).trim();

const isHeading = (node: RootContent, depth: number): node is Heading =>
  // Stryker disable next-line ConditionalExpression: only a heading has a depth, so checking its type only narrows it
  node.type === 'heading' && node.depth === depth;

export { headingTextOf, isHeading, plainTextOf };
