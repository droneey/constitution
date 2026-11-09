import { Axis, Layer } from '#/kernel/constants';
import type { Rule } from '#/kernel/entities';
import { StatedRule, Term, TermKind } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { firstBy } from '#/kernel/utils';
import type { BlockId, RuleSlug } from '#/kernel/value-objects';

import type { BlockFile } from '../../../../block/entities';
import { Block, BlockFileRole } from '../../../../block/entities';
import { BlockGraph } from '../../../../block-graph/entities';
import { proseOf } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum TermsCode {
  Misshapen = 'term-misshapen',
  DefinedTwice = 'term-defined-twice',
  OffAxis = 'term-off-axis',
  OutOfReach = 'term-out-of-reach',
  WithoutId = 'term-without-id',
  IdRepeated = 'term-id-repeated',
  IdMisshapen = 'term-id-misshapen',
  Unused = 'term-used-nowhere',
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
    readonly slug: RuleSlug;
    readonly term: string;
    readonly termAxis: Axis;
  };
  readonly [TermsCode.OutOfReach]: {
    readonly owner: BlockId;
    readonly term: string;
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
  readonly [TermsCode.Unused]: {
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

const wordKinds: ReadonlySet<TermKind> = new Set([
  TermKind.Concept,
  TermKind.Brand,
]);

const proseOfPlaced = ({ block, file }: Placed): string =>
  proseOf(
    file.role === BlockFileRole.Passport ? `${block.frontMatter.summary}\n${file.body}` : file.body,
  );

const reachFindings = (input: {
  files: readonly Placed[];
  words: readonly Defined[];
}): readonly TermsFinding[] =>
  input.files.flatMap((placed) => {
    const prose = proseOfPlaced(placed);

    return input.words
      .filter((term) => !placed.isReached(term) && term.matches(prose))
      .map(
        (term): TermsFinding => ({
          code: TermsCode.OutOfReach,
          details: {
            owner: term.block,
            term: term.term,
          },
          path: placed.file.path,
        }),
      );
  });

// Why: a rule needs a term of an axis when its statement uses it; its Why and its file's Governs
// line explain or name, and a word they share with an axis's term is no obligation on that axis.
const axisFindings = (input: {
  graph: BlockGraph;
  rules: readonly Rule[];
  words: readonly Defined[];
}): readonly TermsFinding[] =>
  input.rules.flatMap((rule) => {
    const reached = BlockGraph.reachableFrom(input.graph, rule);
    const prose = proseOf(rule.statement);

    return input.words
      .filter(
        (term) =>
          term.axis !== Axis.Foundation &&
          term.axis !== rule.axis &&
          (term.layer === Layer.Core || reached.has(term.block)) &&
          term.matches(prose),
      )
      .map(
        (term): TermsFinding => ({
          code: TermsCode.OffAxis,
          details: {
            axis: rule.axis,
            slug: rule.slug,
            term: term.term,
            termAxis: term.axis,
          },
          path: rule.file,
        }),
      );
  });

const UNUSED_WORDS = 4;
const PLURAL_END = /s$/;
const BOLD_MARK = '**';

const countIn = (input: { bodies: readonly string[]; pattern: RegExp }): number =>
  input.bodies.reduce(
    (sum, body) =>
      sum +
      [
        ...body.matchAll(input.pattern),
      ].length,
    0,
  );

// Why: a definition's own bold is no use of its term, so a stem met only where it is set in bold
// is used by no rule or definition.
const unusedFindings = (input: {
  defined: readonly Defined[];
  files: readonly Placed[];
}): readonly TermsFinding[] => {
  const bodies = input.files.map(({ file }) => StatedRule.withoutExamples(file.body));

  return input.defined
    .filter((term) => term.kind === TermKind.Concept && term.term.split(' ').length <= UNUSED_WORDS)
    .filter((term) => {
      const stem = RegExp.escape(term.term.replace(PLURAL_END, ''));

      return (
        countIn({
          bodies,
          pattern: new RegExp(`\\b${stem}`, 'gi'),
        }) <=
        countIn({
          bodies,
          pattern: new RegExp(`${RegExp.escape(BOLD_MARK)}${stem}`, 'gi'),
        })
      );
    })
    .map((term) => ({
      code: TermsCode.Unused,
      details: {
        term: term.term,
      },
      path: term.path,
    }));
};

const termsCheck: Check<TermsFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly TermsFinding[] => {
  const files = placedFiles({
    blocks: constitution.blocks,
    graph,
  });
  const { defined, findings } = glossaryOf(files);

  // Why: a name in code is a spelling a block may respell, not a use of the term it spells.
  const words = defined.filter((term) => wordKinds.has(term.kind));

  return [
    ...findings,
    ...reachFindings({
      files,
      words,
    }),
    ...axisFindings({
      graph,
      rules: constitution.rules,
      words,
    }),
    ...unusedFindings({
      defined,
      files,
    }),
  ];
};

export type { TermsDetails };
export { TermsCode, termsCheck };
