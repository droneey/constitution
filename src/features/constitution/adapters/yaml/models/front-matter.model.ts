import { z } from 'zod';

import type { FrontMatterFields } from '../../../domain/contracts';

const frontMatterModel: z.ZodType<FrontMatterFields> = z.looseObject({
  abstract: z.boolean(),
  checks: z.array(z.string()),
  dictionary: z.array(z.string()),
  extends: z
    .string()
    .nullable()
    .transform((value) => value ?? undefined),
  governs: z.array(z.string()),
  id: z.string(),
  languages: z.array(z.string()),
  requires: z.array(z.string()),
  roles: z.array(z.string()),
  summary: z.string(),
});

export { frontMatterModel };
