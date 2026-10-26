import { z } from 'zod';

const releaseBuildModel = z.looseObject({
  from: z.string(),
});

// The manifest's other fields are the package manager's.
const releaseManifestModel = z.looseObject({
  release: z.record(z.string(), releaseBuildModel).optional(),
});

type ReleaseManifestWire = z.infer<typeof releaseManifestModel>;

export type { ReleaseManifestWire };
export { releaseManifestModel };
