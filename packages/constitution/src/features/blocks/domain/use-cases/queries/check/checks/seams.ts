import { Layer } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';
import { stemOf } from '#/kernel/utils';
import { BlockId } from '#/kernel/value-objects';

import type { Block } from '../../../../entities';
import { BlockFile, BlockFileRole, BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { pairableBy } from '../shared/layers';
import { aBlock, blocksOf } from '../shared/wording';

enum SeamsCode {
  NamedAfterOwnBlock = 'seam-named-after-own-block',
  BlockPairsWithNone = 'seam-of-unpairing-block',
  NotPair = 'seam-names-no-pair',
  OutOfLayer = 'seam-out-of-layer',
  AlongDependency = 'seam-along-a-dependency',
  TitleMismatch = 'seam-title-mismatch',
  ChapterNamedAfterBlock = 'chapter-named-after-block',
}

interface Subject {
  readonly block: Block;
  readonly graph: BlockGraph;
}

const MARKDOWN_EXTENSION = '.md';

const TITLE = '# ';

const titleOf = (body: string): string | undefined =>
  body.split('\n').find((line) => line.startsWith(TITLE));

enum PairingKind {
  Paired = 'paired',
  Refused = 'refused',
}

type Pairing =
  | {
      readonly kind: PairingKind.Paired;
      readonly other: Block;
    }
  | {
      readonly kind: PairingKind.Refused;
      readonly problem: Problem;
    };

const refused = (problem: Problem): Pairing => ({
  kind: PairingKind.Refused,
  problem,
});

const pairingOf = (
  input: Subject & {
    other: BlockId;
  },
): Pairing => {
  const target = input.graph.get(input.other);
  const allowed = pairableBy(input.block.layer);

  if (BlockId.equals(input.other, input.block.id)) {
    return refused({
      code: SeamsCode.NamedAfterOwnBlock,
      message: 'is named after its own block',
    });
  }

  if (allowed.length === 0) {
    return refused({
      code: SeamsCode.BlockPairsWithNone,
      message: `is a with/ file of ${input.block.id}, which pairs with no block`,
    });
  }

  if (target === undefined || target.layer === Layer.Core) {
    return refused({
      code: SeamsCode.NotPair,
      message: `is named after ${input.other}, which is not a block it may pair with`,
    });
  }

  if (!allowed.includes(target.layer)) {
    return refused({
      code: SeamsCode.OutOfLayer,
      message: `is named after ${input.other}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} pairs only with ${blocksOf(allowed)}`,
    });
  }

  const linked =
    BlockGraph.closureOf(input.graph, input.block.id).has(input.other) ||
    BlockGraph.closureOf(input.graph, input.other).has(input.block.id);

  return linked
    ? refused({
        code: SeamsCode.AlongDependency,
        message: `is named after ${input.other}, which ${input.block.id} requires or extends, or which requires or extends it; such a rule is the dependent block's own`,
      })
    : {
        kind: PairingKind.Paired,
        other: target,
      };
};

/** a seam titled otherwise than the other block's passport, since the seam's folder already names the block it belongs to */
const titleProblem = (input: { file: BlockFile; other: Block }): Problem | undefined =>
  titleOf(input.file.body) === titleOf(input.other.passport.body)
    ? undefined
    : {
        code: SeamsCode.TitleMismatch,
        message: "is titled otherwise than the other block's passport, whose title a seam takes",
      };

const seamFindings = (subject: Subject): readonly Finding[] =>
  subject.block.parts.flatMap((file) => {
    const other = BlockFile.seamOf(file);

    if (other === undefined) {
      return [];
    }

    const pairing = pairingOf({
      ...subject,
      other,
    });
    const problem =
      pairing.kind === PairingKind.Refused
        ? pairing.problem
        : titleProblem({
            file,
            other: pairing.other,
          });

    return problem === undefined
      ? []
      : [
          {
            ...problem,
            path: file.path,
          },
        ];
  });

const chapterFindings = (subject: Subject): readonly Finding[] =>
  subject.block.parts
    .filter((file) => file.role === BlockFileRole.Chapter)
    .flatMap((file) => {
      const name = stemOf({
        extension: MARKDOWN_EXTENSION,
        path: file.path,
      });

      return BlockGraph.named(subject.graph, name) === undefined
        ? []
        : [
            {
              code: SeamsCode.ChapterNamedAfterBlock,
              message: `takes the id of the block ${name}; a file named after a block belongs in with/`,
              path: file.path,
            },
          ];
    });

const seamsCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) => [
    ...seamFindings({
      block,
      graph,
    }),
    ...chapterFindings({
      block,
      graph,
    }),
  ]);

export { seamsCheck };
