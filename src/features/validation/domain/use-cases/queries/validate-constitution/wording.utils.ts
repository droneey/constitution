import type { Block } from '#/features/constitution';
import type { Layer } from '#/kernel';

const VOWEL = /^[aeiou]/;

const aBlock = (layer: Layer): string =>
  `${VOWEL.test(layer) ? 'an' : 'a'} ${layer} block`;

const blocksOf = (layers: readonly Layer[]): string => {
  const names = layers.map((layer) => `${layer} blocks`);
  const last = names.at(-1) ?? 'nothing';

  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} or ${last}`
    : last;
};

const mainPathOf = (block: Block): string => block.files[0]?.path ?? block.dir;

export { aBlock, blocksOf, mainPathOf };
