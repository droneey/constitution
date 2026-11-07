import { z } from 'zod';

import type { FrontMatterFields } from '../../../domain/block/entities';

const frontMatterModel: z.ZodType<FrontMatterFields> = z
  .looseObject({
    abstract: z.boolean().default(false),
    extends: z.string().nullable().default(null),
    governs: z.array(z.string()),
    id: z.string(),
    languages: z.array(z.string()),
    requires: z.array(z.string()),
    summary: z.string(),
  })
  .transform(({ extends: base, ...fields }) => ({
    ...fields,
    ...(base === null
      ? {}
      : {
          extends: base,
        }),
  }));

export { frontMatterModel };
