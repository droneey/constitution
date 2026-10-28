import type { Brand } from '#/kernel/types';
import type { BrandedPath } from '#/kernel/utils';
import { brandedPath, isFolderRelativePath } from '#/kernel/utils';

enum RepositoryPathFailure {
  NotRelative = 'repository-path-not-relative',
}

/** A path from the repository's folder, as git names a file there; an empty one names the folder. */
type RepositoryRelativePath = Brand<string, 'RepositoryRelativePath'>;

const RepositoryRelativePath: BrandedPath<RepositoryRelativePath> = brandedPath({
  accepts: isFolderRelativePath,
  code: RepositoryPathFailure.NotRelative,
});

export { RepositoryPathFailure, RepositoryRelativePath };
