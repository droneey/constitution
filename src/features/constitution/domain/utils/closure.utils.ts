import { LAYER_RANK, Layer } from '#/kernel';

import type { Block } from '../entities';

type BlocksById = ReadonlyMap<string, Block>;

interface Place {
  block: string;
  with: string | undefined;
}

const byIdOf = (blocks: readonly Block[]): BlocksById =>
  new Map(
    blocks.map((block) => [
      block.id,
      block,
    ]),
  );

const linksOf = (block: Block): readonly string[] => [
  ...block.frontMatter.requires,
  ...(block.frontMatter.extends === undefined
    ? []
    : [
        block.frontMatter.extends,
      ]),
];

const closureOf = (input: { blockId: string; byId: BlocksById }): ReadonlySet<string> => {
  const linksOfId = (id: string): readonly string[] => {
    const block = input.byId.get(id);

    return block === undefined ? [] : linksOf(block);
  };
  const seen = new Set<string>();
  const queue = [
    ...linksOfId(input.blockId),
  ];

  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (!seen.has(next) && next !== input.blockId) {
      seen.add(next);
      queue.push(...linksOfId(next));
    }
  }

  return seen;
};

const reachableFrom = (input: { byId: BlocksById; place: Place }): ReadonlySet<string> => {
  const seam = input.place.with;

  return new Set([
    input.place.block,
    ...closureOf({
      blockId: input.place.block,
      byId: input.byId,
    }),
    ...(seam === undefined
      ? []
      : [
          seam,
          ...closureOf({
            blockId: seam,
            byId: input.byId,
          }),
        ]),
  ]);
};

const mayReferTo = (input: { byId: BlocksById; from: Place; to: string }): boolean => {
  const source = input.byId.get(input.from.block);
  const target = input.byId.get(input.to);

  return (
    source !== undefined &&
    target !== undefined &&
    (LAYER_RANK[target.layer] < LAYER_RANK[source.layer] ||
      reachableFrom({
        byId: input.byId,
        place: input.from,
      }).has(target.id))
  );
};

// A rule carries out a parent only where the parent is active too: in core, or
// in a block its place reaches, and in a seam only when it reaches that seam's
// other block as well.
const mayCarryOut = (input: { byId: BlocksById; from: Place; to: Place }): boolean => {
  const source = input.byId.get(input.from.block);
  const target = input.byId.get(input.to.block);

  if (source === undefined || target === undefined) {
    return false;
  }

  if (target.layer === Layer.Core) {
    return true;
  }

  const reachable = reachableFrom({
    byId: input.byId,
    place: input.from,
  });

  return reachable.has(target.id) && (input.to.with === undefined || reachable.has(input.to.with));
};

export type { BlocksById, Place };
export { byIdOf, closureOf, linksOf, mayCarryOut, mayReferTo, reachableFrom };
