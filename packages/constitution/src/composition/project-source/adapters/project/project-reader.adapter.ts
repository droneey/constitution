import type { PresetsProject, ProjectReader } from '#/features/presets';
import { ProjectRead, ProjectReadStatus } from '#/features/presets';
import type { ProjectPorts } from '#/features/project';
import { OpeningStatus, openProject } from '#/features/project';
import type { AbsolutePath } from '#/kernel/value-objects';

import { presetsProjectOf } from './presets-project.utils';

const createProjectReader = (ports: ProjectPorts): ProjectReader => ({
  /**
   * @throws {UnreadableFileError} when the project's constitution.yaml cannot be read
   * @throws {ReleaseError} when the release's blocks cannot be listed
   */
  open: (startFolderPath: AbsolutePath): ProjectRead<PresetsProject> => {
    const opening = openProject({
      ...ports,
      startFolderPath,
    });

    if (opening.status === OpeningStatus.Opened) {
      return ProjectRead.opened(presetsProjectOf(opening.project));
    }

    if (opening.status === OpeningStatus.NoProject) {
      return {
        status: ProjectReadStatus.NoProject,
      };
    }

    if (opening.status === OpeningStatus.ReleaseMissing) {
      return {
        releaseFolderPath: opening.releaseFolderPath,
        status: ProjectReadStatus.ReleaseMissing,
      };
    }

    return {
      lines: opening.lines,
      status: ProjectReadStatus.ConfigUnparsed,
    };
  },
});

export { createProjectReader };
