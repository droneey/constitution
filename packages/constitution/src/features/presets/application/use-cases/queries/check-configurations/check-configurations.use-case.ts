import type { ProjectFiles } from '#/kernel/contracts';
import type { AbsolutePath } from '#/kernel/value-objects';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
  ProjectReader,
} from '../../../contracts';
import type { LockQueryRepository } from '../../../contracts/repositories/queries';
import type { ConfigurationsCheck } from '../../../../domain/entities';
import { ProjectRead } from '../../../../domain/entities';
import { checkProject } from '../../shared/check-project';

interface CheckConfigurationsInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly locks: LockQueryRepository;
  readonly parser: PresetFileParser;
  readonly reader: ProjectReader;
  readonly startFolderPath: AbsolutePath;
}

/**
 * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
 * @throws {ReleaseError} when the release's blocks cannot be listed
 */
const checkConfigurations = (input: CheckConfigurationsInput): ProjectRead<ConfigurationsCheck> =>
  ProjectRead.map(input.reader.open(input.startFolderPath), (project) => {
    const check = checkProject({
      distribution: input.distribution,
      files: input.files,
      formats: input.formats,
      lockOf: input.locks.read,
      parser: input.parser,
      project,
    });

    return {
      findings: check.findings,
      warnings: [
        ...project.warnings,
        ...check.warnings,
      ],
    };
  });

export type { CheckConfigurationsInput };
export { checkConfigurations };
