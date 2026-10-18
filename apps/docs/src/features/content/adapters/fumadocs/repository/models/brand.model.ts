import { z } from 'zod';

/** brand.yaml as the brand's generator writes it; the site reads only its tagline, so the rest is let through */
export const brandModel = z.looseObject({
  tagline: z.string(),
});
