import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Bold } from '@droneey/constitution';
import {
  Term as DefinedTerm,
  TermKind as DefinedTermKind,
  RuleHeading,
} from '@droneey/constitution';
import type { Heading, PhrasingContent, RootContent, Strong, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as mdastTextOf } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

import { MARKDOWN_EXTENSION, pageSlugsOf, Term, TermKind } from '../../../domain/entities';
import { headingTextOf, SUBSECTION_HEADING_DEPTH } from '../markdown';
import { FRONT_MATTER } from './blocks.constants';
import { inRepository } from './repository.adapter';
import { BLOCKS_FOLDER } from './repository.constants';

interface TermName {
  readonly kind: TermKind;
  readonly name: string;
}

const kinds: Readonly<Record<DefinedTermKind, TermKind>> = {
  [DefinedTermKind.Api]: TermKind.Api,
  [DefinedTermKind.Brand]: TermKind.Brand,
  [DefinedTermKind.Concept]: TermKind.Concept,
  [DefinedTermKind.File]: TermKind.File,
  [DefinedTermKind.Folder]: TermKind.Folder,
  [DefinedTermKind.Suffix]: TermKind.Suffix,
};

const WHITESPACE = /\s+/g;

/** the term as the Constitution's grammar reads it, its plain words on one line as its check reads them */
const nameOf = (bold: Bold): TermName => {
  const { kind, term } = DefinedTerm.of(
    bold.isCode
      ? bold
      : {
          isCode: false,
          text: bold.text.replaceAll(WHITESPACE, ' '),
        },
  );

  return {
    kind: kinds[kind],
    name: term,
  };
};

const isText = (node: PhrasingContent): node is Text => node.type === 'text';

/** undefined for bold that is neither one code span nor plain words, which the check refuses */
const boldOf = (strong: Strong): Bold | undefined => {
  const [first] = strong.children;

  // Stryker disable next-line OptionalChaining: bold always holds a child
  if (first?.type === 'inlineCode' && strong.children.length === 1) {
    return {
      isCode: true,
      text: first.value,
    };
  }

  return strong.children.every(isText)
    ? {
        isCode: false,
        text: mdastTextOf(strong),
      }
    : undefined;
};

const isSectionHeading = (node: RootContent): node is Heading =>
  // Stryker disable next-line ConditionalExpression: only a heading has a depth, so checking its type only narrows it
  node.type === 'heading' && node.depth <= SUBSECTION_HEADING_DEPTH;

// A rule's section runs from its heading to the next heading of its depth or above.
const ruleAt = (input: { index: number; nodes: readonly RootContent[] }): string | undefined => {
  const heading = input.nodes.slice(0, input.index + 1).findLast(isSectionHeading);

  return heading?.depth === SUBSECTION_HEADING_DEPTH
    ? RuleHeading.of(headingTextOf(heading))?.slug
    : undefined;
};

const termsUnder = (input: {
  address: string;
  block: string;
  body: string;
  node: RootContent;
  path: string;
}): readonly Term[] => {
  const terms: Term[] = [];

  visit(input.node, 'strong', (strong, _index, parent) => {
    const bold = boldOf(strong);

    // Stryker disable next-line ConditionalExpression: bold always has a parent, so the check only narrows its type
    if (bold === undefined || parent === undefined) {
      return;
    }

    // Stryker disable next-line OptionalChaining: the parser places every node it reads
    const start = parent.position?.start.offset ?? 0;

    terms.push(
      Term.create({
        ...nameOf(bold),
        address: input.address,
        axis: Term.axisOf(input.path),
        block: input.block,
        sentence: Term.sentenceAround({
          // Stryker disable next-line OptionalChaining: the parser places every node it reads
          offset: (strong.position?.start.offset ?? 0) - start,
          // Stryker disable next-line OptionalChaining: the parser places every node it reads
          text: input.body.slice(start, parent.position?.end.offset),
        }),
      }),
    );
  });

  return terms;
};

/** the terms one block file defines, `path` below the blocks folder; a file of no block defines none */
const termsIn = (input: { baseUrl: string; markdown: string; path: string }): readonly Term[] => {
  const block = Term.blockOf(input.path);

  if (block === undefined) {
    return [];
  }

  const body = input.markdown.slice(FRONT_MATTER.exec(input.markdown)?.[0].length);
  const page = [
    input.baseUrl,
    ...pageSlugsOf(input.path),
  ].join('/');
  const nodes = fromMarkdown(body).children;

  return nodes.flatMap((node, index) => {
    const rule = ruleAt({
      index,
      nodes,
    });

    return termsUnder({
      address: rule === undefined ? page : `${page}#${rule}`,
      block,
      body,
      node,
      path: input.path,
    });
  });
};

/** every term the blocks define, by name */
const termsOf = (baseUrl: string): readonly Term[] => {
  const blocks = inRepository(BLOCKS_FOLDER);

  return readdirSync(blocks, {
    recursive: true,
  })
    .map(String)
    .filter((path) => path.endsWith(MARKDOWN_EXTENSION))
    .flatMap((path) =>
      termsIn({
        baseUrl,
        markdown: readFileSync(join(blocks, path), 'utf8'),
        path,
      }),
    )
    .toSorted(Term.compare);
};

export { termsOf };
