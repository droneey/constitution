import { CONFIG_FILE, RELEASE_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel, ProjectUnit } from '#/kernel/entities';
import { Term } from '#/kernel/entities';
import { compareText } from '#/kernel/utils';
import { UnitPath } from '#/kernel/value-objects';

import type { Contribution, PresetsFinding, PresetValue } from '../../../../../entities';
import { PresetEntry, PresetsCode, Setting, ValueKind } from '../../../../../entities';
import type { Guard } from '../../../../../value-objects';
import { Fact, FactKind, FactName, membersText } from '../../../../../value-objects';
import type { Candidate } from '../select-entries';

interface ResolvedFile {
  readonly contributions: readonly Contribution[];
  readonly entries: readonly PresetEntry[];
  /** its path from the repository */
  readonly file: string;
  readonly unit: ProjectUnit;
}

interface FilesResolved {
  readonly files: readonly ResolvedFile[];
  readonly findings: readonly PresetsFinding[];
}

enum OutcomeKind {
  Resolved = 'resolved',
  /** every item a list held was a member, and the file's unit has none */
  Emptied = 'emptied',
  /** a fact the file cannot be given */
  Unresolved = 'unresolved',
}

type Outcome<TValue> =
  | {
      readonly kind: OutcomeKind.Emptied | OutcomeKind.Unresolved;
    }
  | {
      readonly kind: OutcomeKind.Resolved;
      readonly value: TValue;
    };

interface FileFacts {
  readonly isRoot: boolean;
  readonly isTop: boolean;
  /** the units below the file's unit, by their paths from it */
  readonly members: readonly string[];
  readonly valueOf: (fact: Fact) => string | undefined;
}

const SEPARATOR = '/';
const PARENT = '..';
// Stryker disable next-line ObjectLiteral: an outcome of no kind is taken as nothing
const emptied: Outcome<never> = {
  kind: OutcomeKind.Emptied,
};
const unresolved: Outcome<never> = {
  kind: OutcomeKind.Unresolved,
};

const resolved = <TValue>(given: TValue): Outcome<TValue> => ({
  kind: OutcomeKind.Resolved,
  value: given,
});

const textOf = (text: string, facts: FileFacts): Outcome<string> => {
  const written = Fact.resolvedIn({
    text,
    valueOf: facts.valueOf,
  });

  return written === undefined ? unresolved : resolved(written);
};

const booleanOf = (fact: Fact | undefined, facts: FileFacts): boolean | undefined => {
  if (fact !== undefined && Fact.isNamed(fact, FactName.FileIsTop)) {
    return facts.isTop;
  }

  return fact !== undefined && Fact.isNamed(fact, FactName.WorkspaceIsRoot)
    ? facts.isRoot
    : undefined;
};

// The outcome of pairs: an unresolved one unresolves them all, and those the members empty go; when
// they all go, so does what held them.
const pairsOf = <TValue>(input: {
  outcomes: readonly (readonly [
    Outcome<string>,
    Outcome<TValue>,
  ])[];
}): Outcome<
  readonly (readonly [
    string,
    TValue,
  ])[]
> => {
  const pairs: (readonly [
    string,
    TValue,
  ])[] = [];

  for (const [key, held] of input.outcomes) {
    if (key.kind === OutcomeKind.Unresolved || held.kind === OutcomeKind.Unresolved) {
      return unresolved;
    }

    // Stryker disable next-line ConditionalExpression: a key is a text, which is never emptied
    if (key.kind === OutcomeKind.Resolved && held.kind === OutcomeKind.Resolved) {
      pairs.push([
        key.value,
        held.value,
      ]);
    }
  }

  return pairs.length === 0 && input.outcomes.length > 0 ? emptied : resolved(pairs);
};

const itemsOf = (list: readonly Setting[], facts: FileFacts): Outcome<Setting> => {
  const items: Setting[] = [];
  let hasMembers = false;

  for (const listed of list) {
    const isMembers = typeof listed === 'string' && listed.includes(membersText);
    const outcomes = isMembers
      ? facts.members.map((member) => textOf(listed.replaceAll(membersText, member), facts))
      : [
          settingOf(listed, facts),
        ];

    hasMembers ||= isMembers;

    for (const outcome of outcomes) {
      if (outcome.kind === OutcomeKind.Unresolved) {
        return unresolved;
      }

      if (outcome.kind === OutcomeKind.Resolved) {
        items.push(outcome.value);
      }
    }
  }

  return items.length === 0 && hasMembers ? emptied : resolved(items);
};

const settingOf = (setting: Setting, facts: FileFacts): Outcome<Setting> => {
  if (Setting.isList(setting)) {
    return itemsOf(setting, facts);
  }

  if (Setting.isMap(setting)) {
    const pairs = pairsOf({
      outcomes: Object.entries(setting).map(
        ([key, held]) =>
          [
            textOf(key, facts),
            settingOf(held, facts),
          ] as const,
      ),
    });

    return pairs.kind === OutcomeKind.Resolved ? resolved(Object.fromEntries(pairs.value)) : pairs;
  }

  if (typeof setting !== 'string') {
    return resolved(setting);
  }

  const truth = booleanOf(Fact.wholeOf(setting), facts);

  return truth === undefined ? textOf(setting, facts) : resolved(truth);
};

const presetOf = (given: PresetValue, facts: FileFacts): Outcome<PresetValue> => {
  if (given.kind !== ValueKind.Map) {
    const setting = settingOf(given.setting, facts);

    return setting.kind === OutcomeKind.Resolved
      ? resolved({
          ...given,
          setting: setting.value,
        })
      : setting;
  }

  const pairs = pairsOf({
    outcomes: given.pairs.map(
      (pair) =>
        [
          textOf(pair.key, facts),
          presetOf(pair.value, facts),
        ] as const,
    ),
  });

  return pairs.kind === OutcomeKind.Resolved
    ? resolved({
        ...given,
        pairs: pairs.value.map(([key, held]) => ({
          key,
          value: held,
        })),
      })
    : pairs;
};

// A guard of a fact and a text holds where both resolve and are the same text.
const guardHolds = (guard: Guard | undefined, facts: FileFacts): boolean => {
  if (guard === undefined) {
    return true;
  }

  const { equals } = guard;
  const fact = facts.valueOf(guard.fact);
  const holds =
    equals === undefined
      ? booleanOf(guard.fact, facts)
      : fact !== undefined &&
        fact ===
          Fact.resolvedIn({
            text: equals,
            valueOf: facts.valueOf,
          });

  return holds === !guard.isNegated;
};

// Top among the units that get the same entry: a unit above that gets it holds the file instead.
const isTopOf = (input: {
  candidate: Candidate;
  candidates: readonly Candidate[];
  entry: PresetEntry;
}): boolean =>
  !input.candidates.some(
    (other) =>
      other.entries.includes(input.entry) &&
      !UnitPath.equals(other.unit.path, input.candidate.unit.path) &&
      UnitPath.holds(other.unit.path, input.candidate.unit.path),
  );

const membersOf = (unit: ProjectUnit, units: readonly ProjectUnit[]): readonly string[] =>
  units
    .filter(
      (other) => !UnitPath.equals(other.path, unit.path) && UnitPath.holds(unit.path, other.path),
    )
    .map((other) => UnitPath.pathFrom(unit.path, other.path))
    .toSorted(compareText);

interface ConstitutionPathInput {
  /** from the repository */
  readonly file: string;
  readonly files: ProjectFiles;
  /** absolute */
  readonly project: string;
}

/** The release's path from the file's folder, by the nearest link to it at or above the folder. */
const constitutionPathOf = (input: ConstitutionPathInput): string | undefined => {
  const folders = input.file.split(SEPARATOR).slice(0, -1);

  for (let depth = folders.length; depth >= 0; depth -= 1) {
    const folder = [
      input.project,
      ...folders.slice(0, depth),
      RELEASE_FOLDER,
    ].join(SEPARATOR);

    if (input.files.isFolder(folder)) {
      return [
        ...Array.from(
          {
            length: folders.length - depth,
          },
          () => PARENT,
        ),
        RELEASE_FOLDER,
      ].join(SEPARATOR);
    }
  }

  return undefined;
};

const placeOf = (input: {
  name: FactName.UnitDepth | FactName.UnitParent;
  path: string;
}): string | undefined => {
  const [top, ...below] = input.path.split(SEPARATOR);

  if (below.length === 0) {
    return undefined;
  }

  return input.name === FactName.UnitParent ? top : String(below.length);
};

interface ResolveFactsInput {
  readonly candidates: readonly Candidate[];
  readonly files: ProjectFiles;
  readonly model: BlockModel;
  readonly project: string;
  readonly units: readonly ProjectUnit[];
}

const factsOf = (
  input: ResolveFactsInput & {
    candidate: Candidate;
    entry: PresetEntry;
    missing: Set<PresetsCode.MissingConstitution | PresetsCode.MissingName>;
  },
): FileFacts => {
  const { candidate, missing } = input;
  const members = membersOf(candidate.unit, input.units);

  // A text fact, and the finding of what the unit lacks for it.
  const namedOf = (name: FactName): string | undefined => {
    if (name === FactName.UnitParent || name === FactName.UnitDepth) {
      return placeOf({
        name,
        path: String(candidate.unit.path),
      });
    }

    if (name === FactName.PackageName) {
      if (candidate.unit.name === undefined) {
        missing.add(PresetsCode.MissingName);
      }

      return candidate.unit.name;
    }

    if (name !== FactName.ConstitutionPath) {
      return undefined;
    }

    const path = constitutionPathOf({
      ...input,
      file: candidate.file,
    });

    if (path === undefined) {
      missing.add(PresetsCode.MissingConstitution);
    }

    return path;
  };

  return {
    isRoot: members.length > 0,
    isTop: isTopOf(input),
    members,
    valueOf: (fact: Fact): string | undefined => {
      if (fact.kind === FactKind.Role) {
        const term = PresetEntry.roleOf({
          entry: input.entry,
          id: fact.role,
          model: input.model,
        });

        return term === undefined ? undefined : Term.roleNameOf(term);
      }

      // Stryker disable next-line ConditionalExpression: an unknown fact names no fact namedOf knows
      return fact.kind === FactKind.Named ? namedOf(fact.name) : undefined;
    },
  };
};

const missingFindingOf = (input: {
  code: PresetsCode.MissingConstitution | PresetsCode.MissingName;
  candidate: Candidate;
}): PresetsFinding =>
  input.code === PresetsCode.MissingName
    ? {
        code: PresetsCode.MissingName,
        details: {},
        path: UnitPath.pathOf(input.candidate.unit.path, CONFIG_FILE),
      }
    : {
        code: PresetsCode.MissingConstitution,
        details: {},
        path: input.candidate.file,
      };

/**
 * An entry that names a fact the file cannot be given writes nothing, and the fact a unit lacks is
 * a finding.
 */
const resolveFacts = (input: ResolveFactsInput): FilesResolved => {
  const findings: PresetsFinding[] = [];
  const files = input.candidates.flatMap((candidate) => {
    const missing = new Set<PresetsCode.MissingConstitution | PresetsCode.MissingName>();

    const factsFor = (entry: PresetEntry): FileFacts =>
      factsOf({
        ...input,
        candidate,
        entry,
        missing,
      });

    const entries = candidate.entries.filter((entry) =>
      guardHolds(entry.file.guard, factsFor(entry)),
    );
    const contributions = entries.flatMap((entry) => {
      const outcome = presetOf(entry.value, factsFor(entry));

      return outcome.kind === OutcomeKind.Resolved
        ? [
            {
              block: PresetEntry.blockOf(entry),
              source: PresetEntry.sourceOf(entry),
              value: outcome.value,
            },
          ]
        : [];
    });

    findings.push(
      ...[
        ...missing,
      ].map((code) =>
        missingFindingOf({
          candidate,
          code,
        }),
      ),
    );

    // Stryker disable next-line ConditionalExpression: a file of no entry merges no contribution, which the merge leaves unwritten
    return entries.length === 0
      ? []
      : [
          {
            contributions,
            entries,
            file: candidate.file,
            unit: candidate.unit,
          },
        ];
  });

  return {
    files,
    findings,
  };
};

export type { FilesResolved, ResolvedFile, ResolveFactsInput };
export { resolveFacts };
