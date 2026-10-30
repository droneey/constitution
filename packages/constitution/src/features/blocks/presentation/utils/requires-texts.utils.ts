import type { TextsOf } from '#/shared/cli';

import type { RequiresDetails } from '../../domain/services';
import { RequiresCode } from '../../domain/services';
import { aBlock, blocksOf } from './wording.utils';

const requiresTexts: TextsOf<RequiresDetails> = {
  [RequiresCode.RequiresCore]: () => 'requires core, which is always active',
  [RequiresCode.RequiresNoBlock]: ({ required }) => `requires ${required}, which is not a block`,
  [RequiresCode.RequiresItself]: () => 'requires itself',
  [RequiresCode.RequiresOutOfLayer]: ({ allowed, layer, required, requiredLayer }) =>
    `requires ${required}, ${aBlock(requiredLayer)}; ${aBlock(layer)} requires only ${blocksOf(allowed)}`,
  [RequiresCode.ExtendsNoBlock]: ({ base }) => `extends ${base}, which is not a block`,
  [RequiresCode.ExtendsItself]: () => 'extends itself',
  [RequiresCode.ExtendsOtherLayer]: ({ base, baseLayer }) =>
    `extends ${base}, ${aBlock(baseLayer)}; a block extends only a base of its own layer`,
  [RequiresCode.ExtendsConcrete]: ({ base }) =>
    `extends ${base}, a concrete block; a block extends only an abstract base — require it instead`,
};

export { requiresTexts };
