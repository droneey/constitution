import { z } from 'zod';

import type { FrontMatterFields } from '../../../domain/contracts';

const frontMatterModel: z.ZodType<FrontMatterFields> = z.looseObject({
  abstract: z.boolean(),
  dictionary: z.array(z.string()),
  extends: z
    .string()
    .nullable()
    .transform((base) => base ?? undefined),
  governs: z.array(z.string()),
  id: z.string(),
  languages: z.array(z.string()),
  requires: z.array(z.string()),
  summary: z.string(),
});

export { frontMatterModel };
