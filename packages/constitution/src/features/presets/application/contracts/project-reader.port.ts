import type { AbsolutePath } from '#/kernel/value-objects';

import type { PresetsProject, ProjectRead } from '../../domain/presets-project/entities';

interface ProjectReader {
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  readonly open: (startFolderPath: AbsolutePath) => ProjectRead<PresetsProject>;
}

export type { ProjectReader };
