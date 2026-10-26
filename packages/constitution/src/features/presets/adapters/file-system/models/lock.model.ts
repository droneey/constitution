import { z } from 'zod';

// Of each file only the fields that hold something, so the lock stays small.
const lockRecordModel = z.strictObject({
  addresses: z.array(z.string()).optional(),
  defaults: z.array(z.string()).optional(),
  leaves: z.array(z.string()).optional(),
  whole: z.literal(true).optional(),
});

const lockModel = z.record(z.string(), lockRecordModel);

type LockWire = z.infer<typeof lockModel>;

type LockRecordWire = z.infer<typeof lockRecordModel>;

export type { LockRecordWire, LockWire };
export { lockModel };
