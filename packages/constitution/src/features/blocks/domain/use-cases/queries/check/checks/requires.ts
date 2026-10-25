import type { Layer } from '#/kernel/constants';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { BlockId, coreBlockId } from '#/kernel/value-objects';

import type { BlockGraph } from '../../../../entities';
import { Block, requirableBy } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';

enum RequiresCode {
  RequiresCore = 'requires-core',
  RequiresNoBlock = 'requires-no-block',
  RequiresItself = 'requires-itself',
  RequiresOutOfLayer = 'requires-out-of-layer',
  ExtendsNoBlock = 'extends-no-block',
  ExtendsItself = 'extends-itself',
  ExtendsOtherLayer = 'extends-other-layer',
  ExtendsConcrete = 'extends-concrete-block',
}

interface RequiresDetails {
  readonly [RequiresCode.RequiresCore]: object;
  readonly [RequiresCode.RequiresNoBlock]: {
    readonly required: BlockId;
  };
  readonly [RequiresCode.RequiresItself]: object;
  readonly [RequiresCode.RequiresOutOfLayer]: {
    /** the layers the block may require */
    readonly allowed: readonly Layer[];
    readonly layer: Layer;
    readonly required: BlockId;
    readonly requiredLayer: Layer;
  };
  readonly [RequiresCode.ExtendsNoBlock]: {
    readonly base: BlockId;
  };
  readonly [RequiresCode.ExtendsItself]: object;
  readonly [RequiresCode.ExtendsOtherLayer]: {
    readonly base: BlockId;
    readonly baseLayer: Layer;
  };
  readonly [RequiresCode.ExtendsConcrete]: {
    readonly base: BlockId;
  };
}

type RequiresFinding = FindingOf<RequiresDetails>;

type RequiresProblem = ProblemOf<RequiresDetails>;

interface Subject {
  readonly block: Block;
  readonly graph: BlockGraph;
}

const requireProblem = (
  input: Subject & {
    allowed: readonly Layer[];
    id: BlockId;
  },
): RequiresProblem | undefined => {
  const target = input.graph.get(input.id);

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

  if (Block.sameAs(target, input.block)) {
    return {
      code: RequiresCode.RequiresItself,
      details: {},
    };
  }

  return input.allowed.includes(target.layer)
    ? undefined
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

const extendsProblem = (subject: Subject): RequiresProblem | undefined => {
  const base = subject.block.frontMatter.extends;

  if (base === undefined) {
    return undefined;
  }

  const target = subject.graph.get(base);

  if (target === undefined) {
    return {
      code: RequiresCode.ExtendsNoBlock,
      details: {
        base,
      },
    };
  }

  if (Block.sameAs(target, subject.block)) {
    return {
      code: RequiresCode.ExtendsItself,
      details: {},
    };
  }

  if (target.layer !== subject.block.layer) {
    return {
      code: RequiresCode.ExtendsOtherLayer,
      details: {
        base,
        baseLayer: target.layer,
      },
    };
  }

  return target.frontMatter.abstract
    ? undefined
    : {
        code: RequiresCode.ExtendsConcrete,
        details: {
          base,
        },
      };
};

// A layer that requires or extends nothing leaves the fields empty; the
// front-matter check reports a filled one, so this check skips those layers.
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
    extendsProblem(subject),
  ];

  return problems.flatMap((problem) =>
    problem === undefined
      ? []
      : [
          {
            ...problem,
            path: subject.block.passport.path,
          },
        ],
  );
};

const requiresCheck: Check<RequiresFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly RequiresFinding[] =>
  constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      graph,
    }),
  );

export type { RequiresDetails };
export { RequiresCode, requiresCheck };
