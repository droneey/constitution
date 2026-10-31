import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import type { AbsolutePath, BlockSource } from '#/kernel/value-objects';
import { RepositoryRelativePath } from '#/kernel/value-objects';

import {
  checkPresetSets,
  isReleaseChecked,
  PackRoleNaming,
} from '../../../../domain/check-preset-sets/services';
import { PresetEntry } from '../../../../domain/preset-entry/entities';
import type { PresetsFinding } from '../../../../domain/shared/entities';
import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
} from '../../../contracts';
import { loadPresetSets } from '../../shared/load-preset-sets';
import { readCheckInputs } from '../../shared/read-check-inputs';

interface CheckPresetsInput {
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly model: BlockModel;
  readonly parser: PresetFileParser;
  readonly source: BlockSource;
  readonly sourceFolderPath: AbsolutePath;
}

const checkedFolderPathFromRepository = RepositoryRelativePath.create('');

const checkPresets = (input: CheckPresetsInput): readonly PresetsFinding[] => {
  const { model } = input;
  const loaded = loadPresetSets({
    files: input.files,
    parser: input.parser,
    source: input.source,
    sourceFolderPath: input.sourceFolderPath,
    sourceFolderPathFromRepository: checkedFolderPathFromRepository,
  });
  const entries = loaded.entries.toSorted(PresetEntry.orderOf(model));

  return [
    ...loaded.findings,
    ...checkPresetSets({
      entries,
      model,
      packRoleNaming: PackRoleNaming.ById,
      ...readCheckInputs({
        entries,
        formats: input.formats,
        model,
        ...(isReleaseChecked(input.source)
          ? {
              release: {
                distribution: input.distribution,
                files: input.files,
                folderPath: input.sourceFolderPath,
                folderPathFromRepository: checkedFolderPathFromRepository,
              },
            }
          : {}),
      }),
    }),
    ...PresetEntry.mergeProblemsOf(entries),
  ];
};

export type { CheckPresetsInput };
export { checkPresets };
