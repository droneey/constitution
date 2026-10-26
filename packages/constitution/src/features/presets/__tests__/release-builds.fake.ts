import type { ReleaseBuilds } from '../domain/contracts';

/** The same builds for whatever folder is asked. */
const createFakeReleaseBuilds = (builds: Readonly<Record<string, string>> = {}): ReleaseBuilds => ({
  sourcesOf: (): ReadonlyMap<string, string> => new Map(Object.entries(builds)),
});

export { createFakeReleaseBuilds };
