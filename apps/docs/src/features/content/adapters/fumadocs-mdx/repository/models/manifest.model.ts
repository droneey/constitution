import { z } from 'zod';

export const manifestModel = z.looseObject({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});
