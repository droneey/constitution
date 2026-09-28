import { LAYER_RANK, LAYERS, Layer } from '#/kernel';

const requirableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) =>
      target !== Layer.Core &&
      (LAYER_RANK[target] < LAYER_RANK[layer] ||
        layer === Layer.Implementation),
  );

const pairableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) =>
      target !== Layer.Core && LAYER_RANK[target] <= LAYER_RANK[layer],
  );

export { pairableBy, requirableBy };
