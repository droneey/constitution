import type { ProjectFiles } from '#/kernel/contracts';
import type { FileRead, ProjectUnit } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { compareText, isDeepEqual } from '#/kernel/utils';
import { UnitPath } from '#/kernel/value-objects';

import { LOCK_FILE } from '../../../constants';
import type { ConfigurationFormat } from '../../../contracts';
import { SettingShape } from '../../../contracts';
import type {
  FilePlan,
  LockRead,
  LockRecord,
  PresetsFinding,
  SettingPlace,
  UnitLock,
} from '../../../entities';
import { Leaf, Lock, LockReadStatus, PresetsCode, Setting } from '../../../entities';
import { overlay } from './steps/overlay-file';
import { recordOf, removeStale } from './steps/reconcile-lock';
import { defaultLeavesOf, writeDefaults } from './steps/write-defaults';

interface FileComputed {
  readonly added: readonly SettingPlace[];
  /** its path from the repository */
  readonly file: string;
  readonly findings: readonly PresetsFinding[];
  /** a file it created, which no entry writes and nothing is left in */
  readonly isDeleted: boolean;
  /** the settings of ours the file lacks or holds as an earlier release gave them, defaults aside */
  readonly missing: readonly SettingPlace[];
  /** absent where the file leaves the lock */
  readonly record?: LockRecord;
  readonly removed: readonly SettingPlace[];
  /** what an earlier apply wrote that no entry gives any longer, a value ours replaces aside */
  readonly stale: readonly SettingPlace[];
  /** absent where the file is not written */
  readonly text?: string;
  /** the maps the presets keep sorted whose keys the file orders otherwise */
  readonly unsorted: readonly SettingPlace[];
}

interface UnitComputed {
  readonly files: readonly FileComputed[];
  readonly findings: readonly PresetsFinding[];
  /** the unit's new lock, and its path from the repository; absent where the lock stays as it is */
  readonly lock?: {
    readonly file: string;
    readonly next: UnitLock;
  };
}

interface ComputeFilesInput {
  /** the blocks whose entries write each file, by its path from its unit, whatever the unit takes */
  readonly blocks: ReadonlyMap<string, readonly string[]>;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  /** by the unit's absolute folder */
  readonly lockOf: (folder: string) => LockRead;
  readonly plans: readonly FilePlan[];
  /** the project's absolute folder */
  readonly project: string;
  readonly units: readonly ProjectUnit[];
}

const SEPARATOR = '/';

const NOTHING = {
  added: [],
  findings: [],
  isDeleted: false,
  missing: [],
  removed: [],
  stale: [],
  unsorted: [],
} as const;

const shapeOf = (setting: Setting | undefined): SettingShape | undefined => {
  if (Setting.isList(setting)) {
    return SettingShape.List;
  }

  return Setting.isMap(setting) ? SettingShape.Map : undefined;
};

// A file that is absent stays absent while nothing is due in it, as when the user deleted it.
const isEmpty = (setting: Setting): boolean =>
  Setting.isList(setting)
    ? setting.length === 0
    : Setting.isMap(setting) && Object.keys(setting).length === 0;

const placesOf = (file: string, leaves: readonly Leaf[]): readonly SettingPlace[] =>
  leaves.map((leaf) => ({
    file,
    setting: Leaf.textOf(leaf),
  }));

const isBelow = (path: readonly string[], prefix: readonly string[]): boolean =>
  prefix.every((key, at) => path[at] === key);

interface FileInput {
  readonly blocks: readonly string[];
  readonly file: string;
  readonly formats: ConfigurationFormat;
  readonly plan: FilePlan | undefined;
  readonly read: FileRead;
  readonly record: LockRecord;
}

// A whole file's text as a default: written once, while the file is absent, and never checked.
const computeWhole = (
  input: FileInput & {
    whole: string;
  },
): FileComputed => ({
  ...NOTHING,
  file: input.file,
  record: {
    ...Lock.emptyRecord,
    isWhole: true,
  },
  ...(input.read.status === FileReadStatus.Missing && !input.record.isWhole
    ? {
        text: input.whole,
      }
    : {}),
});

const unparsedOf = (input: { file: string; record: LockRecord }): FileComputed => ({
  ...NOTHING,
  file: input.file,
  findings: [
    {
      code: PresetsCode.FileUnparsed,
      details: {},
      path: input.file,
    },
  ],
  record: input.record,
});

const unsortedOf = (input: {
  file: string;
  parsed: Setting;
  sorted: readonly (readonly string[])[];
}): readonly SettingPlace[] =>
  input.sorted
    .filter((path) => {
      const held = Setting.at(input.parsed, path);

      return (
        Setting.isMap(held) &&
        !isDeepEqual(Object.keys(held), Object.keys(held).toSorted(compareText))
      );
    })
    .map((path) => ({
      file: input.file,
      setting: path.join('.'),
    }));

// A file no entry writes keeps no comment naming a block: its blocks are named, and none marked.
const writtenOf = (
  input: FileInput & {
    settings: Setting;
    shape: SettingShape | undefined;
    text: string;
  },
): string => {
  const { plan, shape } = input;

  // Stryker disable ConditionalExpression: a shape given as undefined reads as none given
  return input.formats.write({
    format: plan?.format,
    marks: plan?.marks ?? {
      blocks: input.blocks,
      marks: [],
    },
    path: input.file,
    settings: input.settings,
    sorted: plan?.merged.sorted ?? [],
    ...(shape === undefined
      ? {}
      : {
          shape,
        }),
    text: input.text,
  });
  // Stryker restore ConditionalExpression
};

// A file the apply created goes with its record once no entry writes it and nothing is left in it.
const endOf = (
  input: FileInput & {
    setting: Setting;
  },
): {
  readonly isCreated: boolean;
  readonly isDeleted: boolean;
  readonly isLeft: boolean;
} => {
  const isCreated = input.record.isCreated || input.read.status === FileReadStatus.Missing;
  const isLeft = input.plan === undefined && isCreated && isEmpty(input.setting);

  return {
    isCreated,
    isDeleted: isLeft && input.read.status === FileReadStatus.Read,
    isLeft,
  };
};

const computeSettings = (
  input: FileInput & {
    text: string;
  },
): FileComputed => {
  const { file, plan, record, text } = input;
  const shape = shapeOf(plan?.merged.value ?? plan?.merged.whole);
  // Stryker disable ConditionalExpression: a shape given as undefined reads as none given
  const parsed = input.formats.read({
    format: plan?.format,
    path: file,
    ...(shape === undefined
      ? {}
      : {
          shape,
        }),
    text,
  });
  // Stryker restore ConditionalExpression

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
    file: parsed,
    lock: record,
    ours,
  });
  const heldBefore = new Set(
    Leaf.leavesOf(ours)
      .filter((leaf) => Leaf.isHeldBy(stale.value, leaf))
      .map(Leaf.keyOf),
  );
  const overlaid = overlay({
    file: stale.value,
    locked: new Set(record.leaves),
    ours,
    path: [],
  });
  const defaults = writeDefaults({
    leaves:
      plan === undefined
        ? []
        : defaultLeavesOf({
            isLines: Setting.isList(parsed),
            merged: plan.merged,
          }),
    met: record.defaults,
    setting: overlaid.value,
  });
  const sorted = plan?.merged.sorted ?? [];
  const { isCreated, isDeleted, isLeft } = endOf({
    ...input,
    setting: defaults.setting,
  });
  const written = writtenOf({
    ...input,
    settings: defaults.setting,
    shape,
  });

  return {
    added: input.read.status === FileReadStatus.Read ? placesOf(file, defaults.added) : [],
    file,
    findings: overlaid.loosenings.map((loosening) => ({
      code: PresetsCode.Loosened,
      details: {
        setting: loosening.path.join('.'),
        wanted: Setting.canonicalTextOf(loosening.wanted),
      },
      path: file,
    })),
    isDeleted,
    missing: placesOf(
      file,
      Leaf.leavesOf(ours).filter(
        (leaf) =>
          !(
            Leaf.isHeldBy(stale.value, leaf) ||
            overlaid.loosenings.some((loosening) => isBelow(leaf.path, loosening.path))
          ),
      ),
    ),
    ...(isLeft
      ? {}
      : {
          record: recordOf({
            defaults: defaults.met,
            fields,
            heldBefore,
            isCreated,
            lock: record,
            ours,
          }),
        }),
    removed: placesOf(file, stale.removed),
    stale: placesOf(
      file,
      stale.removed.filter((leaf) => leaf.isItem || Setting.at(ours, leaf.path) === undefined),
    ),
    ...(isLeft ||
    (input.read.status === FileReadStatus.Read ? written === text : isEmpty(defaults.setting))
      ? {}
      : {
          text: written,
        }),
    unsorted: unsortedOf({
      file,
      parsed,
      sorted,
    }),
  };
};

const computeFile = (input: FileInput): FileComputed => {
  const merged = input.plan?.merged;

  if (merged?.value === undefined && typeof merged?.whole === 'string') {
    return computeWhole({
      ...input,
      whole: merged.whole,
    });
  }

  if (input.read.status === FileReadStatus.Missing && input.plan === undefined) {
    return {
      ...NOTHING,
      file: input.file,
    };
  }

  return input.read.status === FileReadStatus.Unreadable
    ? unparsedOf(input)
    : computeSettings({
        ...input,
        text: input.read.status === FileReadStatus.Read ? input.read.text : '',
      });
};

const folderOf = (project: string, unit: ProjectUnit): string =>
  UnitPath.isRepository(unit.path) ? project : `${project}${SEPARATOR}${unit.path}`;

// The files the unit's entries write and those its lock names.
const computeUnit = (
  input: Omit<ComputeFilesInput, 'units'> & {
    unit: ProjectUnit;
  },
): UnitComputed => {
  const { unit } = input;
  const folder = folderOf(input.project, unit);
  const read = input.lockOf(folder);
  const lock = read.status === LockReadStatus.Read ? read.lock : {};
  const plans = input.plans.filter((plan) => UnitPath.equals(plan.unit, unit.path));
  const locals = [
    ...new Set([
      ...plans.map((plan) => UnitPath.pathFrom(unit.path, plan.file)),
      ...Object.keys(lock),
    ]),
  ].toSorted(compareText);
  const files = locals.map((local) => {
    const file = UnitPath.pathOf(unit.path, local);

    return computeFile({
      blocks: input.blocks.get(local) ?? [],
      file,
      formats: input.formats,
      plan: plans.find((plan) => plan.file === file),
      read: input.files.read(`${input.project}${SEPARATOR}${file}`),
      record: lock[local] ?? Lock.emptyRecord,
    });
  });
  const next: Lock = Object.fromEntries(
    files.flatMap(({ file, record }) =>
      record === undefined || Lock.isEmpty(record)
        ? []
        : [
            [
              UnitPath.pathFrom(unit.path, file),
              record,
            ],
          ],
    ),
  );
  const isChanged = read.status === LockReadStatus.Unparsed || !Lock.equals(lock, next);

  return {
    files,
    findings:
      read.status === LockReadStatus.Unparsed
        ? [
            {
              code: PresetsCode.LockUnparsed,
              details: {},
              path: UnitPath.pathOf(unit.path, LOCK_FILE),
            },
          ]
        : [],
    ...(isChanged
      ? {
          lock: {
            file: UnitPath.pathOf(unit.path, LOCK_FILE),
            next: {
              folder,
              lock: next,
            },
          },
        }
      : {}),
  };
};

const computeFiles = (input: ComputeFilesInput): readonly UnitComputed[] =>
  input.units.map((unit) =>
    computeUnit({
      ...input,
      unit,
    }),
  );

export type { ComputeFilesInput, FileComputed, UnitComputed };
export { computeFiles };
