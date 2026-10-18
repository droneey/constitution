import { z } from 'zod';

/** the deepest a page sits below the documentation's root */
const MAX_DEPTH = 6;

/** a page's address below the documentation's root, as the segments of its path */
export const slugsShape = z.array(z.string().regex(/^[a-z0-9-]+$/)).max(MAX_DEPTH);
