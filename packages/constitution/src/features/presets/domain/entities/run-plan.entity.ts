import type { AbsolutePath, UnitPath } from '#/kernel/value-objects';

import type { PresetsFinding } from './presets-finding.entity';

/** What a run is asked to do: the name of the list of commands a runner gives for it. */
enum EntryPoint {
  Check = 'check',
  Test = 'test',
  Fix = 'fix',
}

interface RunAsked {
  readonly entryPoint: EntryPoint;
  /** the folder the run starts in */
  readonly startFolderPath: AbsolutePath;
  /** the units to run in; the unit of the start where none */
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
  /** what keeps the entry points from being computed as the presets give them */
  readonly findings: readonly PresetsFinding[];
  readonly steps: readonly RunStep[];
}

export type { CommandToRun, RunAsked, RunPlan, RunStep };
export { EntryPoint };
