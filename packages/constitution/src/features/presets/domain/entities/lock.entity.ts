import { isDeepEqual } from '#/kernel/utils';
import { UnitRelativePath } from '#/kernel/value-objects';

enum RecordKind {
  Settings = 'settings',
  /** a file written whole, as a default, once */
  Whole = 'whole',
}

interface SettingsRecord {
  readonly addresses: readonly string[];
  /** the defaults written or found present, which a user who deletes one deletes for good */
  readonly defaults: readonly string[];
  /** whether an apply wrote the file where none was, so the apply deletes it once nothing is left */
  readonly isCreated: boolean;
  readonly kind: RecordKind.Settings;
  /** the leaves the apply wrote, which a later apply removes once no entry gives them */
  readonly leaves: readonly string[];
}

interface WholeRecord {
  readonly kind: RecordKind.Whole;
}

type LockRecord = SettingsRecord | WholeRecord;

type Lock = Readonly<Record<UnitRelativePath, LockRecord>>;

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

const emptyRecord: SettingsRecord = {
  addresses: [],
  defaults: [],
  isCreated: false,
  kind: RecordKind.Settings,
  leaves: [],
};

const wholeRecord: WholeRecord = {
  kind: RecordKind.Whole,
};

const isEmpty = (record: LockRecord): boolean => isDeepEqual(record, emptyRecord);

/** What the lock holds of a file's settings: nothing for a file written whole. */
const settingsOf = (record: LockRecord): SettingsRecord =>
  record.kind === RecordKind.Settings ? record : emptyRecord;

const filePathsOf = (lock: Lock): readonly UnitRelativePath[] =>
  Object.keys(lock).map(UnitRelativePath.create);

const equals = (left: Lock, right: Lock): boolean => isDeepEqual(left, right);

const Lock = {
  emptyRecord,
  equals,
  filePathsOf,
  isEmpty,
  settingsOf,
  wholeRecord,
} as const;

export type { LockRead, LockRecord, SettingsRecord, WholeRecord };
export { Lock, LockReadStatus, RecordKind };
