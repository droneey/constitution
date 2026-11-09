import { Axis, LAYER_RANK, LAYERS, Layer } from '#/kernel/constants';

interface AxisReach {
  readonly from: Axis;
  readonly to: Axis;
}

const requirableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) =>
      target !== Layer.Core && (LAYER_RANK[target] < LAYER_RANK[layer] || target === layer),
  );

const pairableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter((target) => target !== Layer.Core && LAYER_RANK[target] <= LAYER_RANK[layer]);

const mayReachAxis = (reach: AxisReach): boolean =>
  reach.to === reach.from || reach.to === Axis.Foundation;

export { mayReachAxis, pairableBy, requirableBy };
