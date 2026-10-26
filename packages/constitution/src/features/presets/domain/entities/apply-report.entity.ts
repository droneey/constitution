import type { PresetsFinding } from './presets-finding.entity';

interface SettingPlace {
  readonly file: string;
  /** the keys down to the setting, joined by dots; an item of a list also names its value */
  readonly setting: string;
}

interface ApplyReport {
  /** the defaults added to files that were there already */
  readonly added: readonly SettingPlace[];
  /** files it created that no entry writes any longer and that hold nothing else, from the repository */
  readonly deleted: readonly string[];
  readonly findings: readonly PresetsFinding[];
  /** what an earlier apply wrote and no entry gives any longer */
  readonly removed: readonly SettingPlace[];
  /** the units it wrote a file of, by their paths from the repository */
  readonly units: readonly string[];
  /** each from the repository, the units' locks among them */
  readonly written: readonly string[];
}

export type { ApplyReport, SettingPlace };
