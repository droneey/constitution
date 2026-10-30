import type { BlockModel } from '#/kernel/entities';
import type { BlockSource } from '#/kernel/value-objects';
import { SourceKind } from '#/kernel/value-objects';

import type { PresetEntry, PresetSet, PresetsProblem } from '../../entities';
import { PresetsFinding } from '../../entities';
import { RoleNames } from '../../value-objects';
import { indexOf } from './steps/index-model';
import { namingProblems } from './steps/naming-problems';
import { entryProblems, setProblems } from './steps/placement-problems';
import type { ReleaseFiles } from './steps/release-findings';
import { releaseFindings } from './steps/release-findings';
import { sortingProblems } from './steps/sorting-problems';

enum PackRoleNaming {
  ById = 'by-id',
  ByIdOrName = 'by-id-or-name',
}

interface CheckPresetSetsInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  readonly packRoleNaming: PackRoleNaming;
  readonly release?: ReleaseFiles;
  readonly sortable: ReadonlySet<PresetEntry>;
}

const isReleaseChecked = (source: BlockSource): boolean => source.kind === SourceKind.Release;

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
          sortable: input.sortable,
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
export { checkPresetSets, isReleaseChecked, PackRoleNaming };
