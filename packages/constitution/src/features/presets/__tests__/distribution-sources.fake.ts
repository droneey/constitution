import type { DistributionSources } from '../domain/contracts';

/** The same built files for whatever folder is asked. */
const createFakeDistributionSources = (
  builtFiles: readonly string[] = [],
): DistributionSources => ({
  builtFilesOf: (): ReadonlySet<string> => new Set(builtFiles),
});

export { createFakeDistributionSources };
