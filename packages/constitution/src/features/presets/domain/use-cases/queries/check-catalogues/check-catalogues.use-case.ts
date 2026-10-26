import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel } from '#/kernel/entities';
import { BlockSource, PackPath } from '#/kernel/value-objects';

import type { CatalogueParser } from '../../../contracts';
import type { PresetsFinding } from '../../../entities';
import { PresetEntry } from '../../../entities';
import { checkPresetSets } from '../../shared/check-preset-sets';
import { loadPresetSets } from '../../shared/load-preset-sets';
import { mergeEveryEntry } from './steps/merge-every-entry';

interface CheckCataloguesInput {
  readonly files: ProjectFiles;
  /** absolute */
  readonly folder: string;
  /** whether the folder is the Constitution's release, whose own files and plugins it checks */
  readonly isRelease: boolean;
  /** the model of the folder's blocks, a pack's base among them */
  readonly model: BlockModel;
  readonly parser: CatalogueParser;
}

const packHere = PackPath.create('.');

/**
 * Found from the catalogues and the blocks alone; each finding names its catalogue from the folder.
 */
const checkCatalogues = (input: CheckCataloguesInput): readonly PresetsFinding[] => {
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

export type { CheckCataloguesInput };
export { checkCatalogues };
