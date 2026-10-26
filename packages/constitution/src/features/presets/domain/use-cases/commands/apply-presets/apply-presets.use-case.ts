import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';
import type { FileRead, ProjectUnit } from '#/kernel/entities';
import { FileReadStatus } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { UnitPath } from '#/kernel/value-objects';

import { LOCK_FILE } from '../../../constants';
import type { CatalogueParser, ConfigurationFormat } from '../../../contracts';
import { SettingShape } from '../../../contracts';
import type {
  AppliedFilesCommandRepository,
  LockCommandRepository,
} from '../../../contracts/repositories/commands';
import type {
  ApplyReport,
  FilePlan,
  FileText,
  LockRecord,
  PresetsFinding,
  SettingPlace,
  UnitLock,
} from '../../../entities';
import { Leaf, Lock, LockReadStatus, PresetsCode, Setting } from '../../../entities';
import { computePresets } from '../../shared/compute-presets';
import { overlay } from './steps/overlay-file';
import { recordOf, removeStale } from './steps/reconcile-lock';
import { defaultLeavesOf, writeDefaults } from './steps/write-defaults';

interface ApplyPresetsInput {
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly locks: LockCommandRepository;
  readonly parser: CatalogueParser;
  readonly source: ProjectSource;
  readonly start: string;
  readonly writes: AppliedFilesCommandRepository;
}

interface FileApplied {
  readonly added: readonly SettingPlace[];
  readonly findings: readonly PresetsFinding[];
  /** absent where the file leaves the lock */
  readonly record?: LockRecord;
  readonly removed: readonly SettingPlace[];
  /** absent where the file is not written */
  readonly text?: string;
}

const SEPARATOR = '/';

const nothing: FileApplied = {
  added: [],
  findings: [],
  removed: [],
};

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

interface FileInput {
  /** its path from the repository */
  readonly file: string;
  readonly formats: ConfigurationFormat;
  readonly plan: FilePlan | undefined;
  readonly read: FileRead;
  readonly record: LockRecord;
}

// A whole file's text as a default: written once, while the file is absent, and never checked.
const applyWhole = (
  input: FileInput & {
    whole: string;
  },
): FileApplied => ({
  ...nothing,
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

const applySettings = (
  input: FileInput & {
    text: string;
  },
): FileApplied => {
  const { file, plan, record, text } = input;
  const shape = shapeOf(plan?.merged.value ?? plan?.merged.whole);
  // Stryker disable ConditionalExpression: a shape given as undefined reads as none given
  const parsed = input.formats.read({
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
    return {
      ...nothing,
      findings: [
        {
          code: PresetsCode.FileUnparsed,
          details: {},
          path: file,
        },
      ],
      record,
    };
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
  // Stryker disable ConditionalExpression: a shape given as undefined reads as none given
  const written = input.formats.write({
    path: file,
    settings: defaults.setting,
    ...(shape === undefined
      ? {}
      : {
          shape,
        }),
    text,
  });
  // Stryker restore ConditionalExpression

  return {
    added: input.read.status === FileReadStatus.Read ? placesOf(file, defaults.added) : [],
    findings: overlaid.loosenings.map((loosening) => ({
      code: PresetsCode.Loosened,
      details: {
        setting: loosening.path.join('.'),
        wanted: Setting.canonicalTextOf(loosening.wanted),
      },
      path: file,
    })),
    record: recordOf({
      defaults: defaults.met,
      fields,
      heldBefore,
      lock: record,
      ours,
    }),
    removed: placesOf(file, stale.removed),
    ...((input.read.status === FileReadStatus.Read ? written === text : isEmpty(defaults.setting))
      ? {}
      : {
          text: written,
        }),
  };
};

const applyFile = (input: FileInput): FileApplied => {
  const merged = input.plan?.merged;

  if (merged?.value === undefined && typeof merged?.whole === 'string') {
    return applyWhole({
      ...input,
      whole: merged.whole,
    });
  }

  if (input.read.status === FileReadStatus.Missing && input.plan === undefined) {
    return nothing;
  }

  return input.read.status === FileReadStatus.Unreadable
    ? {
        ...nothing,
        findings: [
          {
            code: PresetsCode.FileUnparsed,
            details: {},
            path: input.file,
          },
        ],
        record: input.record,
      }
    : applySettings({
        ...input,
        text: input.read.status === FileReadStatus.Read ? input.read.text : '',
      });
};

interface UnitApplied {
  readonly files: readonly (FileApplied & {
    readonly file: string;
  })[];
  readonly findings: readonly PresetsFinding[];
  /** the unit's new lock, and its path from the repository; absent where the lock stays as it is */
  readonly lock?: {
    readonly file: string;
    readonly next: UnitLock;
  };
}

const folderOf = (project: string, unit: ProjectUnit): string =>
  UnitPath.isRepository(unit.path) ? project : `${project}${SEPARATOR}${unit.path}`;

// Each file the unit's entries write, or its lock names, applied; the lock changes with them.
const applyUnit = (input: {
  files: ProjectFiles;
  formats: ConfigurationFormat;
  locks: LockCommandRepository;
  plans: readonly FilePlan[];
  project: string;
  unit: ProjectUnit;
}): UnitApplied => {
  const { unit } = input;
  const folder = folderOf(input.project, unit);
  const read = input.locks.read(folder);
  const lock = read.status === LockReadStatus.Read ? read.lock : {};
  const locals = [
    ...new Set([
      ...input.plans.map((plan) => UnitPath.pathFrom(unit.path, plan.file)),
      ...Object.keys(lock),
    ]),
  ].toSorted(compareText);
  const files = locals.map((local) => {
    const file = UnitPath.pathOf(unit.path, local);

    return {
      ...applyFile({
        file,
        formats: input.formats,
        plan: input.plans.find((plan) => plan.file === file),
        read: input.files.read(`${input.project}${SEPARATOR}${file}`),
        record: lock[local] ?? Lock.emptyRecord,
      }),
      file,
    };
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

/**
 * Writes what the catalogues compute into the files of the project around the start folder, and
 * each unit's lock; a file the user keeps settings in keeps them, and a setting of ours the user
 * changed stays changed and is reported. Undefined where no project is.
 *
 * @throws {@link ProjectError} when its release is not installed, or its constitution.yaml or its
 * blocks cannot be read
 * @throws {@link ApplyError} when a file cannot be written, which leaves every file as it was
 */
const applyPresets = (input: ApplyPresetsInput): ApplyReport | undefined => {
  if (input.source.find(input.start) === undefined) {
    return undefined;
  }

  const opened = input.source.open(input.start);
  const plan = computePresets({
    files: input.files,
    model: opened.resolution.model,
    packs: opened.packs,
    parser: input.parser,
    project: opened.project,
    releaseFolder: opened.releaseFolder,
    units: opened.resolution.units,
  });
  const units = opened.resolution.units.map((unit) =>
    applyUnit({
      ...input,
      plans: plan.files.filter((file) => UnitPath.equals(file.unit, unit.path)),
      project: opened.project,
      unit,
    }),
  );
  const files = units.flatMap((unit) => unit.files);
  const texts: readonly FileText[] = files.flatMap(({ file, text }) =>
    text === undefined
      ? []
      : [
          {
            path: `${opened.project}${SEPARATOR}${file}`,
            text,
          },
        ],
  );
  const locks = units.flatMap((unit) =>
    unit.lock === undefined
      ? []
      : [
          unit.lock,
        ],
  );

  input.writes.write({
    files: texts,
    locks: locks.map((lock) => lock.next),
  });

  return {
    added: files.flatMap((file) => file.added),
    findings: [
      ...plan.findings,
      ...units.flatMap((unit) => unit.findings),
      ...files.flatMap((file) => file.findings),
    ],
    removed: files.flatMap((file) => file.removed),
    written: [
      ...files.flatMap(({ file, text }) =>
        text === undefined
          ? []
          : [
              file,
            ],
      ),
      ...locks.map((lock) => lock.file),
    ],
  };
};

export type { ApplyPresetsInput };
export { applyPresets };
