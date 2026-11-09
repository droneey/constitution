import type { TextsOf } from '#/shared/cli';

import type { RequiresDetails } from '../../domain/validate-constitution/services';
import { RequiresCode } from '../../domain/validate-constitution/services';
import { aBlock, blocksOf } from './wording.utils';

const requiresTexts: TextsOf<RequiresDetails> = {
  [RequiresCode.RequiresCore]: () => 'requires core, which is always active',
  [RequiresCode.RequiresNoBlock]: ({ required }) => `requires ${required}, which is not a block`,
  [RequiresCode.RequiresItself]: () => 'requires itself',
  [RequiresCode.RequiresOutOfLayer]: ({ allowed, layer, required, requiredLayer }) =>
    `requires ${required}, ${aBlock(requiredLayer)}; ${aBlock(layer)} requires only ${blocksOf(allowed)}`,
  [RequiresCode.RequiresAncestor]: ({ required }) =>
    `requires ${required}, which it sits under; a block's folder already turns its parent on`,
  [RequiresCode.RequiresThroughParent]: ({ parent, required }) =>
    `requires ${required}, which its parent ${parent} already turns on; a passport lists only what its block needs beyond the blocks it sits under`,
};

export { requiresTexts };
