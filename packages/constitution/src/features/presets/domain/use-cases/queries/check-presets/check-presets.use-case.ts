import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import type { AbsolutePath, BlockSource } from '#/kernel/value-objects';
import { RepositoryRelativePath, SourceKind } from '#/kernel/value-objects';

import type {
  ConfigurationFormat,
  DistributionSources,
  PresetFileParser,
} from '../../../contracts';
import type { PresetsFinding } from '../../../entities';
import { PresetEntry } from '../../../entities';
import { checkPresetSets, PackRoleNaming } from '../../shared/check-preset-sets';
import { loadPresetSets } from '../../shared/load-preset-sets';
import { mergeEveryEntry } from './steps/merge-every-entry';

interface CheckPresetsInput {
  /** what the folder's build makes, which its source tree need not hold */
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  /** the model of the folder's blocks, a pack's base among them */
  readonly model: BlockModel;
  readonly parser: PresetFileParser;
  /** what the folder is: the Constitution's release, whose own files and plugins it checks, or a pack */
  readonly source: BlockSource;
  /** the folder of the Constitution or the pack checked */
  readonly sourceFolderPath: AbsolutePath;
}

// The folder checked stands for the repository its findings' paths start from.
const checkedFolderPathFromRepository = RepositoryRelativePath.create('');

const checkPresets = (input: CheckPresetsInput): readonly PresetsFinding[] => {
  const loaded = loadPresetSets({
    files: input.files,
    parser: input.parser,
    source: input.source,
    sourceFolderPath: input.sourceFolderPath,
    sourceFolderPathFromRepository: checkedFolderPathFromRepository,
  });
  const entries = loaded.entries.toSorted(PresetEntry.orderOf(input.model));

  return [
    ...loaded.findings,
    ...checkPresetSets({
      entries,
      formats: input.formats,
      model: input.model,
      packRoleNaming: PackRoleNaming.ById,
      ...(input.source.kind === SourceKind.Release
        ? {
            release: {
              distributed: input.distribution.builtFilesOf(input.sourceFolderPath),
              files: input.files,
              folderPath: input.sourceFolderPath,
              folderPathFromRepository: checkedFolderPathFromRepository,
            },
          }
        : {}),
    }),
    ...mergeEveryEntry(entries),
  ];
};

export type { CheckPresetsInput };
export { checkPresets };
