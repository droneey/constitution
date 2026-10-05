import { LAYER_RANK, LAYERS, Layer } from '#/kernel';

const requiresItsOwnLayer = (layer: Layer): boolean =>
  layer === Layer.Domain || layer === Layer.Implementation;

const requirableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) =>
      target !== Layer.Core &&
      (LAYER_RANK[target] < LAYER_RANK[layer] || (target === layer && requiresItsOwnLayer(layer))),
  );

const pairableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter((target) => target !== Layer.Core && LAYER_RANK[target] <= LAYER_RANK[layer]);

export { pairableBy, requirableBy };
