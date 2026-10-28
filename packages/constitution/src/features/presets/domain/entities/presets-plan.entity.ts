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
  readonly format?: FileFormat;
  readonly marks?: BlockMarks;
  readonly merged: MergedFile;
  readonly unitPath: UnitPath;
}

interface UnitRun {
  readonly commands: ReadonlyMap<EntryPoint, readonly string[]>;
  readonly unitPath: UnitPath;
}

interface PresetsPlan {
  readonly blockIds: ReadonlyMap<UnitRelativePath, readonly BlockId[]>;
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
  readonly runs: readonly UnitRun[];
}

export type { FilePlan, PresetsPlan, UnitRun };
