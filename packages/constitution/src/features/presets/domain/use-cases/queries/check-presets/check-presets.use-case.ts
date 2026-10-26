import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import { BlockSource, PackPath } from '#/kernel/value-objects';

import type { DistributionSources, PresetFileParser } from '../../../contracts';
import type { PresetsFinding } from '../../../entities';
import { PresetEntry } from '../../../entities';
import { checkPresetSets } from '../../shared/check-preset-sets';
import { loadPresetSets } from '../../shared/load-preset-sets';
import { mergeEveryEntry } from './steps/merge-every-entry';

interface CheckPresetsInput {
  /** what the folder's build makes, which its source tree need not hold */
  readonly distribution: DistributionSources;
  readonly files: ProjectFiles;
  /** absolute */
  readonly folder: string;
  /** whether the folder is the Constitution's release, whose own files and plugins it checks */
  readonly isRelease: boolean;
  /** the model of the folder's blocks, a pack's base among them */
  readonly model: BlockModel;
  readonly parser: PresetFileParser;
}

const packHere = PackPath.create('.');

/** Each finding names its preset file by its path from the folder. */
const checkPresets = (input: CheckPresetsInput): readonly PresetsFinding[] => {
  const loaded = loadPresetSets({
    files: input.files,
    folder: input.folder,
    parser: input.parser,
    source: input.isRelease ? BlockSource.create() : BlockSource.create(packHere),
    where: '',
  });
  const entries = loaded.entries.toSorted(PresetEntry.orderOf(input.model));

  return [
    ...loaded.findings,
    ...checkPresetSets({
      entries,
      model: input.model,
      ...(input.isRelease
        ? {
            release: {
              distributed: input.distribution.packagesOf(input.folder),
              files: input.files,
              folder: input.folder,
              where: '',
            },
          }
        : {}),
    }),
    ...mergeEveryEntry(entries),
  ];
};

export type { CheckPresetsInput };
export { checkPresets };
