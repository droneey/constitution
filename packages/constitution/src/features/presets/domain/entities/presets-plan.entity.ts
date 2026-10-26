import type { UnitPath } from '#/kernel/value-objects';

import type { MergedFile } from './merged-file.entity';
import type { PresetEntry } from './preset-entry.entity';
import type { PresetsFinding } from './presets-finding.entity';

interface FilePlan {
  readonly entries: readonly PresetEntry[];
  /** its path from the repository */
  readonly file: string;
  readonly merged: MergedFile;
  readonly unit: UnitPath;
}

interface PresetsPlan {
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
}

export type { FilePlan, PresetsPlan };
