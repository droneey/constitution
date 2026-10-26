import type { BlockModel, RoleTerm } from '#/kernel/entities';

import type { PresetEntry, PresetSet, PresetsFinding, PresetsProblem } from '../../../entities';
import { namingProblems } from './naming-checks.utils';
import { entryProblems, indexOf, setProblems } from './placement-checks.utils';
import type { ReleaseFiles } from './release-checks.utils';
import { releaseFindings } from './release-checks.utils';
import { roleNamesOf } from './role-names.utils';

interface CheckPresetSetsInput {
  readonly entries: readonly PresetEntry[];
  readonly model: BlockModel;
  /** the release whose files and plugins its entries name; absent where no release is checked */
  readonly release?: ReleaseFiles;
}

const at =
  (set: PresetSet) =>
  (problem: PresetsProblem): PresetsFinding => ({
    ...problem,
    path: set.file,
  });

// Each finding once, though an entry names one wrong thing twice.
const eachOnce = (findings: readonly PresetsFinding[]): readonly PresetsFinding[] => {
  const seen = new Set<string>();

  return findings.filter((finding) => {
    const key = JSON.stringify(finding);
    const isNew = !seen.has(key);

    seen.add(key);

    return isNew;
  });
};

const checkPresetSets = (input: CheckPresetSetsInput): readonly PresetsFinding[] => {
  const index = indexOf(input.model);
  const names = roleNamesOf(input.model);
  const roles = new Map<string, RoleTerm>(
    input.model.roles.flatMap((term) =>
      // Stryker disable next-line ConditionalExpression: a term kept under no id is never looked up
      term.id === undefined
        ? []
        : [
            [
              term.id,
              term,
            ],
          ],
    ),
  );
  const sets = [
    ...new Map(
      input.entries.map((entry) => [
        entry.set.file,
        entry.set,
      ]),
    ).values(),
  ];

  return eachOnce([
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
        }),
        ...namingProblems({
          entry,
          names,
          roles,
        }),
      ].map(at(entry.set)),
    ),
    ...(input.release === undefined
      ? []
      : releaseFindings({
          entries: input.entries,
          release: input.release,
          roles,
          rules: new Set(index.rules.keys()),
        })),
  ]);
};

export type { CheckPresetSetsInput };
export { checkPresetSets };
