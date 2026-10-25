import { z } from 'zod';

export const versionsModel = z.object({
  latest: z.string(),
  versions: z.array(z.string()).readonly(),
});
