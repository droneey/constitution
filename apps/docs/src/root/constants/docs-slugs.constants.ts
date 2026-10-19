import { z } from 'zod';

const MAX_DEPTH = 6;

/** an abstract block's slug opens with `_` */
export const slugsShape = z.array(z.string().regex(/^_?[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(MAX_DEPTH);
