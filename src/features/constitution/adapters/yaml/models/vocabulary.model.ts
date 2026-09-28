import { z } from 'zod';

import type { Vocabulary } from '../../../domain/entities';

const words = z.array(z.string());

const vocabularyModel: z.ZodType<Vocabulary> = z.strictObject({
  architecture: z.strictObject({
    concepts: words,
    folders: words,
    suffixes: words,
  }),
});

export { vocabularyModel };
