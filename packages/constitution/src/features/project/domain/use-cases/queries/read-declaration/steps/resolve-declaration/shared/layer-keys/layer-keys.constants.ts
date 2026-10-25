import { Layer } from '#/kernel/constants';

// The key of constitution.yaml that lists each layer's blocks; core, always active, has none.
const LAYER_KEYS: readonly (readonly [
  string,
  Layer,
])[] = [
  [
    'domains',
    Layer.Domain,
  ],
  [
    'platforms',
    Layer.Platform,
  ],
  [
    'languages',
    Layer.Language,
  ],
  [
    'implementations',
    Layer.Implementation,
  ],
] as const;

export { LAYER_KEYS };
