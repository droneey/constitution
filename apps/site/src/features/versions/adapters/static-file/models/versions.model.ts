import { z } from 'zod';

const VERSION = /^\d+\.\d+\.\d+$/;

/** versions.json as the site publishes it beside every release */
export const versionsModel = z.object({
  latest: z.string().regex(VERSION),
  versions: z.array(z.string().regex(VERSION)).readonly(),
});
