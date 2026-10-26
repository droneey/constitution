import type { UnitPath } from '#/kernel/value-objects';

import type { PresetsFinding } from './presets-finding.entity';

interface RunAsked {
  /** the entry point: check, test or fix */
  readonly name: string;
  readonly start: string;
  /** the units to run in, by their paths from the repository; the unit of the start where none */
  readonly units?: readonly string[];
}

interface RunStep {
  readonly command: string;
  /** absolute */
  readonly folder: string;
  readonly unit: UnitPath;
}

interface RunPlan {
  /** what keeps the entry points from being computed as the presets give them */
  readonly findings: readonly PresetsFinding[];
  readonly steps: readonly RunStep[];
}

export type { RunAsked, RunPlan, RunStep };
