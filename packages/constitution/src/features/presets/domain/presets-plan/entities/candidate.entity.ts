import { PARENT_SEGMENT, PATH_SEPARATOR, RELEASE_FOLDER_PATH } from '#/kernel/constants';
import type { ProjectUnit } from '#/kernel/entities';
import type { RepositoryRelativePath } from '#/kernel/value-objects';
import { configFilePath, UnitPath } from '#/kernel/value-objects';

import { PresetEntry } from '../../preset-entry/entities';
import type { TargetFile, TargetRun } from '../../shared/value-objects';
import { Fact, FactName, TargetKind } from '../../shared/value-objects';

interface FileCandidate {
  readonly droppedByOverrideOrAxis: readonly PresetEntry[];
  readonly entries: readonly (PresetEntry & TargetFile)[];
  readonly filePath: RepositoryRelativePath;
  readonly kind: TargetKind.File;
  readonly unit: ProjectUnit;
}

interface RunCandidate {
  readonly droppedByOverrideOrAxis: readonly PresetEntry[];
  readonly entries: readonly (PresetEntry & TargetRun)[];
  readonly kind: TargetKind.Run;
  readonly unit: ProjectUnit;
}

type Candidate = FileCandidate | RunCandidate;

interface ReleaseProbe {
  readonly constitutionPath: string;
  readonly releaseFolderPath: string;
}

const pathOf = (candidate: Candidate): RepositoryRelativePath => {
  switch (candidate.kind) {
    case TargetKind.File:
      return candidate.filePath;
    case TargetKind.Run:
      return UnitPath.pathOf(candidate.unit.path, configFilePath);
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return candidate satisfies never;
  }
};

const namesConstitutionPath = (candidate: Candidate): boolean =>
  [
    ...candidate.entries,
    ...candidate.droppedByOverrideOrAxis,
  ].some((entry) =>
    [
      entry.guard === undefined ? undefined : Fact.textOf(entry.guard.fact),
      entry.guard?.equals,
      ...PresetEntry.textsOf(entry).map(({ text }) => text),
    ]
      .filter((text) => text !== undefined)
      .flatMap((text) => Fact.referencesIn(text))
      .some(({ fact }) => Fact.isNamed(fact, FactName.ConstitutionPath)),
  );

const releaseProbesOf = (candidate: Candidate): readonly ReleaseProbe[] => {
  const folderNames = pathOf(candidate).split(PATH_SEPARATOR).slice(0, -1);

  return folderNames
    .map((_, index) => folderNames.length - index)
    .concat(0)
    .map((depth) => ({
      constitutionPath: [
        ...Array.from(
          {
            length: folderNames.length - depth,
          },
          () => PARENT_SEGMENT,
        ),
        RELEASE_FOLDER_PATH,
      ].join(PATH_SEPARATOR),
      releaseFolderPath: [
        ...folderNames.slice(0, depth),
        RELEASE_FOLDER_PATH,
      ].join(PATH_SEPARATOR),
    }));
};

const Candidate = {
  namesConstitutionPath,
  pathOf,
  releaseProbesOf,
} as const;

export type { FileCandidate, ReleaseProbe, RunCandidate };
export { Candidate };
