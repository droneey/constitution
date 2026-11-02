import type { DistributionSources } from '../application/contracts';

const createFakeDistributionSources = (
  builtFiles: readonly string[] = [],
): DistributionSources => ({
  builtFilesOf: (): ReadonlySet<string> => new Set(builtFiles),
});

export { createFakeDistributionSources };
