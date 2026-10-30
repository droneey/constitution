import { z } from 'zod';

export const brandModel = z.looseObject({
  tagline: z.string(),
});
