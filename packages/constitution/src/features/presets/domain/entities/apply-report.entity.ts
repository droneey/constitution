import type { RepositoryRelativePath, UnitPath } from '#/kernel/value-objects';

interface SettingPlace {
  readonly filePath: RepositoryRelativePath;
  /** the keys down to the setting, joined by dots; an item of a list also names its value */
  readonly setting: string;
}

/** What a ready apply writes, deletes, adds and removes. */
interface ApplyReport {
  /** the defaults added to files that were there already */
  readonly added: readonly SettingPlace[];
  /** the files it created that no entry writes any longer and that hold nothing else */
  readonly deletedFilePaths: readonly RepositoryRelativePath[];
  /** what an earlier apply wrote and no entry gives any longer */
  readonly removed: readonly SettingPlace[];
  /** the units it wrote a file of */
  readonly unitPaths: readonly UnitPath[];
  /** the units' locks among them */
  readonly writtenFilePaths: readonly RepositoryRelativePath[];
}

export type { ApplyReport, SettingPlace };
