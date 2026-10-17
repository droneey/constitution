import { z } from 'zod';

// A field that is absent, blank or not a string reads as missing, so the check
// reports it the same way.
const text = z.string().trim().min(1).optional().catch(undefined);

const skillFrontMatterModel = z.looseObject({
  description: text,
  name: text,
});

export { skillFrontMatterModel };
