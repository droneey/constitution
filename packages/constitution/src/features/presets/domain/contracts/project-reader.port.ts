import type { AbsolutePath } from '#/kernel/value-objects';

import type { PresetsProject, ProjectRead } from '../entities';

/**
 * The project whose presets are planned, checked and applied. Open lets through the failure to read
 * its constitution.yaml or to list its release's blocks, which only the handler of last resort
 * words.
 */
interface ProjectReader {
  /** the project around the start folder, or why it cannot be read */
  readonly open: (startFolderPath: AbsolutePath) => ProjectRead<PresetsProject>;
}

export type { ProjectReader };
