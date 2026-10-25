import { z } from 'zod';

/** the site reads only the tagline, so the rest is let through */
export const brandModel = z.looseObject({
  tagline: z.string(),
});
