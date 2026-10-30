import type { ProjectFiles } from '#/kernel/contracts';
import type { AbsolutePath } from '#/kernel/value-objects';

import { ApplyPlan } from '../../../../domain/apply-plan/entities';
import type { PresetsProject } from '../../../../domain/presets-project/entities';
import { ProjectRead } from '../../../../domain/presets-project/entities';
import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
  ProjectReader,
} from '../../../contracts';
import type { LockQueryRepository } from '../../../contracts/repositories/queries';
import { computeChanges } from '../../shared/compute-changes';

interface PlanApplyInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly locks: LockQueryRepository;
  readonly parser: PresetFileParser;
  readonly reader: ProjectReader;
  readonly startFolderPath: AbsolutePath;
}

const planOf = (
  input: PlanApplyInput & {
    project: PresetsProject;
  },
): ApplyPlan =>
  ApplyPlan.of({
    ...computeChanges({
      ...input,
      lockOf: input.locks.read,
    }),
    repositoryFolderPath: input.project.repositoryFolderPath,
  });

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const planApply = (input: PlanApplyInput): ProjectRead<ApplyPlan> =>
  ProjectRead.map(input.reader.open(input.startFolderPath), (project) =>
    planOf({
      ...input,
      project,
    }),
  );

export type { PlanApplyInput };
export { planApply };
