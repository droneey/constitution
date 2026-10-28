import { PARENT_SEGMENT, PATH_SEPARATOR, RELEASE_FOLDER_PATH } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel, ProjectUnit } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { RepositoryRelativePath, UnitRelativePath } from '#/kernel/value-objects';
import { AbsolutePath, configFilePath, UnitPath } from '#/kernel/value-objects';

import type { PresetsFinding } from '../../../../../../../entities';
import { PresetEntry, PresetsCode } from '../../../../../../../entities';
import { Fact, FactKind, FactName } from '../../../../../../../value-objects';
import type { Candidate } from '../../../select-entries';
import { candidatePathOf } from '../../../select-entries';

type LackedFact = PresetsCode.MissingConstitution | PresetsCode.MissingName;

interface FileFacts {
  readonly isRoot: boolean;
  readonly isTop: boolean;
  readonly memberPaths: readonly UnitRelativePath[];
  readonly valueOf: (fact: Fact) => string | undefined;
}

interface ReadFactsInput {
  readonly candidate: Candidate;
  readonly candidates: readonly Candidate[];
  readonly constitutionPath: () => string | undefined;
  readonly entry: PresetEntry;
  readonly model: BlockModel;
  readonly units: readonly ProjectUnit[];
}

const isTopOf = (input: ReadFactsInput): boolean =>
  !input.candidates.some(
    (other) =>
      other.entries.some((entry) => entry === input.entry) &&
      !UnitPath.equals(other.unit.path, input.candidate.unit.path) &&
      UnitPath.holds(other.unit.path, input.candidate.unit.path),
  );

const memberPathsOf = (
  unit: ProjectUnit,
  units: readonly ProjectUnit[],
): readonly UnitRelativePath[] =>
  units
    .filter(
      (other) => !UnitPath.equals(other.path, unit.path) && UnitPath.holds(unit.path, other.path),
    )
    .map((other) => UnitPath.pathFrom(unit.path, other.path))
    .toSorted(compareText);

const constitutionPathOf = (input: {
  filePath: RepositoryRelativePath;
  files: ProjectFiles;
  repositoryFolderPath: AbsolutePath;
}): string | undefined => {
  const folderNames = input.filePath.split(PATH_SEPARATOR).slice(0, -1);

  for (let depth = folderNames.length; depth >= 0; depth -= 1) {
    const releaseFolderPath = AbsolutePath.join(
      input.repositoryFolderPath,
      [
        ...folderNames.slice(0, depth),
        RELEASE_FOLDER_PATH,
      ].join(PATH_SEPARATOR),
    );

    if (input.files.isFolder(releaseFolderPath)) {
      return [
        ...Array.from(
          {
            length: folderNames.length - depth,
          },
          () => PARENT_SEGMENT,
        ),
        RELEASE_FOLDER_PATH,
      ].join(PATH_SEPARATOR);
    }
  }

  return undefined;
};

interface ConstitutionPathInput {
  readonly candidate: Candidate;
  readonly files: ProjectFiles;
  readonly repositoryFolderPath: AbsolutePath;
}

const constitutionPathFor = (input: ConstitutionPathInput): (() => string | undefined) => {
  let walked:
    | {
        readonly constitutionPath: string | undefined;
      }
    | undefined;

  return () => {
    walked ??= {
      constitutionPath: constitutionPathOf({
        ...input,
        filePath: candidatePathOf(input.candidate),
      }),
    };

    return walked.constitutionPath;
  };
};

const placeOf = (input: {
  factName: FactName.UnitDepth | FactName.UnitParent;
  unitPath: UnitPath;
}): string | undefined => {
  const [top, ...below] = input.unitPath.split(PATH_SEPARATOR);

  if (below.length === 0) {
    return undefined;
  }

  return input.factName === FactName.UnitParent ? top : String(below.length);
};

const namedValueOf = (input: ReadFactsInput, factName: FactName): string | undefined => {
  const { unit } = input.candidate;

  if (factName === FactName.UnitParent || factName === FactName.UnitDepth) {
    return placeOf({
      factName,
      unitPath: unit.path,
    });
  }

  if (factName === FactName.PackageName) {
    return unit.name;
  }

  return factName === FactName.ConstitutionPath ? input.constitutionPath() : undefined;
};

const lackOf = (fact: Fact): LackedFact | undefined => {
  if (Fact.isNamed(fact, FactName.PackageName)) {
    return PresetsCode.MissingName;
  }

  return Fact.isNamed(fact, FactName.ConstitutionPath)
    ? PresetsCode.MissingConstitution
    : undefined;
};

const readFacts = (input: ReadFactsInput): FileFacts => {
  const memberPaths = memberPathsOf(input.candidate.unit, input.units);

  const factValueOf = (fact: Fact): string | undefined => {
    if (fact.kind === FactKind.Role) {
      return PresetEntry.roleNameOf({
        entry: input.entry,
        id: fact.role,
        model: input.model,
      });
    }

    // Stryker disable next-line ConditionalExpression: an unknown fact names no fact namedValueOf knows
    return fact.kind === FactKind.Named ? namedValueOf(input, fact.name) : undefined;
  };

  return {
    isRoot: memberPaths.length > 0,
    isTop: isTopOf(input),
    memberPaths,
    valueOf: factValueOf,
  };
};

interface LackedFindingInput {
  readonly candidate: Candidate;
  readonly code: LackedFact;
}

const lackedFindingOf = (input: LackedFindingInput): PresetsFinding =>
  input.code === PresetsCode.MissingName
    ? {
        code: PresetsCode.MissingName,
        details: {},
        path: UnitPath.pathOf(input.candidate.unit.path, configFilePath),
      }
    : {
        code: PresetsCode.MissingConstitution,
        details: {},
        path: candidatePathOf(input.candidate),
      };

export type { FileFacts, LackedFact, ReadFactsInput };
export { constitutionPathFor, lackedFindingOf, lackOf, readFacts };
