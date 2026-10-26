import { Axis, Layer } from '#/kernel/constants';
import type { TermKind } from '#/kernel/entities';
import { Term } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { collapseWhitespace, inlineCodeSpans, isHeading, withoutCodeFences } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';

import type { BlockFile } from '../../../../entities';
import { Block, BlockFileRole, BlockGraph } from '../../../../entities';
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
    /** the text set in bold */
    readonly written: string;
  };
  readonly [TermsCode.DefinedTwice]: {
    /** the block of the term's first definition */
    readonly firstBlock: BlockId;
    readonly firstFile: string;
    readonly term: string;
  };
  readonly [TermsCode.OffAxis]: {
    /** the axis of the file that uses the term */
    readonly axis: Axis;
    readonly term: string;
    readonly termAxis: Axis;
  };
  readonly [TermsCode.OutOfReach]: {
    /** the block that defines the term */
    readonly owner: BlockId;
    readonly term: string;
  };
  readonly [TermsCode.Misspelled]: {
    readonly kind: TermKind;
    readonly owner: BlockId;
    readonly term: string;
    /** the other spelling the file writes */
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
}

interface IdOwner {
  readonly block: BlockId;
  /** whether the owner's block builds on another */
  readonly isReached: (owned: Owned) => boolean;
  readonly layer: Layer;
  readonly path: string;
  readonly term: string;
}

interface Owned {
  readonly block: BlockId;
  readonly layer: Layer;
}

interface Glossary {
  readonly defined: readonly Defined[];
  readonly findings: readonly TermsFinding[];
}

const placedFiles = (blocks: readonly Block[]): readonly Placed[] =>
  blocks.flatMap((block) =>
    Block.filesOf(block).map((file) => ({
      block,
      file,
    })),
  );

const TERM_ID_SHAPE = /^[a-z][a-z0-9-]*$/;

// A role is named by its id wherever its spelling may change, so each folder and suffix carries one,
// well-formed and its own; any other term may. Of two blocks one builds on, the more specific may
// spell the id its own way, as a language spells a folder, whichever is read first.
const idFinding = (input: {
  isReached: (owner: Owned) => boolean;
  owners: Map<string, IdOwner>;
  placed: Placed;
  term: Term;
}): TermsFinding | undefined => {
  const { block, file } = input.placed;
  const { id, kind, term } = input.term;

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

  const owner = input.owners.get(id);

  if (owner === undefined) {
    input.owners.set(id, {
      block: block.id,
      isReached: input.isReached,
      layer: block.layer,
      path: file.path,
      term,
    });

    return undefined;
  }

  const builtOn =
    input.isReached(owner) ||
    owner.isReached({
      block: block.id,
      layer: block.layer,
    });

  if (owner.block !== block.id && builtOn) {
    return undefined;
  }

  return {
    code: TermsCode.IdRepeated,
    details: {
      firstFile: owner.path,
      firstTerm: owner.term,
      id,
      term,
    },
    path: file.path,
  };
};

// Every block builds on core, so core's terms are everyone's.
const reaches = (input: { graph: BlockGraph; placed: Placed }): ((owned: Owned) => boolean) => {
  const allowed = BlockGraph.reachableFrom(
    input.graph,
    Block.placeOf(input.placed.block, input.placed.file),
  );

  return (owned: Owned): boolean => owned.layer === Layer.Core || allowed.has(owned.block);
};

const glossaryOf = (input: { files: readonly Placed[]; graph: BlockGraph }): Glossary => {
  const first = new Map<string, Definition>();
  const owners = new Map<string, IdOwner>();
  const findings: TermsFinding[] = [];

  for (const placed of input.files) {
    const { block, file } = placed;
    const read = Term.allIn(file.body);
    const isReached = reaches({
      graph: input.graph,
      placed,
    });

    findings.push(
      ...read.misshapen.map(
        (written): TermsFinding => ({
          code: TermsCode.Misshapen,
          details: {
            written,
          },
          path: file.path,
        }),
      ),
    );

    for (const term of read.terms) {
      const earlier = first.get(term.term);
      const idProblem = idFinding({
        isReached,
        owners,
        placed,
        term,
      });

      if (idProblem !== undefined) {
        findings.push(idProblem);
      }

      if (earlier === undefined) {
        first.set(term.term, {
          ...term,
          axis: file.axis,
          block: block.id,
          layer: block.layer,
          path: file.path,
        });
      } else {
        findings.push({
          code: TermsCode.DefinedTwice,
          details: {
            firstBlock: earlier.block,
            firstFile: earlier.path,
            term: term.term,
          },
          path: file.path,
        });
      }
    }
  }

  return {
    defined: [
      ...first.values(),
    ].map((definition) => ({
      ...definition,
      matches: Term.matcherOf(definition),
    })),
    findings,
  };
};

const axisProseOf = (file: BlockFile): string =>
  collapseWhitespace(
    withoutCodeFences(file.body)
      .split('\n')
      .filter((line) => !isHeading(line))
      .join('\n'),
  );

// A passport speaks of its whole block, every axis at once, as its front matter does.
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

// The summary is prose too: it is the block's line in every digest.
const reachProseOf = ({ block, file }: Placed): string => {
  const body = withoutCodeFences(file.body);

  return collapseWhitespace(
    file.role === BlockFileRole.Passport ? `${block.frontMatter.summary}\n${body}` : body,
  );
};

const reachFindings = (input: {
  graph: BlockGraph;
  defined: readonly Defined[];
  files: readonly Placed[];
}): readonly TermsFinding[] =>
  input.files.flatMap((placed) => {
    const isReached = reaches({
      graph: input.graph,
      placed,
    });
    const prose = reachProseOf(placed);

    return input.defined
      .filter((term) => !isReached(term) && term.matches(prose))
      .map((term) => ({
        code: TermsCode.OutOfReach,
        details: {
          owner: term.block,
          term: term.term,
        },
        path: placed.file.path,
      }));
  });

// A file that cannot reach a term's owner speaks of something else when it writes its stem.
const spellingFindings = (input: {
  graph: BlockGraph;
  defined: readonly Defined[];
  files: readonly Placed[];
}): readonly TermsFinding[] =>
  input.files.flatMap((placed) => {
    const isReached = reaches({
      graph: input.graph,
      placed,
    });
    const spans = new Set(inlineCodeSpans(withoutCodeFences(placed.file.body)));

    return input.defined.flatMap((term) => {
      const other = Term.otherSpellingOf(term);

      // Stryker disable next-line ConditionalExpression: no span is undefined, so the check only narrows its type
      return other !== undefined && spans.has(other) && isReached(term)
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
  const files = placedFiles(constitution.blocks);
  const { defined, findings } = glossaryOf({
    files,
    graph,
  });

  return [
    ...findings,
    ...axisFindings({
      defined,
      files,
    }),
    ...reachFindings({
      graph,
      defined,
      files,
    }),
    ...spellingFindings({
      graph,
      defined,
      files,
    }),
  ];
};

export type { TermsDetails };
export { TermsCode, termsCheck };
