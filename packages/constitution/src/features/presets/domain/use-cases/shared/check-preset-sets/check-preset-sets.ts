import type { BlockModel } from '#/kernel/entities';
import { SourceKind } from '#/kernel/value-objects';

import type { ConfigurationFormat } from '../../../contracts';
import type { PresetEntry, PresetSet, PresetsProblem } from '../../../entities';
import { PresetsFinding } from '../../../entities';
import { RoleNames } from '../../../value-objects';
import type { ReleaseFiles } from './checks';
import {
  entryProblems,
  indexOf,
  namingProblems,
  releaseFindings,
  setProblems,
  sortingProblems,
} from './checks';

/** How a pack's preset files may name a role; the release's always name it by its id. */
enum PackRoleNaming {
  /** a pack checked on its own, which others take */
  ById = 'by-id',
  /** the project's own packs, which may write its folders by their names */
  ByIdOrName = 'by-id-or-name',
}

interface CheckPresetSetsInput {
  readonly entries: readonly PresetEntry[];
  readonly formats: ConfigurationFormat;
  readonly model: BlockModel;
  readonly packRoleNaming: PackRoleNaming;
  /** the release whose files and plugins its entries name; absent where no release is checked */
  readonly release?: ReleaseFiles;
}

const at =
  (set: PresetSet) =>
  (problem: PresetsProblem): PresetsFinding => ({
    ...problem,
    path: set.filePath,
  });

const checkPresetSets = (input: CheckPresetSetsInput): readonly PresetsFinding[] => {
  const index = indexOf(input.model);
  const names = RoleNames.of(input.model);
  const sets = [
    ...new Map(
      input.entries.map((entry) => [
        entry.set.filePath,
        entry.set,
      ]),
    ).values(),
  ];

  return PresetsFinding.eachOnce([
    ...sets.flatMap((set) =>
      setProblems({
        index,
        set,
      }).map(at(set)),
    ),
    ...input.entries.flatMap((entry) =>
      [
        ...entryProblems({
          entry,
          index,
          model: input.model,
        }),
        ...namingProblems({
          entry,
          names:
            input.packRoleNaming === PackRoleNaming.ByIdOrName &&
            entry.set.source.kind === SourceKind.Pack
              ? RoleNames.none
              : names,
          roleIds: index.roleIds,
        }),
        ...sortingProblems({
          entry,
          formats: input.formats,
        }),
      ].map(at(entry.set)),
    ),
    ...(input.release === undefined
      ? []
      : releaseFindings({
          entries: input.entries,
          model: input.model,
          release: input.release,
          rules: new Set(index.rules.keys()),
        })),
  ]);
};

export type { CheckPresetSetsInput };
export { checkPresetSets, PackRoleNaming };
