import { Axis, Layer } from '#/kernel/constants';
import type { Finding } from '#/kernel/types';
import { isHeading, withoutCodeFences } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';

import type { BlockFile } from '../../../../entities';
import { Block, BlockFileRole, BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { inlineCodeSpans } from '../shared/markdown';
import type { Term } from '../shared/terms';
import { otherSpellingOf, termMatcher, termsIn } from '../shared/terms';
import { collapseWhitespace } from '../shared/tokens';

enum TermsCode {
  Misshapen = 'term-misshapen',
  DefinedTwice = 'term-defined-twice',
  OffAxis = 'term-off-axis',
  OutOfReach = 'term-out-of-reach',
  Misspelled = 'term-misspelled',
}

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

interface Glossary {
  readonly defined: readonly Defined[];
  readonly findings: readonly Finding[];
}

const placedFiles = (blocks: readonly Block[]): readonly Placed[] =>
  blocks.flatMap((block) =>
    Block.filesOf(block).map((file) => ({
      block,
      file,
    })),
  );

const glossaryOf = (files: readonly Placed[]): Glossary => {
  const first = new Map<string, Definition>();
  const findings: Finding[] = [];

  for (const { block, file } of files) {
    const read = termsIn(file.body);

    findings.push(
      ...read.misshapen.map((text) => ({
        code: TermsCode.Misshapen,
        message: `sets "${text}" in bold, which is neither plain words nor one code span; bold defines a term`,
        path: file.path,
      })),
    );

    for (const term of read.terms) {
      const earlier = first.get(term.term);

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
          message: `defines "${term.term}", which ${earlier.path} of ${earlier.block} defines already; a term is defined once`,
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
      matches: termMatcher(definition),
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
}): readonly Finding[] =>
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
          message: `uses "${term.term}", a term of the ${term.axis}; ${file.axis} holds whatever the ${term.axis}`,
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

// Every block builds on core, so core's terms are everyone's.
const reaches = (input: { graph: BlockGraph; placed: Placed }): ((term: Defined) => boolean) => {
  const allowed = BlockGraph.reachableFrom(
    input.graph,
    Block.placeOf(input.placed.block, input.placed.file),
  );

  return (term: Defined): boolean => term.layer === Layer.Core || allowed.has(term.block);
};

const reachFindings = (input: {
  graph: BlockGraph;
  defined: readonly Defined[];
  files: readonly Placed[];
}): readonly Finding[] =>
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
        message: `uses "${term.term}", which ${term.block} defines; only ${term.block} and the blocks that build on it may`,
        path: placed.file.path,
      }));
  });

// A file that cannot reach a term's owner speaks of something else when it writes its stem.
const spellingFindings = (input: {
  graph: BlockGraph;
  defined: readonly Defined[];
  files: readonly Placed[];
}): readonly Finding[] =>
  input.files.flatMap((placed) => {
    const isReached = reaches({
      graph: input.graph,
      placed,
    });
    const spans = new Set(inlineCodeSpans(withoutCodeFences(placed.file.body)));

    return input.defined.flatMap((term) => {
      const other = otherSpellingOf(term);

      // Stryker disable next-line ConditionalExpression: no span is undefined, so the check only narrows its type
      return other !== undefined && spans.has(other) && isReached(term)
        ? [
            {
              code: TermsCode.Misspelled,
              message: `writes \`${other}\`, which ${term.block} defines as \`${term.term}\`; a ${term.kind} keeps one spelling`,
              path: placed.file.path,
            },
          ]
        : [];
    });
  });

const termsCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] => {
  const files = placedFiles(constitution.blocks);
  const { defined, findings } = glossaryOf(files);

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

export { termsCheck };
