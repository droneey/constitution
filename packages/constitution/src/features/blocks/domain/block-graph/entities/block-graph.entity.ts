import { LAYER_RANK, Layer } from '#/kernel/constants';
import { BlockId } from '#/kernel/value-objects';

import type { BlockPlace } from '../../block/entities';
import { Block } from '../../block/entities';

type BlockGraph = ReadonlyMap<BlockId, Block>;

const createGraph = (blocks: readonly Block[]): BlockGraph =>
  new Map(
    blocks.map((block) => [
      block.id,
      block,
    ]),
  );

const named = (graph: BlockGraph, name: string): Block | undefined =>
  BlockId.is(name) ? graph.get(name) : undefined;

const closureOf = (graph: BlockGraph, blockId: BlockId): ReadonlySet<BlockId> => {
  const linksOfId = (id: BlockId): readonly BlockId[] => {
    const block = graph.get(id);

    return block === undefined ? [] : Block.linksOf(block);
  };

  const seen = new Set<BlockId>();
  const queue = [
    ...linksOfId(blockId),
  ];

  for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
    if (!seen.has(next) && next !== blockId) {
      seen.add(next);
      queue.push(...linksOfId(next));
    }
  }

  return seen;
};

const reachableFrom = (graph: BlockGraph, place: BlockPlace): ReadonlySet<BlockId> => {
  const { seam } = place;

  return new Set([
    place.block,
    ...closureOf(graph, place.block),
    ...(seam === undefined
      ? []
      : [
          seam,
          ...closureOf(graph, seam),
        ]),
  ]);
};

const mayReferTo = (
  graph: BlockGraph,
  input: {
    from: BlockPlace;
    to: BlockId;
  },
): boolean => {
  const source = graph.get(input.from.block);
  const target = graph.get(input.to);

  return (
    source !== undefined &&
    target !== undefined &&
    (LAYER_RANK[target.layer] < LAYER_RANK[source.layer] ||
      reachableFrom(graph, input.from).has(target.id))
  );
};

const mayCarryOut = (
  graph: BlockGraph,
  input: {
    from: BlockPlace;
    to: BlockPlace;
  },
): boolean => {
  const source = graph.get(input.from.block);
  const target = graph.get(input.to.block);

  if (source === undefined || target === undefined) {
    return false;
  }

  if (target.layer === Layer.Core) {
    return true;
  }

  const reachable = reachableFrom(graph, input.from);

  return reachable.has(target.id) && (input.to.seam === undefined || reachable.has(input.to.seam));
};

const BlockGraph = {
  closureOf,
  create: createGraph,
  mayCarryOut,
  mayReferTo,
  named,
  reachableFrom,
} as const;

export { BlockGraph };
