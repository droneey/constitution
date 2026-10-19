import { z } from 'zod';

/** the deepest a page sits below the documentation's root */
const MAX_DEPTH = 6;

/** a page's address below the documentation's root, as the segments of its path; an abstract block's opens with `_` */
export const slugsShape = z.array(z.string().regex(/^_?[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(MAX_DEPTH);
