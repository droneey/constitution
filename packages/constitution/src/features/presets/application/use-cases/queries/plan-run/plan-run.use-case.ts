import type { ProjectFiles } from '#/kernel/contracts';

import type { PresetsProject } from '../../../../domain/presets-project/entities';
import { ProjectRead } from '../../../../domain/presets-project/entities';
import type { RunAsked } from '../../../../domain/run-plan/entities';
import { RunPlan } from '../../../../domain/run-plan/entities';
import { indexDiagnostics } from '../../../../domain/run-plan/services';
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
  const { project } = input;
  const plan = computePresets(input);

  return RunPlan.of({
    asked: input,
    findings: plan.findings,
    indexes: indexDiagnostics({
      files: plan.files,
      lowerings: project.lowerings,
      model: project.model,
    }),
    project,
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
