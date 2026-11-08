import { Layer } from '#/kernel/constants';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { Block } from '../../../../block/entities';
import { BlockFile } from '../../../../block/entities';
import { BlockGraph, pairableBy } from '../../../../block-graph/entities';
import { findingsAt } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum SeamsCode {
  NamedAfterOwnBlock = 'seam-named-after-own-block',
  BlockPairsWithNone = 'seam-of-unpairing-block',
  NotPair = 'seam-names-no-pair',
  OutOfLayer = 'seam-out-of-layer',
  AlongDependency = 'seam-along-a-dependency',
}

interface SeamsDetails {
  readonly [SeamsCode.NamedAfterOwnBlock]: object;
  readonly [SeamsCode.BlockPairsWithNone]: {
    readonly block: BlockId;
  };
  readonly [SeamsCode.NotPair]: {
    readonly other: BlockId;
  };
  readonly [SeamsCode.OutOfLayer]: {
    readonly allowed: readonly Layer[];
    readonly layer: Layer;
    readonly other: BlockId;
    readonly otherLayer: Layer;
  };
  readonly [SeamsCode.AlongDependency]: {
    readonly block: BlockId;
    readonly other: BlockId;
  };
}

type SeamsFinding = FindingOf<SeamsDetails>;

type SeamsProblem = ProblemOf<SeamsDetails>;

interface Subject {
  readonly block: Block;
  readonly graph: BlockGraph;
}

const pairingProblem = (
  input: Subject & {
    other: BlockId;
  },
): SeamsProblem | undefined => {
  const target = input.graph.get(input.other);
  const allowed = pairableBy(input.block.layer);

  if (BlockId.equals(input.other, input.block.id)) {
    return {
      code: SeamsCode.NamedAfterOwnBlock,
      details: {},
    };
  }

  if (allowed.length === 0) {
    return {
      code: SeamsCode.BlockPairsWithNone,
      details: {
        block: input.block.id,
      },
    };
  }

  if (target === undefined || target.layer === Layer.Core) {
    return {
      code: SeamsCode.NotPair,
      details: {
        other: input.other,
      },
    };
  }

  if (!allowed.includes(target.layer)) {
    return {
      code: SeamsCode.OutOfLayer,
      details: {
        allowed,
        layer: input.block.layer,
        other: input.other,
        otherLayer: target.layer,
      },
    };
  }

  const linked =
    BlockGraph.closureOf(input.graph, input.block.id).has(input.other) ||
    BlockGraph.closureOf(input.graph, input.other).has(input.block.id);

  return linked
    ? {
        code: SeamsCode.AlongDependency,
        details: {
          block: input.block.id,
          other: input.other,
        },
      }
    : undefined;
};

const seamFindings = (subject: Subject): readonly SeamsFinding[] =>
  subject.block.parts.flatMap((file) => {
    const other = BlockFile.seamOf(file);

    if (other === undefined) {
      return [];
    }

    return findingsAt(file.path, [
      pairingProblem({
        ...subject,
        other,
      }),
    ]);
  });

const seamsCheck: Check<SeamsFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly SeamsFinding[] =>
  constitution.blocks.flatMap((block) =>
    seamFindings({
      block,
      graph,
    }),
  );

export type { SeamsDetails };
export { SeamsCode, seamsCheck };
