import { Axis, Layer } from '#/kernel/constants';
import type { TermKind } from '#/kernel/entities';
import { Term } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import {
  collapseWhitespace,
  firstBy,
  inlineCodeSpans,
  isHeading,
  withoutCodeFences,
} from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';

import type { BlockFile } from '../../../entities';
import { Block, BlockFileRole, BlockGraph } from '../../../entities';
import type { Check, CheckInput } from '../check.types';

enum TermsCode {
  Misshapen = 'term-misshapen',
  DefinedTwice = 'term-defined-twice',
  OffAxis = 'term-off-axis',
  OutOfReach = 'term-out-of-reach',
  Misspelled = 'term-misspelled',
  WithoutId = 'term-without-id',
  IdRepeated = 'term-id-repeated',
  IdMisshapen = 'term-id-misshapen',
}

interface TermsDetails {
  readonly [TermsCode.Misshapen]: {
    readonly written: string;
  };
  readonly [TermsCode.DefinedTwice]: {
    readonly firstBlock: BlockId;
    readonly firstFile: string;
    readonly term: string;
  };
  readonly [TermsCode.OffAxis]: {
    readonly axis: Axis;
    readonly term: string;
    readonly termAxis: Axis;
  };
  readonly [TermsCode.OutOfReach]: {
    readonly owner: BlockId;
    readonly term: string;
  };
  readonly [TermsCode.Misspelled]: {
    readonly kind: TermKind;
    readonly owner: BlockId;
    readonly term: string;
    readonly written: string;
  };
  readonly [TermsCode.WithoutId]: {
    readonly term: string;
  };
  readonly [TermsCode.IdRepeated]: {
    readonly firstFile: string;
    readonly firstTerm: string;
    readonly id: string;
    readonly term: string;
  };
  readonly [TermsCode.IdMisshapen]: {
    readonly id: string;
    readonly term: string;
  };
}

type TermsFinding = FindingOf<TermsDetails>;

interface Definition extends Term {
  readonly axis: Axis;
  readonly block: BlockId;
  readonly layer: Layer;
  readonly path: string;
}

interface Defined extends Definition {
  readonly matches: (text: string) => boolean;
}

interface Placed {
  readonly block: Block;
  readonly file: BlockFile;
  readonly isReached: (owned: Owned) => boolean;
}

interface PlacedTerm {
  readonly placed: Placed;
  readonly term: Term;
}

interface Owned {
  readonly block: BlockId;
  readonly layer: Layer;
}

interface Glossary {
  readonly defined: readonly Defined[];
  readonly findings: readonly TermsFinding[];
}

const placedFiles = (input: { blocks: readonly Block[]; graph: BlockGraph }): readonly Placed[] =>
  input.blocks.flatMap((block) =>
    Block.filesOf(block).map((file) => {
      const allowed = BlockGraph.reachableFrom(input.graph, Block.placeOf(block, file));

      return {
        block,
        file,
        isReached: (owned: Owned): boolean =>
          owned.layer === Layer.Core || allowed.has(owned.block),
      };
    }),
  );

const TERM_ID_SHAPE = /^[a-z][a-z0-9-]*$/;

const ownedOf = (block: Block): Owned => ({
  block: block.id,
  layer: block.layer,
});

const idFinding = (input: {
  owners: ReadonlyMap<string | undefined, PlacedTerm>;
  placedTerm: PlacedTerm;
}): TermsFinding | undefined => {
  const { placedTerm } = input;
  const { block, file, isReached } = placedTerm.placed;
  const { id, kind, term } = placedTerm.term;

  if (id === undefined) {
    return Term.isRoleKind(kind)
      ? {
          code: TermsCode.WithoutId,
          details: {
            term,
          },
          path: file.path,
        }
      : undefined;
  }

  if (!TERM_ID_SHAPE.test(id)) {
    return {
      code: TermsCode.IdMisshapen,
      details: {
        id,
        term,
      },
      path: file.path,
    };
  }

  const owner = input.owners.get(id) ?? placedTerm;
  const isBuiltOn =
    isReached(ownedOf(owner.placed.block)) || owner.placed.isReached(ownedOf(block));

  if (owner === placedTerm || (owner.placed.block.id !== block.id && isBuiltOn)) {
    return undefined;
  }

  return {
    code: TermsCode.IdRepeated,
    details: {
      firstFile: owner.placed.file.path,
      firstTerm: owner.term.term,
      id,
      term,
    },
    path: file.path,
  };
};

const twiceFinding = (input: {
  firsts: ReadonlyMap<string, PlacedTerm>;
  placedTerm: PlacedTerm;
}): TermsFinding | undefined => {
  const { placedTerm } = input;
  const earlier = input.firsts.get(placedTerm.term.term) ?? placedTerm;

  return earlier === placedTerm
    ? undefined
    : {
        code: TermsCode.DefinedTwice,
        details: {
          firstBlock: earlier.placed.block.id,
          firstFile: earlier.placed.file.path,
          term: placedTerm.term.term,
        },
        path: placedTerm.placed.file.path,
      };
};

const glossaryOf = (files: readonly Placed[]): Glossary => {
  const reads = files.map((placed) => {
    const read = Term.allIn(placed.file.body);

    return {
      misshapen: read.misshapen,
      placed,
      terms: read.terms.map(
        (term): PlacedTerm => ({
          placed,
          term,
        }),
      ),
    };
  });
  const terms = reads.flatMap((read) => read.terms);
  const firsts = firstBy(terms, ({ term }) => term.term);
  const owners = firstBy(terms, ({ term }) => term.id);

  return {
    defined: terms
      .filter((placedTerm) => firsts.get(placedTerm.term.term) === placedTerm)
      .map(({ placed, term }) => ({
        ...term,
        axis: placed.file.axis,
        block: placed.block.id,
        layer: placed.block.layer,
        matches: Term.matcherOf(term),
        path: placed.file.path,
      })),
    findings: reads.flatMap(({ misshapen, placed, terms: own }) => [
      ...misshapen.map(
        (written): TermsFinding => ({
          code: TermsCode.Misshapen,
          details: {
            written,
          },
          path: placed.file.path,
        }),
      ),
      ...own.flatMap((placedTerm) =>
        [
          idFinding({
            owners,
            placedTerm,
          }),
          twiceFinding({
            firsts,
            placedTerm,
          }),
        ].filter((finding) => finding !== undefined),
      ),
    ]),
  };
};

const axisProseOf = (file: BlockFile): string =>
  collapseWhitespace(
    withoutCodeFences(file.body)
      .split('\n')
      .filter((line) => !isHeading(line))
      .join('\n'),
  );

const axisFindings = (input: {
  defined: readonly Defined[];
  files: readonly Placed[];
}): readonly TermsFinding[] =>
  input.files
    .filter(({ file }) => file.role !== BlockFileRole.Passport)
    .flatMap(({ file }) => {
      const prose = axisProseOf(file);

      return input.defined
        .filter(
          (term) => term.axis !== Axis.Foundation && term.axis !== file.axis && term.matches(prose),
        )
        .map((term) => ({
          code: TermsCode.OffAxis,
          details: {
            axis: file.axis,
            term: term.term,
            termAxis: term.axis,
          },
          path: file.path,
        }));
    });

const reachProseOf = ({ block, file }: Placed): string => {
  const body = withoutCodeFences(file.body);

  return collapseWhitespace(
    file.role === BlockFileRole.Passport ? `${block.frontMatter.summary}\n${body}` : body,
  );
};

const useFindings = (input: {
  defined: readonly Defined[];
  files: readonly Placed[];
}): readonly TermsFinding[] =>
  input.files.flatMap((placed) => {
    const prose = reachProseOf(placed);
    const spans = new Set(inlineCodeSpans(withoutCodeFences(placed.file.body)));

    return input.defined.flatMap((term): readonly TermsFinding[] => {
      if (!placed.isReached(term)) {
        return term.matches(prose)
          ? [
              {
                code: TermsCode.OutOfReach,
                details: {
                  owner: term.block,
                  term: term.term,
                },
                path: placed.file.path,
              },
            ]
          : [];
      }

      const other = Term.otherSpellingOf(term);

      // Stryker disable next-line ConditionalExpression: no span is undefined, so the check only narrows its type
      return other !== undefined && spans.has(other)
        ? [
            {
              code: TermsCode.Misspelled,
              details: {
                kind: term.kind,
                owner: term.block,
                term: term.term,
                written: other,
              },
              path: placed.file.path,
            },
          ]
        : [];
    });
  });

const termsCheck: Check<TermsFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly TermsFinding[] => {
  const files = placedFiles({
    blocks: constitution.blocks,
    graph,
  });
  const { defined, findings } = glossaryOf(files);

  return [
    ...findings,
    ...axisFindings({
      defined,
      files,
    }),
    ...useFindings({
      defined,
      files,
    }),
  ];
};

export type { TermsDetails };
export { TermsCode, termsCheck };
