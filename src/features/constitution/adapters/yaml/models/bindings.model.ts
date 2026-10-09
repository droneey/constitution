import { z } from 'zod';

import type { BindingsDocument } from '../../../domain/entities';

const settings = z.array(z.string()).min(1);

const bindingsModel: z.ZodType<BindingsDocument> = z.record(
  z.string(),
  z.record(z.string(), settings),
);

export { bindingsModel };
