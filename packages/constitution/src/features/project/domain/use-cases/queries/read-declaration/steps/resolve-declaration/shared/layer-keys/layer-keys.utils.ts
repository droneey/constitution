import { LAYERS, Layer } from '#/kernel/constants';

import type { ConfigKey } from '../../../../../../../entities';
import type { ListedLayer } from './layer-keys.constants';
import { LAYER_KEYS } from './layer-keys.constants';

const layerByKey: ReadonlyMap<string, ListedLayer> = new Map(
  // Stryker disable next-line ConditionalExpression,MethodExpression: core's key would be undefined, which no key of a file is
  LAYERS.filter((layer): layer is ListedLayer => layer !== Layer.Core).map((layer) => [
    LAYER_KEYS[layer],
    layer,
  ]),
);

const keyOfLayer = (layer: ListedLayer): ConfigKey => LAYER_KEYS[layer];

const layerOfKey = (key: string): ListedLayer | undefined => layerByKey.get(key);

export { keyOfLayer, layerOfKey };
