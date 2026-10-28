import type { PhrasingContent, Root, Table, TableCell, TableRow } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';

import type { Term } from '../../../domain/entities';
import { TermKind } from '../../../domain/entities';
import { replaceFencedBlocks, takeTermIds, textNode } from '../markdown';
import { TERMS_HEADER, TERMS_LANGUAGE } from './remark-terms.constants';

interface TermsOptions {
  terms: readonly Term[];
}

const cellOf = (children: PhrasingContent[]): TableCell => ({
  children,
  // Stryker disable next-line StringLiteral: mdast-util-to-hast renders each cell of a row as one whatever its type, so the page is the same
  type: 'tableCell',
});

const rowOf = (cells: TableCell[]): TableRow => ({
  children: cells,
  type: 'tableRow',
});

const definitionOf = (sentence: string): PhrasingContent[] => {
  const tree = fromMarkdown(sentence);
  const [paragraph] = tree.children;

  // Why: a term's id is the anchor of its own page, so the sentence drops it.
  takeTermIds(tree);

  const phrasing =
    paragraph?.type === 'paragraph'
      ? paragraph.children
      : [
          textNode(sentence),
        ];

  // Why: a link of the sentence leads from its block's file, not from this page, so it keeps only
  // its words.
  return phrasing.flatMap((child) =>
    child.type === 'link'
      ? child.children
      : [
          child,
        ],
  );
};

const nameOf = (term: Term): PhrasingContent =>
  term.kind === TermKind.Concept || term.kind === TermKind.Brand
    ? textNode(term.name)
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
      textNode(term.kind),
    ]),
    cellOf([
      textNode(term.blockId),
    ]),
    cellOf([
      textNode(term.axis),
    ]),
    cellOf(definitionOf(term.sentence)),
  ]);

const tableOf = (terms: readonly Term[]): Table => ({
  children: [
    rowOf(
      TERMS_HEADER.map((title) =>
        cellOf([
          textNode(title),
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
    replaceFencedBlocks(tree, TERMS_LANGUAGE, () => tableOf(options.terms));
  };

export { remarkTerms };
