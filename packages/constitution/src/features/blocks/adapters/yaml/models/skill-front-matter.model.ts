import { z } from 'zod';

const text = z.string().trim().min(1).optional().catch(undefined);

const skillFrontMatterModel = z.looseObject({
  description: text,
  name: text,
});

export { skillFrontMatterModel };
