import { Layer } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';

import type { BlockGraph } from '../../../entities';
import { Block } from '../../../entities';
import type { Check, CheckInput } from '../check.types';

enum CyclesCode {
  Cycle = 'dependency-cycle',
}

interface CyclesDetails {
  readonly [CyclesCode.Cycle]: {
    readonly cycle: readonly BlockId[];
  };
}

type CyclesFinding = FindingOf<CyclesDetails>;

interface Search {
  readonly block: Block;
  readonly explored: Set<BlockId>;
  readonly graph: BlockGraph;
  readonly path: readonly BlockId[];
  readonly start: BlockId;
}

const nextOf = (input: { block: Block; graph: BlockGraph }): readonly Block[] =>
  Block.linksOf(input.block).flatMap((id) => {
    const next = input.graph.get(id);

    return next === undefined ||
      Block.sameAs(next, input.block) ||
      next.layer !== Layer.Implementation
      ? []
      : [
          next,
        ];
  });

// Why: a block explored without reaching the start never reaches it by another path either.
const cycleFrom = (search: Search): readonly BlockId[] | undefined => {
  for (const next of nextOf(search)) {
    if (BlockId.equals(next.id, search.start)) {
      return [
        ...search.path,
        next.id,
      ];
    }

    const found =
      search.path.includes(next.id) || search.explored.has(next.id)
        ? undefined
        : cycleFrom({
            ...search,
            block: next,
            path: [
              ...search.path,
              next.id,
            ],
          });

    if (found !== undefined) {
      return found;
    }
  }

  // Stryker disable next-line CallExpression: the set only spares a second walk; the cycle found is the same
  search.explored.add(search.block.id);

  return undefined;
};

const cyclesCheck: Check<CyclesFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly CyclesFinding[] => {
  const findings: CyclesFinding[] = [];

  for (const block of constitution.blocks) {
    const isReported = findings.some(({ details }) => details.cycle.includes(block.id));
    const cycle = isReported
      ? undefined
      : cycleFrom({
          block,
          graph,
          explored: new Set(),
          path: [
            block.id,
          ],
          start: block.id,
        });

    if (cycle !== undefined) {
      findings.push({
        code: CyclesCode.Cycle,
        details: {
          cycle,
        },
        path: block.passport.path,
      });
    }
  }

  return findings;
};

export type { CyclesDetails };
export { CyclesCode, cyclesCheck };
