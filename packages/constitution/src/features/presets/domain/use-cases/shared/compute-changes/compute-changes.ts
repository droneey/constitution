import type { ProjectFiles } from '#/kernel/contracts';
import type { AbsolutePath } from '#/kernel/value-objects';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
} from '../../../contracts';
import type { LockRead, PresetsFinding, PresetsProject } from '../../../entities';
import type { FileComputed, UnitComputed } from '../compute-files';
import { computeFiles } from '../compute-files';
import { computePresets } from '../compute-presets';

interface ComputeChangesInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly lockOf: (unitFolderPath: AbsolutePath) => LockRead;
  readonly parser: PresetFileParser;
  readonly project: PresetsProject;
}

interface ChangesComputed {
  /** every unit's files, in the units' order */
  readonly files: readonly FileComputed[];
  /** what the preset files and their entries hold wrong, the files' own findings aside */
  readonly presetsFindings: readonly PresetsFinding[];
  readonly units: readonly UnitComputed[];
}

const computeChanges = (input: ComputeChangesInput): ChangesComputed => {
  const plan = computePresets(input);
  const units = computeFiles({
    ...input,
    plan,
  });

  return {
    files: units.flatMap((unit) => unit.files),
    presetsFindings: plan.findings,
    units,
  };
};

export type { ChangesComputed, ComputeChangesInput };
export { computeChanges };
