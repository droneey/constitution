import { RELEASE_FOLDER_PATH } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectUnit, ProjectWarning } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

import { PresetsProject } from '../../../../../../domain/presets-project/entities';

interface FindReleaseLoopsInput {
  readonly files: ProjectFiles;
  readonly repositoryFolderPath: AbsolutePath;
  readonly units: readonly ProjectUnit[];
}

const findReleaseLoops = (input: FindReleaseLoopsInput): readonly ProjectWarning[] =>
  input.units.flatMap((unit) => {
    const unitFolderPath = AbsolutePath.join(input.repositoryFolderPath, unit.path);

    return PresetsProject.releaseLoopOf({
      realReleaseFolderPath: input.files.realFolder(
        AbsolutePath.join(unitFolderPath, RELEASE_FOLDER_PATH),
      ),
      realUnitFolderPath: input.files.realFolder(unitFolderPath),
      unitPath: unit.path,
    });
  });

export { findReleaseLoops };
