import { Axis, LAYER_RANK, LAYERS, Layer } from '#/kernel/constants';

/** A reference made on one axis to a rule or a term of another. */
interface AxisReach {
  readonly from: Axis;
  readonly to: Axis;
}

/** A block requires the layers above it, or a host of its own layer it builds on. */
const requirableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter(
    (target) =>
      target !== Layer.Core && (LAYER_RANK[target] < LAYER_RANK[layer] || target === layer),
  );

/** A seam pairs a block with one of its own layer or of a layer above it. */
const pairableBy = (layer: Layer): readonly Layer[] =>
  LAYERS.filter((target) => target !== Layer.Core && LAYER_RANK[target] <= LAYER_RANK[layer]);

/** A reference stays on its own axis or reaches foundation, which every project follows. */
const mayReachAxis = (reach: AxisReach): boolean =>
  reach.to === reach.from || reach.to === Axis.Foundation;

export { mayReachAxis, pairableBy, requirableBy };
