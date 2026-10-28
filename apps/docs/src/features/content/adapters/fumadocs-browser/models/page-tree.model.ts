import { z } from 'zod';

/** the tree of the pages as Fumadocs' loader serializes it, its nodes left to `useFumadocsLoader` */
export const pageTreeModel = z.object({
  // biome-ignore lint/style/useNamingConvention: Fumadocs marks a serialized page tree by this key
  $fumadocs_loader: z.literal('page-tree'),
  data: z.looseObject({}),
});
