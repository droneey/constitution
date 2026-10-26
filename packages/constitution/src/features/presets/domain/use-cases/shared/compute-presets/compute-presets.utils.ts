import { RELEASE_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel, ProjectUnit } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { BlockSource, PackPath } from '#/kernel/value-objects';

import type { CatalogueParser } from '../../../contracts';
import type { PresetsFinding, PresetsPlan } from '../../../entities';
import { PresetEntry } from '../../../entities';
import { checkPresetSets } from '../check-preset-sets';
import { loadPresetSets } from '../load-preset-sets';
import { mergeEntries } from './steps/merge-entries';
import { resolveFacts } from './steps/resolve-facts';
import { selectEntries } from './steps/select-entries';

interface ComputePresetsInput {
  readonly files: ProjectFiles;
  readonly model: BlockModel;
  /** each from the repository */
  readonly packs: readonly PackPath[];
  readonly parser: CatalogueParser;
  /** absolute */
  readonly project: string;
  /** absolute */
  readonly releaseFolder: string;
  readonly units: readonly ProjectUnit[];
}

const SEPARATOR = '/';

// Each finding once, though several files of a unit find the one name it lacks.
const eachOnce = (findings: readonly PresetsFinding[]): readonly PresetsFinding[] => [
  ...new Map(
    findings.map((finding) => [
      JSON.stringify(finding),
      finding,
    ]),
  ).values(),
];

const computePresets = (input: ComputePresetsInput): PresetsPlan => {
  const { files, parser } = input;
  const loaded = [
    loadPresetSets({
      files,
      folder: input.releaseFolder,
      parser,
      source: BlockSource.create(),
      where: RELEASE_FOLDER,
    }),
    ...input.packs.map((pack) =>
      loadPresetSets({
        files,
        folder: `${input.project}${SEPARATOR}${PackPath.normalOf(pack)}`,
        parser,
        source: BlockSource.create(pack),
        where: PackPath.normalOf(pack),
      }),
    ),
  ];
  const entries = loaded.flatMap((one) => one.entries).toSorted(PresetEntry.orderOf(input.model));
  const resolved = resolveFacts({
    ...input,
    candidates: selectEntries({
      entries,
      model: input.model,
      units: input.units,
    }),
  });
  const merged = mergeEntries(resolved.files);

  return {
    files: merged.files.toSorted((left, right) => compareText(left.file, right.file)),
    findings: eachOnce([
      ...loaded.flatMap((one) => one.findings),
      ...checkPresetSets({
        entries,
        model: input.model,
        release: {
          files,
          folder: input.releaseFolder,
          where: RELEASE_FOLDER,
        },
      }),
      ...resolved.findings,
      ...merged.findings,
    ]),
  };
};

export type { ComputePresetsInput };
export { computePresets };
