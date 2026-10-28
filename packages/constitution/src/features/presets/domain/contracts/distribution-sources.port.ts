import type { AbsolutePath } from '#/kernel/value-objects';

interface DistributionSources {
  /** Each file the release's distribution packs from a package that builds it, by its path in it. */
  readonly builtFilesOf: (releaseFolderPath: AbsolutePath) => ReadonlySet<string>;
}

export type { DistributionSources };
