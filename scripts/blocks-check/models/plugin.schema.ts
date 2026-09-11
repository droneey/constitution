import { z } from 'zod';

const RELATIVE_DIRECTORY = /^\.\/.*\/$/;

const pluginManifestSchema = z.looseObject({
  name: z.string().regex(/^[a-z0-9-]+$/),
  skills: z
    .union([
      z.string().regex(RELATIVE_DIRECTORY),
      z.array(z.string().regex(RELATIVE_DIRECTORY)),
    ])
    .optional(),
});

const marketplaceManifestSchema = z.looseObject({
  name: z.string().min(1),
  plugins: z
    .array(
      z.looseObject({
        name: z.string().min(1),
        source: z.string().min(1),
      }),
    )
    .min(1),
});

const hooksManifestSchema = z.looseObject({
  hooks: z.record(
    z.string(),
    z.array(
      z.looseObject({
        hooks: z.array(
          z.looseObject({
            command: z.string().optional(),
          }),
        ),
      }),
    ),
  ),
});

type PluginManifest = z.infer<typeof pluginManifestSchema>;
type MarketplaceManifest = z.infer<typeof marketplaceManifestSchema>;
type HooksManifest = z.infer<typeof hooksManifestSchema>;

export type { HooksManifest, MarketplaceManifest, PluginManifest };
export { hooksManifestSchema, marketplaceManifestSchema, pluginManifestSchema };
