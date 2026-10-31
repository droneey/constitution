import { z } from 'zod';

export const pageCatalogModel = z.record(
  z.string(),
  z.object({
    collection: z.string(),
    description: z.string(),
    path: z.string(),
    title: z.string(),
  }),
);
