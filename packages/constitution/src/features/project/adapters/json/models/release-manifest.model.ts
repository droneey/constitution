import { z } from 'zod';

import { Version } from '#/kernel/value-objects';

interface ReleaseManifestWire {
  readonly constitutionFormat?: number | undefined;
  readonly version?: Version | undefined;
}

const releaseManifestModel: z.ZodType<ReleaseManifestWire> = z.looseObject({
  constitutionFormat: z.int().optional(),
  version: z.string().refine(Version.is).optional(),
});

export { releaseManifestModel };
