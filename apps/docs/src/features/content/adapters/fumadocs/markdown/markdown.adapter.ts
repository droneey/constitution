import type { Heading, RootContent } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as mdastTextOf } from 'mdast-util-to-string';

const plainTextOf = (markdown: string): string => mdastTextOf(fromMarkdown(markdown));

/** a heading's text as a reader sees it, without the HTML it holds, such as the README's marks */
const headingTextOf = (heading: Heading): string =>
  mdastTextOf(heading, {
    includeHtml: false,
  }).trim();

const isHeading = (node: RootContent, depth: number): node is Heading =>
  // Stryker disable next-line ConditionalExpression: only a heading has a depth, so checking its type only narrows it
  node.type === 'heading' && node.depth === depth;

export { headingTextOf, isHeading, plainTextOf };
