import type { Layer } from '#/kernel/constants';

import { LAYER_KEYS } from './layer-keys.constants';

const keyByLayer: ReadonlyMap<Layer, string> = new Map(
  LAYER_KEYS.map(([key, layer]) => [
    layer,
    key,
  ]),
);
const layerByKey: ReadonlyMap<string, Layer> = new Map(LAYER_KEYS);

// Stryker disable next-line StringLiteral: core, the one layer no key lists, is always active, so no warning names its key
const keyOfLayer = (layer: Layer): string => keyByLayer.get(layer) ?? '';

const layerOfKey = (key: string): Layer | undefined => layerByKey.get(key);

export { keyOfLayer, layerOfKey };
