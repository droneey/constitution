import { z } from 'zod';

/**
 * A package.json as far as its workspace goes: the globs of its members, as a list or, as Yarn
 * writes them, under packages.
 */
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
