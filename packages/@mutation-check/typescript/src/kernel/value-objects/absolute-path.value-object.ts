import { ValueFailure } from '../errors';
import type { Brand } from '../types';
import type { BrandedPath } from '../utils';
import { brandedPath, isAbsolutePath } from '../utils';

type AbsolutePath = Brand<string, 'AbsolutePath'>;

const AbsolutePath: BrandedPath<AbsolutePath> = brandedPath({
  accepts: isAbsolutePath,
  code: ValueFailure.AbsolutePath,
});

export { AbsolutePath };
