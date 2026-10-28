import type {
  BlockId,
  RepositoryRelativePath,
  UnitPath,
  UnitRelativePath,
} from '#/kernel/value-objects';

import type { FileFormat } from '../value-objects';
import type { BlockMarks } from './block-marks.entity';
import type { MergedFile } from './merged-file.entity';
import type { PresetEntry } from './preset-entry.entity';
import type { PresetsFinding } from './presets-finding.entity';
import type { EntryPoint } from './run-plan.entity';

interface FilePlan {
  readonly entries: readonly PresetEntry[];
  readonly filePath: RepositoryRelativePath;
  /** the format an entry's mark names for its text; absent where its name tells it */
  readonly format?: FileFormat;
  /** absent where the entries write only defaults */
  readonly marks?: BlockMarks;
  readonly merged: MergedFile;
  readonly unitPath: UnitPath;
}

/** The commands the unit's runners give for each entry point. */
interface UnitRun {
  readonly commands: ReadonlyMap<EntryPoint, readonly string[]>;
  readonly unitPath: UnitPath;
}

interface PresetsPlan {
  /** the blocks whose entries write each file, by its path from its unit, whatever a unit takes */
  readonly blockIds: ReadonlyMap<UnitRelativePath, readonly BlockId[]>;
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
  readonly runs: readonly UnitRun[];
}

export type { FilePlan, PresetsPlan, UnitRun };
