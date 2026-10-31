import type { AbsolutePath } from '#/kernel/value-objects';

interface DistributionSources {
  readonly builtFilesOf: (releaseFolderPath: AbsolutePath) => ReadonlySet<string>;
}

export type { DistributionSources };
