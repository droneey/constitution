import { z } from 'zod';

import type { FrontMatterFields } from '../../../domain/contracts';

const frontMatterModel: z.ZodType<FrontMatterFields> = z.looseObject({
  abstract: z.boolean(),
  chapters: z.array(z.string()),
  checks: z.array(z.string()),
  extends: z.string().nullable(),
  governs: z.array(z.string()),
  id: z.string(),
  kind: z.string(),
  owns: z.array(z.string()),
  requires: z.array(z.string()),
  status: z.string(),
  summary: z.string(),
});

export { frontMatterModel };
