import { z } from 'zod';

/** the Constitution's package.json; the site reads only the release it is built from */
export const manifestModel = z.looseObject({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
});
