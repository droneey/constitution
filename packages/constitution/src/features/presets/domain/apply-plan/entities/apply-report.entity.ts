import type { RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

interface SettingPlace {
  readonly filePath: RepositoryRelativePath;
  readonly settingPath: string;
}

interface ApplyReport {
  readonly defaultsAddedToExistingFiles: readonly SettingPlace[];
  readonly deletedFilePaths: readonly RepositoryRelativePath[];
  readonly removedByApply: readonly SettingPlace[];
  readonly writtenFilePaths: readonly RepositoryRelativePath[];
  readonly writtenUnitPaths: readonly UnitPath[];
}

export type { ApplyReport, SettingPlace };
