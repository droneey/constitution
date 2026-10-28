import { PATH_SEPARATOR, RELEASE_FOLDER_PATH } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectUnit, ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import { AbsolutePath } from '#/kernel/value-objects';

interface FindReleaseLoopsInput {
  readonly files: ProjectFiles;
  readonly repositoryFolderPath: AbsolutePath;
  readonly units: readonly ProjectUnit[];
}

const findReleaseLoops = (input: FindReleaseLoopsInput): readonly ProjectWarning[] =>
  input.units.flatMap((unit) => {
    const unitFolderPath = AbsolutePath.join(input.repositoryFolderPath, unit.path);
    const target = input.files.realFolder(AbsolutePath.join(unitFolderPath, RELEASE_FOLDER_PATH));
    const segments =
      `${input.files.realFolder(unitFolderPath)}${PATH_SEPARATOR}${RELEASE_FOLDER_PATH}`.split(
        PATH_SEPARATOR,
      );
    const holders = segments.map((_, index) => segments.slice(0, index).join(PATH_SEPARATOR));

    return holders.some((holder) => holder === target)
      ? [
          {
            details: {
              unit: unit.path,
            },
            kind: WarningKind.ReleaseLinkLoops,
          } satisfies ProjectWarning,
        ]
      : [];
  });

export { findReleaseLoops };
