import type { FileRead } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { compareText, isDeepEqual } from '#/kernel/utils';
import type { BlockId, RepositoryRelativePath } from '#/kernel/value-objects';

import type { ConfigurationFile, ConfigurationFormat } from '../../../../../contracts';
import { SettingShape } from '../../../../../contracts';
import type {
  FilePlan,
  LockRecord,
  MergedFile,
  PresetsFinding,
  SettingPlace,
} from '../../../../../entities';
import { Leaf, Lock, PresetsCode, RecordKind, Setting, WholeKind } from '../../../../../entities';
import { overlayFile } from './steps/overlay-file';
import { recordOf, removeStale } from './steps/reconcile-lock';
import { defaultLeavesOf, writeDefaults } from './steps/write-defaults';

enum FileChangeKind {
  Kept = 'kept',
  Written = 'written',
  Deleted = 'deleted',
}

type FileChange =
  | {
      readonly kind: FileChangeKind.Deleted;
    }
  | {
      readonly kind: FileChangeKind.Kept;
      readonly record: LockRecord;
    }
  | {
      readonly kind: FileChangeKind.Written;
      readonly record: LockRecord;
      readonly text: string;
    };

interface FileComputed {
  readonly change: FileChange;
  readonly defaultsAddedToExistingFile: readonly SettingPlace[];
  readonly filePath: RepositoryRelativePath;
  readonly findings: readonly PresetsFinding[];
  readonly missingOrOutdated: readonly SettingPlace[];
  readonly removedByApply: readonly SettingPlace[];
  readonly staleWithoutReplacement: readonly SettingPlace[];
  readonly unsorted: readonly SettingPlace[];
}

interface ComputeFileInput {
  readonly blockIds: readonly BlockId[];
  readonly filePath: RepositoryRelativePath;
  readonly formats: ConfigurationFormat;
  readonly plan: FilePlan | undefined;
  readonly read: FileRead;
  readonly record: LockRecord;
}

const reportsOf = (input: {
  change: FileChange;
  filePath: RepositoryRelativePath;
}): FileComputed => ({
  change: input.change,
  defaultsAddedToExistingFile: [],
  filePath: input.filePath,
  findings: [],
  missingOrOutdated: [],
  removedByApply: [],
  staleWithoutReplacement: [],
  unsorted: [],
});

const shapeOf = (setting: Setting | undefined): Pick<ConfigurationFile, 'shape'> => {
  if (Setting.isList(setting)) {
    return {
      shape: SettingShape.List,
    };
  }

  return Setting.isMap(setting)
    ? {
        shape: SettingShape.Map,
      }
    : {};
};

const isEmpty = (setting: Setting): boolean =>
  Setting.isList(setting)
    ? setting.length === 0
    : Setting.isMap(setting) && Object.keys(setting).length === 0;

const placesOf = (
  filePath: RepositoryRelativePath,
  leaves: readonly Leaf[],
): readonly SettingPlace[] =>
  leaves.map((leaf) => ({
    filePath,
    settingPath: Leaf.textOf(leaf),
  }));

const isBelow = (keyPath: readonly string[], prefix: readonly string[]): boolean =>
  prefix.every((key, at) => keyPath[at] === key);

// Why: a whole default is written once, only while the file is missing and the lock has not seen
// it written, so a user who deletes or rewrites it keeps their choice.
const computeWholeDefault = (
  input: ComputeFileInput & {
    whole: string;
  },
): FileComputed =>
  reportsOf({
    change:
      input.read.status === FileReadStatus.Missing && input.record.kind !== RecordKind.Whole
        ? {
            kind: FileChangeKind.Written,
            record: Lock.wholeRecord,
            text: input.whole,
          }
        : {
            kind: FileChangeKind.Kept,
            record: Lock.wholeRecord,
          },
    filePath: input.filePath,
  });

const unparsedOf = (input: {
  filePath: RepositoryRelativePath;
  record: LockRecord;
}): FileComputed => ({
  ...reportsOf({
    change: {
      kind: FileChangeKind.Kept,
      record: input.record,
    },
    filePath: input.filePath,
  }),
  findings: [
    {
      code: PresetsCode.FileUnparsed,
      details: {},
      path: input.filePath,
    },
  ],
});

const unsortedOf = (input: {
  filePath: RepositoryRelativePath;
  parsed: Setting;
  sorted: readonly (readonly string[])[];
}): readonly SettingPlace[] =>
  input.sorted
    .filter((keyPath) => {
      const held = Setting.at(input.parsed, keyPath);

      return (
        Setting.isMap(held) &&
        !isDeepEqual(Object.keys(held), Object.keys(held).toSorted(compareText))
      );
    })
    .map((keyPath) => ({
      filePath: input.filePath,
      settingPath: Setting.pathTextOf(keyPath),
    }));

const shapingOf = (merged: MergedFile | undefined): Setting | undefined => {
  const whole = merged?.whole;

  return merged?.value ?? (whole?.kind === WholeKind.Added ? whole.setting : undefined);
};

const configurationFileOf = (
  input: ComputeFileInput & {
    text: string;
  },
): ConfigurationFile => ({
  filePath: input.filePath,
  ...(input.plan?.format === undefined
    ? {}
    : {
        format: input.plan.format,
      }),
  ...shapeOf(shapingOf(input.plan?.merged)),
  text: input.text,
});

const isForgotten = (input: {
  isCreatedByApply: boolean;
  plan: FilePlan | undefined;
  setting: Setting;
}): boolean => input.plan === undefined && input.isCreatedByApply && isEmpty(input.setting);

// Why: an absent file stays absent while nothing is due in it, as when the user deleted it.
const isUnchanged = (input: { read: FileRead; setting: Setting; written: string }): boolean =>
  input.read.status === FileReadStatus.Read
    ? input.written === input.read.text
    : isEmpty(input.setting);

const changeOf = (input: {
  isDeleted: boolean;
  isKept: boolean;
  record: LockRecord;
  written: string;
}): FileChange => {
  if (input.isDeleted) {
    return {
      kind: FileChangeKind.Deleted,
    };
  }

  return input.isKept
    ? {
        kind: FileChangeKind.Kept,
        record: input.record,
      }
    : {
        kind: FileChangeKind.Written,
        record: input.record,
        text: input.written,
      };
};

const computeSettings = (
  input: ComputeFileInput & {
    text: string;
  },
): FileComputed => {
  const { filePath, plan, read } = input;
  const record = Lock.settingsOf(input.record);
  const file = configurationFileOf(input);
  const parsed = input.formats.read(file);

  if (parsed === undefined) {
    return unparsedOf(input);
  }

  const ours = plan?.merged.value ?? (Setting.isList(parsed) ? [] : {});
  const fields = [
    ...new Set([
      ...Leaf.addressFieldsOf(ours),
      ...record.addresses,
    ]),
  ];
  const stale = removeStale({
    fields,
    fileSetting: parsed,
    lock: record,
    ours,
  });
  const heldBefore = new Set(
    Leaf.leavesOf(ours)
      .filter((leaf) => Leaf.isHeldBy(stale.value, leaf))
      .map(Leaf.keyOf),
  );
  const overlaid = overlayFile({
    fileSetting: stale.value,
    locked: new Set(record.leaves),
    keyPath: [],
    ours,
  });
  const defaults = writeDefaults({
    leaves:
      plan === undefined
        ? []
        : defaultLeavesOf({
            isLines: Setting.isList(parsed),
            merged: plan.merged,
          }),
    metBefore: record.everMetDefaults,
    setting: overlaid.value,
  });
  const sorted = plan?.merged.sorted ?? [];
  const isCreatedByApply = record.isCreatedByApply || read.status === FileReadStatus.Missing;
  const written = input.formats.write({
    ...file,
    // Why: a file no entry writes keeps no block comment: its blocks are named, and none marked.
    marks: plan?.marks ?? {
      blocks: input.blockIds,
      marks: [],
    },
    settings: defaults.setting,
    sorted,
  });

  return {
    change: changeOf({
      isDeleted: isForgotten({
        isCreatedByApply,
        plan,
        setting: defaults.setting,
      }),
      isKept: isUnchanged({
        read,
        setting: defaults.setting,
        written,
      }),
      record: recordOf({
        everMetDefaults: defaults.everMet,
        fields,
        heldBefore,
        isCreatedByApply,
        lock: record,
        ours,
      }),
      written,
    }),
    defaultsAddedToExistingFile:
      read.status === FileReadStatus.Read ? placesOf(filePath, defaults.added) : [],
    filePath,
    findings: overlaid.loosenings.map((loosening) => ({
      code: PresetsCode.Loosened,
      details: {
        settingPath: Setting.pathTextOf(loosening.keyPath),
        wanted: Setting.canonicalTextOf(loosening.wanted),
      },
      path: filePath,
    })),
    missingOrOutdated: placesOf(
      filePath,
      Leaf.leavesOf(ours).filter(
        (leaf) =>
          !(
            Leaf.isHeldBy(stale.value, leaf) ||
            overlaid.loosenings.some((loosening) => isBelow(leaf.keyPath, loosening.keyPath))
          ),
      ),
    ),
    removedByApply: placesOf(filePath, stale.removed),
    staleWithoutReplacement: placesOf(
      filePath,
      stale.removed.filter((leaf) => leaf.isItem || Setting.at(ours, leaf.keyPath) === undefined),
    ),
    unsorted: unsortedOf({
      filePath,
      parsed,
      sorted,
    }),
  };
};

const computeFile = (input: ComputeFileInput): FileComputed => {
  const merged = input.plan?.merged;

  if (merged?.whole?.kind === WholeKind.Text && merged.value === undefined) {
    return computeWholeDefault({
      ...input,
      whole: merged.whole.text,
    });
  }

  if (input.read.status === FileReadStatus.Missing && input.plan === undefined) {
    return reportsOf({
      change: {
        kind: FileChangeKind.Kept,
        record: Lock.emptyRecord,
      },
      filePath: input.filePath,
    });
  }

  return input.read.status === FileReadStatus.Unreadable
    ? unparsedOf(input)
    : computeSettings({
        ...input,
        text: input.read.status === FileReadStatus.Read ? input.read.text : '',
      });
};

export type { ComputeFileInput, FileChange, FileComputed };
export { computeFile, FileChangeKind };
