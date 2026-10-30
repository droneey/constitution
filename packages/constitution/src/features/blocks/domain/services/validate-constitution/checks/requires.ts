import type { Layer } from '#/kernel/constants';
import { BlockModel } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { BlockId, coreBlockId } from '#/kernel/value-objects';

import type { Block } from '../../../entities';
import { requirableBy } from '../../../entities';
import { findingsAt } from '../../../utils';
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
  readonly model: BlockModel;
}

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

  const target = BlockModel.blockOf(subject.model, base);

  if (target === undefined) {
    return {
      code: RequiresCode.ExtendsNoBlock,
      details: {
        base,
      },
    };
  }

  if (BlockId.equals(target.id, subject.block.id)) {
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

  return BlockModel.isExtensible(subject.model, base)
    ? undefined
    : {
        code: RequiresCode.ExtendsConcrete,
        details: {
          base,
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
    extendsProblem(subject),
  ];

  return findingsAt(subject.block.passport.path, problems);
};

const requiresCheck: Check<RequiresFinding> = ({
  constitution,
  model,
}: CheckInput): readonly RequiresFinding[] =>
  constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      model,
    }),
  );

export type { RequiresDetails };
export { RequiresCode, requiresCheck };
