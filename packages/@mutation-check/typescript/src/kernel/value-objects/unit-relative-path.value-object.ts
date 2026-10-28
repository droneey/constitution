import { ValueFailure } from '../errors';
import type { Brand } from '../types';
import type { BrandedPath } from '../utils';
import { brandedPath, isFolderRelativePath } from '../utils';

/**
 * A path inside the unit's folder, which the check, Stryker and the specs run in, from that folder; an
 * empty one names the folder itself.
 */
type UnitRelativePath = Brand<string, 'UnitRelativePath'>;

const UnitRelativePath: BrandedPath<UnitRelativePath> = brandedPath({
  accepts: isFolderRelativePath,
  code: ValueFailure.UnitRelativePath,
});

export { UnitRelativePath };
