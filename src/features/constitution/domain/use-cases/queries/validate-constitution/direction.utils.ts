import type { Layer } from '#/kernel';
import { LAYER_RANK, LAYERS } from '#/kernel';

const requirableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) =>
      target !== 'core' &&
      (LAYER_RANK[target] < LAYER_RANK[layer] || layer === 'implementation'),
  );

const pairableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) => target !== 'core' && LAYER_RANK[target] <= LAYER_RANK[layer],
  );

export { pairableBy, requirableBy };
