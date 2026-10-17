import { LAYER_RANK, LAYERS, Layer } from '#/kernel/constants';

// A block requires the layers above it, or a host of its own layer it builds on.
const requirableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) =>
      target !== Layer.Core && (LAYER_RANK[target] < LAYER_RANK[layer] || target === layer),
  );

const pairableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter((target) => target !== Layer.Core && LAYER_RANK[target] <= LAYER_RANK[layer]);

export { pairableBy, requirableBy };
