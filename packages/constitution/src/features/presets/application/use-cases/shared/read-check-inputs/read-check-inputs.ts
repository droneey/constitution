import { PRESETS_FOLDER_NAME } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import type { RepositoryRelativePath } from '#/kernel/value-objects';
import { AbsolutePath } from '#/kernel/value-objects';

import type { ReleaseFiles } from '../../../../domain/check-preset-sets/services';
import { releaseFilesNamedBy } from '../../../../domain/check-preset-sets/services';
import type { PresetEntry } from '../../../../domain/preset-entry/entities';
import { TargetKind } from '../../../../domain/shared/value-objects';
import type { ConfigurationFormat, DistributionSources } from '../../../contracts';

interface ReleaseSources {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly folderPath: AbsolutePath;
  readonly folderPathFromRepository: RepositoryRelativePath;
}

interface ReadCheckInputsInput {
  readonly entries: readonly PresetEntry[];
  readonly formats: ConfigurationFormat;
  readonly model: BlockModel;
  readonly release?: ReleaseSources;
}

interface CheckInputs {
  readonly release?: ReleaseFiles;
  readonly sortable: ReadonlySet<PresetEntry>;
}

const releaseFilesOf = (
  input: ReleaseSources & {
    entries: readonly PresetEntry[];
    model: BlockModel;
  },
): ReleaseFiles => {
  const { files, folderPath } = input;

  return {
    distributed: input.distribution.builtFilesOf(folderPath),
    existing: new Set(
      releaseFilesNamedBy(input).filter((pathInRelease) =>
        files.exists(AbsolutePath.join(folderPath, pathInRelease)),
      ),
    ),
    folderPathFromRepository: input.folderPathFromRepository,
    // Stryker disable next-line ArrayDeclaration: a path that is no plugin's gives no finding
    pathsInPresets: files.listFiles(AbsolutePath.join(folderPath, PRESETS_FOLDER_NAME)) ?? [],
  };
};

const readCheckInputs = (input: ReadCheckInputsInput): CheckInputs => {
  const { entries, release } = input;

  return {
    ...(release === undefined
      ? {}
      : {
          release: releaseFilesOf({
            ...release,
            entries,
            model: input.model,
          }),
        }),
    sortable: new Set(
      entries.filter((entry) => entry.kind === TargetKind.File && input.formats.canSortKeys(entry)),
    ),
  };
};

export type { CheckInputs, ReadCheckInputsInput, ReleaseSources };
export { readCheckInputs };
