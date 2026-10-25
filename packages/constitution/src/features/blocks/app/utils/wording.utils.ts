import type { Layer } from '#/kernel/constants';
import { LAYER_ARTICLE } from '#/kernel/constants';

const aBlock = (layer: Layer): string => `${LAYER_ARTICLE[layer]} ${layer} block`;

const blocksOf = (layers: readonly Layer[]): string => {
  const names = layers.map((layer) => `${layer} blocks`);

  return names.length > 1
    ? `${names.slice(0, -1).join(', ')} or ${names.at(-1)}`
    : // Stryker disable next-line StringLiteral: one name or none needs no separator
      names.join('');
};

export { aBlock, blocksOf };
