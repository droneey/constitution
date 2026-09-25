import type { Block, BlockFile } from '#/features/constitution';
import { LAYER_RANK } from '#/kernel';

type BlocksById = ReadonlyMap<string, Block>;

const byIdOf = (blocks: readonly Block[]): BlocksById =>
  new Map(
    blocks.map((block) => [
      block.id,
      block,
    ]),
  );

const linksOf = (block: Block | undefined): readonly string[] =>
  block === undefined
    ? []
    : [
        ...block.frontMatter.requires,
        ...(block.frontMatter.extends === null
          ? []
          : [
              block.frontMatter.extends,
            ]),
      ];

const closureOf = (input: {
  blockId: string;
  byId: BlocksById;
}): ReadonlySet<string> => {
  const seen = new Set<string>();
  const queue = [
    ...linksOf(input.byId.get(input.blockId)),
  ];

  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (!seen.has(next) && next !== input.blockId) {
      seen.add(next);
      queue.push(...linksOf(input.byId.get(next)));
    }
  }

  return seen;
};

const mayReferTo = (input: {
  byId: BlocksById;
  file: BlockFile;
  from: Block;
  to: string;
}): boolean => {
  const target = input.byId.get(input.to);

  if (target === undefined || target.id === input.from.id) {
    return false;
  }

  if (LAYER_RANK[target.layer] < LAYER_RANK[input.from.layer]) {
    return true;
  }

  const seam = input.file.with;
  const reachable = new Set([
    ...closureOf({
      blockId: input.from.id,
      byId: input.byId,
    }),
    ...(seam === null
      ? []
      : [
          seam,
          ...closureOf({
            blockId: seam,
            byId: input.byId,
          }),
        ]),
  ]);

  return reachable.has(target.id);
};

export type { BlocksById };
export { byIdOf, closureOf, mayReferTo };
