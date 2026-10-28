import { isDeepEqual } from '#/kernel/utils';
import { UnitRelativePath } from '#/kernel/value-objects';

enum RecordKind {
  Settings = 'settings',
  Whole = 'whole',
}

interface SettingsRecord {
  readonly addresses: readonly string[];
  readonly everMetDefaults: readonly string[];
  readonly isCreatedByApply: boolean;
  readonly kind: RecordKind.Settings;
  readonly leaves: readonly string[];
}

interface WholeRecord {
  readonly kind: RecordKind.Whole;
}

type LockRecord = SettingsRecord | WholeRecord;

type Lock = Readonly<Record<UnitRelativePath, LockRecord>>;

enum LockReadStatus {
  Read = 'read',
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
  everMetDefaults: [],
  isCreatedByApply: false,
  kind: RecordKind.Settings,
  leaves: [],
};

const wholeRecord: WholeRecord = {
  kind: RecordKind.Whole,
};

const isEmpty = (record: LockRecord): boolean => isDeepEqual(record, emptyRecord);

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
