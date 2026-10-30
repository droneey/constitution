import type { ProjectFiles } from '#/kernel/contracts';

import type { PresetsProject } from '../../../../domain/presets-project/entities';
import { ProjectRead } from '../../../../domain/presets-project/entities';
import type { RunAsked } from '../../../../domain/run-plan/entities';
import { RunPlan } from '../../../../domain/run-plan/entities';
import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
  ProjectReader,
} from '../../../contracts';
import { computePresets } from '../../shared/compute-presets';

interface PlanRunInput extends RunAsked {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly parser: PresetFileParser;
  readonly reader: ProjectReader;
}

const planOf = (
  input: PlanRunInput & {
    project: PresetsProject;
  },
): RunPlan => {
  const plan = computePresets(input);

  return RunPlan.of({
    asked: input,
    findings: plan.findings,
    project: input.project,
    runs: plan.runs,
  });
};

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const planRun = (input: PlanRunInput): ProjectRead<RunPlan> =>
  ProjectRead.map(input.reader.open(input.startFolderPath), (project) =>
    planOf({
      ...input,
      project,
    }),
  );

export type { PlanRunInput };
export { planRun };
