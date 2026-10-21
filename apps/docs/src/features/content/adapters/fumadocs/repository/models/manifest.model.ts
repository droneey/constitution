import { z } from 'zod';

/** the Constitution's package.json; the site reads only its version, so the rest is let through */
export const manifestModel = z.looseObject({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});
