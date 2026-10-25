import { Layer } from '#/kernel/constants';

import { ConfigKey } from '../../../../../../../entities';

// The layers constitution.yaml lists blocks of; core, always active, is listed under no key.
type ListedLayer = Exclude<Layer, Layer.Core>;

// The key of constitution.yaml that lists each layer's blocks.
const LAYER_KEYS = {
  [Layer.Domain]: ConfigKey.Domains,
  [Layer.Implementation]: ConfigKey.Implementations,
  [Layer.Language]: ConfigKey.Languages,
  [Layer.Platform]: ConfigKey.Platforms,
} as const satisfies Readonly<Record<ListedLayer, ConfigKey>>;

export type { ListedLayer };
export { LAYER_KEYS };
