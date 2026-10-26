import type { UnitPath } from '#/kernel/value-objects';

import type { FileFormat } from '../value-objects';
import type { BlockMarks } from './block-marks.entity';
import type { MergedFile } from './merged-file.entity';
import type { PresetEntry } from './preset-entry.entity';
import type { PresetsFinding } from './presets-finding.entity';

interface FilePlan {
  readonly entries: readonly PresetEntry[];
  /** its path from the repository */
  readonly file: string;
  /** the format an entry's mark names for its text; absent where its name tells it */
  readonly format?: FileFormat;
  /** absent where the entries write only defaults */
  readonly marks?: BlockMarks;
  readonly merged: MergedFile;
  readonly unit: UnitPath;
}

/** The commands of each entry point: check, test, fix. */
interface UnitRun {
  readonly commands: ReadonlyMap<string, readonly string[]>;
  readonly unit: UnitPath;
}

interface PresetsPlan {
  /** the blocks whose entries write each file, by its path from its unit, whatever a unit takes */
  readonly blocks: ReadonlyMap<string, readonly string[]>;
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
  readonly runs: readonly UnitRun[];
}

export type { FilePlan, PresetsPlan, UnitRun };
