import { z } from 'zod';

const SLUG = /^[a-z0-9-]+$/;
const BLOCK_ID =
  /^(core|(languages|concerns|spheres|frameworks|stacks)\/[a-z0-9-]+)$/;

const blockIdSchema = z.string().regex(BLOCK_ID);

const blockManifestSchema = z.strictObject({
  chapters: z.record(z.string().regex(/^[a-z-]+$/), z.string().min(1)),
  kind: z.enum([
    'core',
    'language',
    'concern',
    'sphere',
    'framework',
    'stack',
  ]),
  name: z.string().regex(SLUG),
  refines: z.array(blockIdSchema).default([]),
  requires: z.array(blockIdSchema).default([]),
  summary: z.string().min(1),
  templates: z.record(z.string().regex(SLUG), z.string().min(1)).optional(),
});

const assemblyManifestSchema = z.strictObject({
  blocks: z.array(blockIdSchema).min(1),
  name: z.string().regex(SLUG),
  sphere: z.string().regex(SLUG),
});

type BlockManifest = z.infer<typeof blockManifestSchema>;
type AssemblyManifest = z.infer<typeof assemblyManifestSchema>;

export type { AssemblyManifest, BlockManifest };
export { assemblyManifestSchema, blockManifestSchema };
