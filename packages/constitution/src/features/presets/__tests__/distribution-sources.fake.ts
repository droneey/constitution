import type { DistributionSources } from '../domain/contracts';

/** The same packages for whatever folder is asked. */
const createFakeDistributionSources = (
  packages: Readonly<Record<string, string>> = {},
): DistributionSources => ({
  packagesOf: (): ReadonlyMap<string, string> => new Map(Object.entries(packages)),
});

export { createFakeDistributionSources };
