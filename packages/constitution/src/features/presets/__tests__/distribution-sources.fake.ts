import type { DistributionSources } from '../domain/contracts';

const createFakeDistributionSources = (
  builtFiles: readonly string[] = [],
): DistributionSources => ({
  builtFilesOf: (): ReadonlySet<string> => new Set(builtFiles),
});

export { createFakeDistributionSources };
