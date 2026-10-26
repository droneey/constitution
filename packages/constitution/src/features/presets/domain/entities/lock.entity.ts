import { isDeepEqual } from '#/kernel/utils';

interface LockRecord {
  readonly addresses: readonly string[];
  /** the defaults written or found present, which a user who deletes one deletes for good */
  readonly defaults: readonly string[];
  /** whether an apply wrote the file where none was, so the apply deletes it once nothing is left */
  readonly isCreated: boolean;
  /** whether the file was written whole, as a default, once */
  readonly isWhole: boolean;
  /** the leaves the apply wrote, which a later apply removes once no entry gives them */
  readonly leaves: readonly string[];
}

/** A unit's lock: each file an apply wrote, by its path from the unit's folder. */
type Lock = Readonly<Record<string, LockRecord>>;

enum LockReadStatus {
  Read = 'read',
  /** the lock is there and holds no lock, as a merge's conflict leaves it */
  Unparsed = 'unparsed',
}

type LockRead =
  | {
      readonly lock: Lock;
      readonly status: LockReadStatus.Read;
    }
  | {
      readonly status: LockReadStatus.Unparsed;
    };

const emptyRecord: LockRecord = {
  addresses: [],
  defaults: [],
  isCreated: false,
  isWhole: false,
  leaves: [],
};

const isEmpty = (record: LockRecord): boolean => isDeepEqual(record, emptyRecord);

const Lock = {
  emptyRecord,
  equals: (left: Lock, right: Lock): boolean => isDeepEqual(left, right),
  isEmpty,
} as const;

export type { LockRead, LockRecord };
export { Lock, LockReadStatus };
