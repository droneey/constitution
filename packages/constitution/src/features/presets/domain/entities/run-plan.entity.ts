import type { AbsolutePath, UnitPath } from '#/kernel/value-objects';

import type { PresetsFinding } from './presets-finding.entity';

enum EntryPoint {
  Check = 'check',
  Test = 'test',
  Fix = 'fix',
}

interface RunAsked {
  readonly entryPoint: EntryPoint;
  readonly startFolderPath: AbsolutePath;
  readonly unitPaths?: readonly UnitPath[];
}

interface CommandToRun {
  readonly command: string;
  readonly folderPath: AbsolutePath;
}

interface RunStep {
  readonly command: string;
  readonly unitFolderPath: AbsolutePath;
  readonly unitPath: UnitPath;
}

interface RunPlan {
  readonly findings: readonly PresetsFinding[];
  readonly steps: readonly RunStep[];
}

export type { CommandToRun, RunAsked, RunPlan, RunStep };
export { EntryPoint };
