import { z } from 'zod';

const VERSION = /^\d+\.\d+\.\d+$/;

export const versionsModel = z.object({
  latest: z.string().regex(VERSION),
  versions: z.array(z.string().regex(VERSION)).readonly(),
});
