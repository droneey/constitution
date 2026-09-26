import type { Layer } from '#/kernel';

const VOWEL = /^[aeiou]/;

const aBlock = (layer: Layer): string =>
  `${VOWEL.test(layer) ? 'an' : 'a'} ${layer} block`;

const blocksOf = (layers: readonly Layer[]): string => {
  const names = layers.map((layer) => `${layer} blocks`);

  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} or ${names.at(-1) ?? ''}`
    : names.join('');
};

export { aBlock, blocksOf };
