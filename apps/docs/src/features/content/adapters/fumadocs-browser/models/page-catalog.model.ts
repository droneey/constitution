import { z } from 'zod';

/** the pages the site's server exported, by their slugs joined with `/` */
export const pageCatalogModel = z.record(
  z.string(),
  z.object({
    collection: z.string(),
    description: z.string(),
    path: z.string(),
    title: z.string(),
  }),
);
