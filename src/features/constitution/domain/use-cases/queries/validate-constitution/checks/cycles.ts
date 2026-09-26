import type { Finding } from '#/kernel';

import type { Block } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { linksOf } from '../closure.utils';

interface Search {
  block: Block;
  byId: BlocksById;
  explored: Set<string>;
  path: readonly string[];
  start: string;
}

const nextOf = (input: { block: Block; byId: BlocksById }): readonly Block[] =>
  linksOf(input.block).flatMap((id) => {
    const next = input.byId.get(id);

    return next === undefined ||
      next.id === input.block.id ||
      next.layer !== 'implementation'
      ? []
      : [
          next,
        ];
  });

// A block explored without reaching the start never reaches it by another
// path either, so it is not walked again from the same start.
const cycleFrom = (search: Search): readonly string[] | undefined => {
  for (const next of nextOf(search)) {
    if (next.id === search.start) {
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

  search.explored.add(search.block.id);

  return undefined;
};

const cyclesCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] => {
  const reported = new Set<string>();

  return constitution.blocks
    .filter((block) => block.layer === 'implementation')
    .flatMap((block) => {
      const cycle = reported.has(block.id)
        ? undefined
        : cycleFrom({
            block,
            byId,
            explored: new Set(),
            path: [
              block.id,
            ],
            start: block.id,
          });

      if (cycle === undefined) {
        return [];
      }

      for (const id of cycle) {
        reported.add(id);
      }

      return [
        {
          message: `is part of a dependency cycle: ${cycle.join(' → ')}`,
          path: block.path,
        },
      ];
    });
};

export { cyclesCheck };
