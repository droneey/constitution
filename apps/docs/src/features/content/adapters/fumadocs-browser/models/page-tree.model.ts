import { z } from 'zod';

export const pageTreeModel = z.object({
  // biome-ignore lint/style/useNamingConvention: Fumadocs marks a serialized page tree by this key
  $fumadocs_loader: z.literal('page-tree'),
  data: z.looseObject({}),
});
