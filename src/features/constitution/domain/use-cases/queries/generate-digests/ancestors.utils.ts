import type { BlocksById } from '../../../utils';

// The extends chain, nearest base first; a cycle ends it, and the cycles check
// reports the cycle.
const ancestorsOf = (input: {
  blockId: string;
  byId: BlocksById;
}): readonly string[] => {
  const chain: string[] = [];

  for (
    let base: string | null =
      input.byId.get(input.blockId)?.frontMatter.extends ?? null;
    base !== null && base !== input.blockId && !chain.includes(base);
    base = input.byId.get(base)?.frontMatter.extends ?? null
  ) {
    chain.push(base);
  }

  return chain;
};

export { ancestorsOf };
