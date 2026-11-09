import { z } from 'zod';

import { UnitRelativePath } from '#/kernel/value-objects';

const lockRecordModel = z.union([
  z.strictObject({
    whole: z.literal(true),
  }),
  z.strictObject({
    addresses: z.array(z.string()).optional(),
    created: z.literal(true).optional(),
    defaults: z.array(z.string()).optional(),
    leaves: z.array(z.string()).optional(),
  }),
]);

const lockModel = z.record(z.string().refine(UnitRelativePath.is), lockRecordModel);

type LockWire = z.infer<typeof lockModel>;

type LockRecordWire = z.infer<typeof lockRecordModel>;

export type { LockRecordWire, LockWire };
export { lockModel };
