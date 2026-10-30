import type { ProjectFiles } from '#/kernel/contracts';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { PresetsPlan } from '../../../../domain/presets-plan/entities';
import { ProjectRead } from '../../../../domain/presets-project/entities';
import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
  ProjectReader,
} from '../../../contracts';
import { computePresets } from '../../shared/compute-presets';

interface PlanPresetsInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly parser: PresetFileParser;
  readonly reader: ProjectReader;
  readonly startFolderPath: AbsolutePath;
}

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const planPresets = (input: PlanPresetsInput): ProjectRead<PresetsPlan> =>
  ProjectRead.map(input.reader.open(input.startFolderPath), (project) =>
    computePresets({
      ...input,
      project,
    }),
  );

export type { PlanPresetsInput };
export { planPresets };
