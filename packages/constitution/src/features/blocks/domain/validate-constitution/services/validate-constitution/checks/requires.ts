import type { Layer } from '#/kernel/constants';
import { PATH_SEPARATOR } from '#/kernel/constants';
import { BlockModel } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { BlockId, coreBlockId } from '#/kernel/value-objects';

import type { Block } from '../../../../block/entities';
import { BlockGraph, requirableBy } from '../../../../block-graph/entities';
import { findingsAt } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum RequiresCode {
  RequiresCore = 'requires-core',
  RequiresNoBlock = 'requires-no-block',
  RequiresItself = 'requires-itself',
  RequiresOutOfLayer = 'requires-out-of-layer',
  RequiresAncestor = 'requires-a-block-it-sits-under',
  RequiresThroughParent = 'requires-what-its-parent-turns-on',
}

interface RequiresDetails {
  readonly [RequiresCode.RequiresCore]: object;
  readonly [RequiresCode.RequiresNoBlock]: {
    readonly required: BlockId;
  };
  readonly [RequiresCode.RequiresItself]: object;
  readonly [RequiresCode.RequiresOutOfLayer]: {
    readonly allowed: readonly Layer[];
    readonly layer: Layer;
    readonly required: BlockId;
    readonly requiredLayer: Layer;
  };
  readonly [RequiresCode.RequiresAncestor]: {
    readonly required: BlockId;
  };
  readonly [RequiresCode.RequiresThroughParent]: {
    readonly parent: BlockId;
    readonly required: BlockId;
  };
}

type RequiresFinding = FindingOf<RequiresDetails>;

type RequiresProblem = ProblemOf<RequiresDetails>;

interface Subject {
  readonly block: Block;
  readonly graph: BlockGraph;
  readonly model: BlockModel;
}

const ancestorsOf = (id: BlockId): readonly BlockId[] =>
  id
    .split(PATH_SEPARATOR)
    .slice(0, -1)
    .map((_, index, parts) => BlockId.create(parts.slice(0, index + 1).join(PATH_SEPARATOR)));

const treeProblem = (
  input: Subject & {
    id: BlockId;
  },
): RequiresProblem | undefined => {
  const ancestors = ancestorsOf(input.block.id);

  if (ancestors.includes(input.id)) {
    return {
      code: RequiresCode.RequiresAncestor,
      details: {
        required: input.id,
      },
    };
  }

  const parent = ancestors.find((ancestor) =>
    BlockGraph.closureOf(input.graph, ancestor).has(input.id),
  );

  return parent === undefined
    ? undefined
    : {
        code: RequiresCode.RequiresThroughParent,
        details: {
          parent,
          required: input.id,
        },
      };
};

const requireProblem = (
  input: Subject & {
    allowed: readonly Layer[];
    id: BlockId;
  },
): RequiresProblem | undefined => {
  const target = BlockModel.blockOf(input.model, input.id);

  if (BlockId.equals(input.id, coreBlockId)) {
    return {
      code: RequiresCode.RequiresCore,
      details: {},
    };
  }

  if (target === undefined) {
    return {
      code: RequiresCode.RequiresNoBlock,
      details: {
        required: input.id,
      },
    };
  }

  if (BlockId.equals(target.id, input.block.id)) {
    return {
      code: RequiresCode.RequiresItself,
      details: {},
    };
  }

  return input.allowed.includes(target.layer)
    ? treeProblem(input)
    : {
        code: RequiresCode.RequiresOutOfLayer,
        details: {
          allowed: input.allowed,
          layer: input.block.layer,
          required: input.id,
          requiredLayer: target.layer,
        },
      };
};

const blockFindings = (subject: Subject): readonly RequiresFinding[] => {
  const allowed = requirableBy(subject.block.layer);
  const problems = [
    ...(allowed.length === 0
      ? []
      : subject.block.frontMatter.requires.map((id) =>
          requireProblem({
            ...subject,
            allowed,
            id,
          }),
        )),
  ];

  return findingsAt(subject.block.passport.path, problems);
};

const requiresCheck: Check<RequiresFinding> = ({
  constitution,
  graph,
  model,
}: CheckInput): readonly RequiresFinding[] =>
  constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      graph,
      model,
    }),
  );

export type { RequiresDetails };
export { RequiresCode, requiresCheck };
