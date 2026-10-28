import type { ProjectFiles } from '#/kernel/contracts';
import type { AbsolutePath } from '#/kernel/value-objects';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
  ProjectReader,
} from '../../../contracts';
import type { PresetsPlan } from '../../../entities';
import { ProjectRead } from '../../../entities';
import { computePresets } from '../../shared/compute-presets';

interface PlanPresetsInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly parser: PresetFileParser;
  readonly reader: ProjectReader;
  readonly startFolderPath: AbsolutePath;
}

const planPresets = (input: PlanPresetsInput): ProjectRead<PresetsPlan> =>
  ProjectRead.map(input.reader.open(input.startFolderPath), (project) =>
    computePresets({
      ...input,
      project,
    }),
  );

export type { PlanPresetsInput };
export { planPresets };
