import { ValueFailure } from '../errors';
import type { Brand } from '../types';
import type { BrandedPath } from '../utils';
import { brandedPath, isFolderRelativePath } from '../utils';

type UnitRelativePath = Brand<string, 'UnitRelativePath'>;

const UnitRelativePath: BrandedPath<UnitRelativePath> = brandedPath({
  accepts: isFolderRelativePath,
  refusalCode: ValueFailure.UnitRelativePath,
});

export { UnitRelativePath };
