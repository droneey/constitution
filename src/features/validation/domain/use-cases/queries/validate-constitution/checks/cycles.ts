import type { Block, Constitution } from '#/features/constitution';
import type { Finding } from '#/kernel';

import type { Check } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { byIdOf } from '../closure.utils';
import { mainPathOf } from '../wording.utils';

type Path = readonly [
  string,
  ...string[],
];

const edgesOf = (input: {
  block: Block;
  byId: BlocksById;
}): readonly string[] =>
  [
    ...input.block.frontMatter.requires,
    ...(input.block.frontMatter.extends === null
      ? []
      : [
          input.block.frontMatter.extends,
        ]),
  ].filter(
    (id) =>
      id !== input.block.id && input.byId.get(id)?.layer === 'implementation',
  );

const cycleFrom = (input: {
  byId: BlocksById;
  path: Path;
}): readonly string[] | undefined => {
  const block = input.byId.get(input.path.at(-1) ?? input.path[0]);
  const edges =
    block === undefined
      ? []
      : edgesOf({
          block,
          byId: input.byId,
        });

  for (const next of edges) {
    if (next === input.path[0]) {
      return [
        ...input.path,
        next,
      ];
    }

    const found = input.path.includes(next)
      ? undefined
      : cycleFrom({
          byId: input.byId,
          path: [
            ...input.path,
            next,
          ],
        });

    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
};

const cyclesCheck: Check = (constitution: Constitution): readonly Finding[] => {
  const byId = byIdOf(constitution.blocks);
  const reported = new Set<string>();

  return constitution.blocks
    .filter((block) => block.layer === 'implementation')
    .flatMap((block) => {
      const cycle = reported.has(block.id)
        ? undefined
        : cycleFrom({
            byId,
            path: [
              block.id,
            ],
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
          path: mainPathOf(block),
        },
      ];
    });
};

export { cyclesCheck };
