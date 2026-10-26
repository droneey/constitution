import type { PhrasingContent, Root, Table, TableCell, TableRow, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';

import type { Term } from '../../../domain/entities';
import { TermKind } from '../../../domain/entities';
import { takeTermIds } from '../markdown';
import { TERMS_HEADER, TERMS_LANGUAGE } from './remark-terms.constants';

interface TermsOptions {
  terms: readonly Term[];
}

const text = (words: string): Text => ({
  type: 'text',
  value: words,
});

const cellOf = (children: PhrasingContent[]): TableCell => ({
  children,
  type: 'tableCell',
});

const rowOf = (cells: TableCell[]): TableRow => ({
  children: cells,
  type: 'tableRow',
});

// A link of the sentence leads from its block's file, not from this page, so it keeps only its words;
// a term's id is the anchor of its own page, so the sentence drops it.
const definitionOf = (sentence: string): PhrasingContent[] => {
  const tree = fromMarkdown(sentence);
  const [paragraph] = tree.children;

  takeTermIds(tree);

  return (
    paragraph?.type === 'paragraph'
      ? paragraph.children
      : [
          text(sentence),
        ]
  ).flatMap((child) =>
    child.type === 'link'
      ? child.children
      : [
          child,
        ],
  );
};

const nameOf = (term: Term): PhrasingContent =>
  term.kind === TermKind.Concept || term.kind === TermKind.Brand
    ? text(term.name)
    : {
        type: 'inlineCode',
        value: term.name,
      };

const termRowOf = (term: Term): TableRow =>
  rowOf([
    cellOf([
      {
        children: [
          nameOf(term),
        ],
        type: 'link',
        url: term.address,
      },
    ]),
    cellOf([
      text(term.kind),
    ]),
    cellOf([
      text(term.block),
    ]),
    cellOf([
      text(term.axis),
    ]),
    cellOf(definitionOf(term.sentence)),
  ]);

const tableOf = (terms: readonly Term[]): Table => ({
  align: TERMS_HEADER.map(() => null),
  children: [
    rowOf(
      TERMS_HEADER.map((title) =>
        cellOf([
          text(title),
        ]),
      ),
    ),
    ...terms.map(termRowOf),
  ],
  type: 'table',
});

const remarkTerms =
  (options: TermsOptions) =>
  (tree: Root): void => {
    // Stryker disable next-line StringLiteral: only code has a language, so visiting every node finds the same ones
    visit(tree, 'code', (node, index, parent) => {
      if (
        node.lang !== TERMS_LANGUAGE ||
        // Stryker disable next-line ConditionalExpression: a code node always has a parent, so the check only narrows its type
        parent === undefined ||
        // Stryker disable next-line ConditionalExpression: a code node always has an index, so the check only narrows its type
        index === undefined
      ) {
        return;
      }

      parent.children.splice(index, 1, tableOf(options.terms));
    });
  };

export { remarkTerms };
