import { memoised } from '#/kernel/utils';
import { AbsolutePath } from '#/kernel/value-objects';

import type { ActiveRulesSource, WorkingTree } from '../../../../contracts';
import { IgnoreStatus } from '../../../../contracts';

interface UnignoredFilesInput {
  readonly paths: readonly AbsolutePath[];
  readonly source: ActiveRulesSource;
  readonly workingTree: WorkingTree;
}

const ignoredIn = (input: {
  paths: readonly AbsolutePath[];
  repositoryFolderPath: AbsolutePath;
  workingTree: WorkingTree;
}): readonly AbsolutePath[] => {
  const told = input.workingTree.ignoredAmong(input);

  return input.paths.filter((path) => told.status === IgnoreStatus.Told && told.paths.has(path));
};

// Why: a file git ignores is outside the gate, and one it cannot tell of, or that lies in no
// project, is held to the rules, so the gate fails closed. Git is asked once for each repository.
const unignoredFilesAmong = (input: UnignoredFilesInput): readonly AbsolutePath[] => {
  const placeOf = memoised((folder: AbsolutePath) => input.source.findProjectAround(folder));
  const byRepository = Map.groupBy(
    input.paths.flatMap((path) => {
      const place = placeOf(AbsolutePath.parentOf(path));

      return place === undefined
        ? []
        : [
            {
              path,
              repositoryFolderPath: place.repositoryFolderPath,
            },
          ];
    }),
    (file) => file.repositoryFolderPath,
  );
  const ignored = new Set(
    [
      ...byRepository,
    ].flatMap(([repositoryFolderPath, files]) =>
      ignoredIn({
        paths: files.map((file) => file.path),
        repositoryFolderPath,
        workingTree: input.workingTree,
      }),
    ),
  );

  return input.paths.filter((path) => !ignored.has(path));
};

export { unignoredFilesAmong };
