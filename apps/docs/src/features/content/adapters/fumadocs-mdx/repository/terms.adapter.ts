import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Bold } from '@droneey/constitution';
import {
  Term as DefinedTerm,
  TermKind as DefinedTermKind,
  RuleHeading,
} from '@droneey/constitution';
import type { Parent, PhrasingContent, RootContent, Strong, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString as mdastTextOf } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

import { Page, Term, TermKind } from '../../../domain/entities';
import { BlockPath } from '../../../domain/value-objects';
import { headingTextOf, isSectionHeading, SUBSECTION_HEADING_DEPTH } from '../markdown';
import { FRONT_MATTER } from './blocks.constants';
import { inRepository } from './repository.adapter';
import { blocksFolderPath } from './repository.constants';

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

// A rule's section runs from its heading to the next heading of its depth or above.
const ruleSlugAt = (input: {
  index: number;
  nodes: readonly RootContent[];
}): string | undefined => {
  const heading = input.nodes.slice(0, input.index + 1).findLast(isSectionHeading);

  return heading?.depth === SUBSECTION_HEADING_DEPTH
    ? RuleHeading.of(headingTextOf(heading))?.slug
    : undefined;
};

// A term with an id is linked to its own anchor, which the page gives its bold.
const idOf = (input: { index: number | undefined; parent: Parent }): string | undefined => {
  // Stryker disable next-line ConditionalExpression: bold always has an index, so the check only narrows its type
  const next = input.index === undefined ? undefined : input.parent.children[input.index + 1];

  return next?.type === 'text' ? DefinedTerm.idAfter(next.value) : undefined;
};

const termsUnder = (input: {
  blockId: string;
  blockPath: BlockPath;
  body: string;
  node: RootContent;
  pageAddress: string;
  ruleSlug: string | undefined;
}): readonly Term[] => {
  const terms: Term[] = [];

  visit(input.node, 'strong', (strong, index, parent) => {
    const bold = boldOf(strong);

    // Stryker disable next-line ConditionalExpression: bold always has a parent, so the check only narrows its type
    if (bold === undefined || parent === undefined) {
      return;
    }

    // Stryker disable next-line OptionalChaining: the parser places every node it reads
    const parentStartOffset = parent.position?.start.offset ?? 0;
    const anchor =
      idOf({
        index,
        parent,
      }) ?? input.ruleSlug;

    terms.push(
      Term.create({
        ...nameOf(bold),
        address: anchor === undefined ? input.pageAddress : `${input.pageAddress}#${anchor}`,
        axis: Term.axisOf(input.blockPath),
        blockId: input.blockId,
        sentence: Term.sentenceAround({
          // Stryker disable next-line OptionalChaining: the parser places every node it reads
          offset: (strong.position?.start.offset ?? 0) - parentStartOffset,
          // Stryker disable next-line OptionalChaining: the parser places every node it reads
          text: input.body.slice(parentStartOffset, parent.position?.end.offset),
        }),
      }),
    );
  });

  return terms;
};

const termsIn = (input: {
  baseUrl: string;
  blockPath: BlockPath;
  markdown: string;
}): readonly Term[] => {
  const blockId = Term.blockIdOf(input.blockPath);

  if (blockId === undefined) {
    return [];
  }

  const body = input.markdown.slice(FRONT_MATTER.exec(input.markdown)?.[0].length);
  const pageAddress = Page.addressOf(input.baseUrl, input.blockPath);
  const nodes = fromMarkdown(body).children;

  return nodes.flatMap((node, index) =>
    termsUnder({
      blockId,
      blockPath: input.blockPath,
      body,
      node,
      pageAddress,
      ruleSlug: ruleSlugAt({
        index,
        nodes,
      }),
    }),
  );
};

/** every term the blocks define, by name */
const termsOf = (baseUrl: string): readonly Term[] => {
  const blocksFolderAbsolutePath = inRepository(blocksFolderPath);

  return readdirSync(blocksFolderAbsolutePath, {
    recursive: true,
  })
    .map(String)
    .filter(BlockPath.is)
    .flatMap((blockPath) =>
      termsIn({
        baseUrl,
        blockPath,
        markdown: readFileSync(join(blocksFolderAbsolutePath, blockPath), 'utf8'),
      }),
    )
    .toSorted(Term.compare);
};

export { termsOf };
