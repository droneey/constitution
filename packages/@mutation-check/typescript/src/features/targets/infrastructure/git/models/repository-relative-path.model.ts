import type { Brand } from '#/kernel/types';
import type { BrandedPath } from '#/kernel/utils';
import { brandedPath, isFolderRelativePath } from '#/kernel/utils';

enum RepositoryPathFailure {
  NotRelative = 'repository-path-not-relative',
}

type RepositoryRelativePath = Brand<string, 'RepositoryRelativePath'>;

const RepositoryRelativePath: BrandedPath<RepositoryRelativePath> = brandedPath({
  accepts: isFolderRelativePath,
  refusalCode: RepositoryPathFailure.NotRelative,
});

export { RepositoryPathFailure, RepositoryRelativePath };
