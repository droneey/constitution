import { z } from 'zod';

import type { FrontMatterFields } from '../../../domain/contracts';

// extends: null names no base, so the field is left out.
const frontMatterModel: z.ZodType<FrontMatterFields> = z
  .looseObject({
    abstract: z.boolean(),
    extends: z.string().nullable(),
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
