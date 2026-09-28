import { z } from 'zod';

import type { Vocabulary } from '../../../domain/entities';

const words = z.array(z.string());

const section = z.strictObject({
  concepts: words,
  folders: words,
  suffixes: words,
});

const vocabularyModel: z.ZodType<Vocabulary> = z.strictObject({
  architecture: section,
  workflow: section,
});

export { vocabularyModel };
