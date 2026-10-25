import type { Layer } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';
import { BlockId, coreBlockId } from '#/kernel/value-objects';

import type { BlockGraph } from '../../../../entities';
import { Block } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { requirableBy } from '../shared/layers';
import { aBlock, blocksOf } from '../shared/wording';

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

interface Subject {
  readonly block: Block;
  readonly graph: BlockGraph;
}

const requireProblem = (
  input: Subject & {
    allowed: readonly Layer[];
    id: BlockId;
  },
): Problem | undefined => {
  const target = input.graph.get(input.id);

  if (BlockId.equals(input.id, coreBlockId)) {
    return {
      code: RequiresCode.RequiresCore,
      message: 'requires core, which is always active',
    };
  }

  if (target === undefined) {
    return {
      code: RequiresCode.RequiresNoBlock,
      message: `requires ${input.id}, which is not a block`,
    };
  }

  if (Block.sameAs(target, input.block)) {
    return {
      code: RequiresCode.RequiresItself,
      message: 'requires itself',
    };
  }

  return input.allowed.includes(target.layer)
    ? undefined
    : {
        code: RequiresCode.RequiresOutOfLayer,
        message: `requires ${input.id}, ${aBlock(target.layer)}; ${aBlock(input.block.layer)} requires only ${blocksOf(input.allowed)}`,
      };
};

const extendsProblem = (subject: Subject): Problem | undefined => {
  const base = subject.block.frontMatter.extends;

  if (base === undefined) {
    return undefined;
  }

  const target = subject.graph.get(base);

  if (target === undefined) {
    return {
      code: RequiresCode.ExtendsNoBlock,
      message: `extends ${base}, which is not a block`,
    };
  }

  if (Block.sameAs(target, subject.block)) {
    return {
      code: RequiresCode.ExtendsItself,
      message: 'extends itself',
    };
  }

  if (target.layer !== subject.block.layer) {
    return {
      code: RequiresCode.ExtendsOtherLayer,
      message: `extends ${base}, ${aBlock(target.layer)}; a block extends only a base of its own layer`,
    };
  }

  return target.frontMatter.abstract
    ? undefined
    : {
        code: RequiresCode.ExtendsConcrete,
        message: `extends ${base}, a concrete block; a block extends only an abstract base — require it instead`,
      };
};

// A layer that requires or extends nothing leaves the fields empty; the
// front-matter check reports a filled one, so this check skips those layers.
const blockFindings = (subject: Subject): readonly Finding[] => {
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

const requiresCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] =>
  constitution.blocks.flatMap((block) =>
    blockFindings({
      block,
      graph,
    }),
  );

export { requiresCheck };
