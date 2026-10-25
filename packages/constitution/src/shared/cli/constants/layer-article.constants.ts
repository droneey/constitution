import { Layer } from '#/kernel/constants';

const LAYER_ARTICLE = {
  [Layer.Core]: 'a',
  [Layer.Domain]: 'a',
  [Layer.Implementation]: 'an',
  [Layer.Language]: 'a',
  [Layer.Platform]: 'a',
} as const satisfies Readonly<Record<Layer, string>>;

export { LAYER_ARTICLE };
