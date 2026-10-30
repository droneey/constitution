import type { RepositoryRelativePath } from '#/kernel/value-objects';

import type { SettingPlace } from '../apply-report/apply-report.entity';
import type { LockRecord } from '../lock/lock.entity';
import type { PresetsFinding } from '../presets-finding/presets-finding.entity';
import { PresetsCode } from '../presets-finding/presets-finding.entity';

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

const driftOf = (file: FileComputed): readonly PresetsFinding[] => [
  ...(file.missingOrOutdated.length === 0
    ? []
    : [
        {
          code: PresetsCode.Missing,
          details: {
            settingPaths: file.missingOrOutdated.map(({ settingPath }) => settingPath),
          },
          path: file.filePath,
        } satisfies PresetsFinding,
      ]),
  ...(file.staleWithoutReplacement.length === 0
    ? []
    : [
        {
          code: PresetsCode.Stale,
          details: {
            settingPaths: file.staleWithoutReplacement.map(({ settingPath }) => settingPath),
          },
          path: file.filePath,
        } satisfies PresetsFinding,
      ]),
  ...(file.unsorted.length === 0
    ? []
    : [
        {
          code: PresetsCode.Unsorted,
          details: {
            settingPaths: file.unsorted.map(({ settingPath }) => settingPath),
          },
          path: file.filePath,
        } satisfies PresetsFinding,
      ]),
];

const FileComputed = {
  driftOf,
} as const;

export type { FileChange };
export { FileChangeKind, FileComputed };
