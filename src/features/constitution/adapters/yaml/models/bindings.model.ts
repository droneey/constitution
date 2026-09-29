import { z } from 'zod';

import { Axis } from '#/kernel';

import type { BindingsDocument } from '../../../domain/entities';

const settings = z.array(z.string()).min(1);

const bindingsModel: z.ZodType<BindingsDocument> = z.partialRecord(
  z.enum(Axis),
  z.record(z.string(), z.record(z.string(), settings)),
);

export { bindingsModel };
