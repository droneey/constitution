import { z } from 'zod';

/** the site reads only the base it extends, and the Constitution's check holds the rest */
export const passportModel = z.looseObject({
  extends: z
    .string()
    .nullable()
    .transform((base) => base ?? undefined),
});
