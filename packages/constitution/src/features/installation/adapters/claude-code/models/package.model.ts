import { z } from 'zod';

import { Version } from '#/kernel/value-objects';

interface PackageWire {
  readonly version: Version;
}

const packageModel: z.ZodType<PackageWire> = z.looseObject({
  version: z.string().refine(Version.is).transform(Version.create),
});

export type { PackageWire };
export { packageModel };
