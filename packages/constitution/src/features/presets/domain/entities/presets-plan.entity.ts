import type { UnitPath } from '#/kernel/value-objects';

import type { MergedFile } from './merged-file.entity';
import type { PresetEntry } from './preset-entry.entity';
import type { PresetsFinding } from './presets-finding.entity';

interface LineGroup {
  readonly lines: readonly string[];
  readonly name: string;
}

/** A file of lines as the presets lay it: its groups, and every name the presets give one there. */
interface LinesLayout {
  readonly groups: readonly LineGroup[];
  readonly names: readonly string[];
}

interface FilePlan {
  readonly entries: readonly PresetEntry[];
  /** its path from the repository */
  readonly file: string;
  /** absent where the file holds no lines */
  readonly layout?: LinesLayout;
  readonly merged: MergedFile;
  readonly unit: UnitPath;
}

/** The commands of each entry point: check, test, fix. */
interface UnitRun {
  readonly commands: ReadonlyMap<string, readonly string[]>;
  readonly unit: UnitPath;
}

interface PresetsPlan {
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
  readonly runs: readonly UnitRun[];
}

export type { FilePlan, LineGroup, LinesLayout, PresetsPlan, UnitRun };
