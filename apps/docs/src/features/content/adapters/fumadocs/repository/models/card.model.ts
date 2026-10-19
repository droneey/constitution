import { z } from 'zod';

/** a block card's front matter; the site reads only the base it extends, and the Constitution's check holds the rest */
export const cardModel = z.looseObject({
  extends: z
    .string()
    .nullable()
    .transform((base) => base ?? undefined),
});
