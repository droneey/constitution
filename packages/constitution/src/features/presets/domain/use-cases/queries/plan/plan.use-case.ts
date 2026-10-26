import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';

import type { PresetFileParser, ReleaseBuilds } from '../../../contracts';
import type { PresetsPlan } from '../../../entities';
import { computePresets } from '../../shared/compute-presets';

interface PlanPresetsInput {
  readonly builds: ReleaseBuilds;
  readonly files: ProjectFiles;
  readonly parser: PresetFileParser;
  readonly source: ProjectSource;
  readonly start: string;
}

/**
 * @throws {@link ProjectError} when no project is found, its release is not installed, or its
 * constitution.yaml or its blocks cannot be read
 */
const planPresets = (input: PlanPresetsInput): PresetsPlan => {
  const opened = input.source.open(input.start);

  return computePresets({
    builds: input.builds,
    files: input.files,
    model: opened.resolution.model,
    packs: opened.packs,
    parser: input.parser,
    project: opened.project,
    releaseFolder: opened.releaseFolder,
    units: opened.resolution.units,
  });
};

export type { PlanPresetsInput };
export { planPresets };
