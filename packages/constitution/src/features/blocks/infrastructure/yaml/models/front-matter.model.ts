import { z } from 'zod';

import type { FrontMatterFields } from '../../../domain/block/entities';

const frontMatterModel: z.ZodType<FrontMatterFields> = z.looseObject({
  governs: z.array(z.string()),
  id: z.string(),
  languages: z.array(z.string()),
  requires: z.array(z.string()),
  summary: z.string(),
});

export { frontMatterModel };
