import { z } from 'zod';

// Why: Yarn writes the members' globs under packages, the others as a list.
const packageManifestModel = z.looseObject({
  workspaces: z
    .union([
      z.array(z.string()),
      z.looseObject({
        packages: z.array(z.string()).optional(),
      }),
    ])
    .optional(),
});

type PackageManifestWire = z.infer<typeof packageManifestModel>;

export type { PackageManifestWire };
export { packageManifestModel };
