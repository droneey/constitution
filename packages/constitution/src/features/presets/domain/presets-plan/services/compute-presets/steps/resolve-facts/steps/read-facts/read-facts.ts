import { PATH_SEPARATOR } from '#/kernel/constants';
import type { BlockModel, ProjectUnit } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import type { UnitRelativePath } from '#/kernel/value-objects';
import { configFilePath, UnitPath } from '#/kernel/value-objects';

import { PresetEntry } from '../../../../../../../preset-entry/entities';
import type { PresetsFinding } from '../../../../../../../shared/entities';
import { PresetsCode } from '../../../../../../../shared/entities';
import { Fact, FactKind, FactName } from '../../../../../../../shared/value-objects';
import { Candidate } from '../../../../../../entities';

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
  readonly constitutionPath: string | undefined;
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

  return factName === FactName.ConstitutionPath ? input.constitutionPath : undefined;
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
        path: Candidate.pathOf(input.candidate),
      };

export type { FileFacts, LackedFact, ReadFactsInput };
export { lackedFindingOf, lackOf, readFacts };
