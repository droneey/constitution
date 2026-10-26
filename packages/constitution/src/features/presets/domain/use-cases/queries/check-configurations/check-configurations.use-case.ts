import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';

import type { ConfigurationFormat, PresetFileParser, ReleaseBuilds } from '../../../contracts';
import type { LockQueryRepository } from '../../../contracts/repositories/queries';
import type { ConfigurationsCheck } from '../../../entities';
import { checkProject } from '../../shared/check-project';

interface CheckConfigurationsInput {
  readonly builds: ReleaseBuilds;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly locks: LockQueryRepository;
  readonly parser: PresetFileParser;
  readonly source: ProjectSource;
  readonly start: string;
}

/**
 * A file is reported where an apply would change it, defaults aside. Undefined where no project is.
 *
 * @throws {@link ProjectError} when its release is not installed, or its constitution.yaml or its
 * blocks cannot be read
 */
const checkConfigurations = (input: CheckConfigurationsInput): ConfigurationsCheck | undefined => {
  if (input.source.find(input.start) === undefined) {
    return undefined;
  }

  const project = input.source.open(input.start);
  const check = checkProject({
    builds: input.builds,
    files: input.files,
    formats: input.formats,
    lockOf: input.locks.read,
    parser: input.parser,
    project,
  });

  return {
    findings: check.findings,
    warnings: [
      ...project.resolution.warnings,
      ...check.warnings,
    ],
  };
};

export type { CheckConfigurationsInput };
export { checkConfigurations };
