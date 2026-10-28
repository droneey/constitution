import { z } from 'zod';

export const passportModel = z.looseObject({
  extends: z
    .string()
    .nullable()
    .transform((base) => base ?? undefined),
});
