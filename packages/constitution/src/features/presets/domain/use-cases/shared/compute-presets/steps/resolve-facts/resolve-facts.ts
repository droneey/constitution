import type { ProjectFiles } from '#/kernel/contracts';
import type { BlockModel, ProjectUnit } from '#/kernel/entities';
import type { AbsolutePath } from '#/kernel/value-objects';

import type { Contribution, PresetsFinding, PresetValue } from '../../../../../entities';
import { PresetEntry, Setting, ValueKind } from '../../../../../entities';
import type { Guard } from '../../../../../value-objects';
import { Fact, FactName, membersText } from '../../../../../value-objects';
import type { Candidate } from '../select-entries';
import type { FileFacts, LackedFact } from './steps/read-facts';
import { constitutionPathFor, lackedFindingOf, lackOf, readFacts } from './steps/read-facts';

/** A candidate of the entries whose guards hold, with what they contribute. */
type ResolvedCandidate = Candidate & {
  readonly contributions: readonly Contribution[];
};

interface CandidatesResolved {
  readonly candidates: readonly ResolvedCandidate[];
  readonly findings: readonly PresetsFinding[];
}

enum OutcomeKind {
  Resolved = 'resolved',
  /** every item a list held was a member, and the file's unit has none */
  Emptied = 'emptied',
  /** a fact the file cannot be given */
  Unresolved = 'unresolved',
}

interface Resolved<TValue> {
  readonly kind: OutcomeKind.Resolved;
  readonly value: TValue;
}

interface Unresolved {
  readonly kind: OutcomeKind.Unresolved;
}

type Outcome<TValue> =
  | Resolved<TValue>
  | Unresolved
  | {
      readonly kind: OutcomeKind.Emptied;
    };

// Stryker disable next-line ObjectLiteral: an outcome of no kind is taken as nothing
const emptied: Outcome<never> = {
  kind: OutcomeKind.Emptied,
};
const unresolved: Unresolved = {
  kind: OutcomeKind.Unresolved,
};

const resolved = <TValue>(given: TValue): Resolved<TValue> => ({
  kind: OutcomeKind.Resolved,
  value: given,
});

// A text is never emptied: it resolves or it does not.
const textOf = (text: string, facts: FileFacts): Resolved<string> | Unresolved => {
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

// The values of outcomes: an unresolved one unresolves them all, and those the members empty go;
// where they all go and emptying them empties their holder, so does it.
const collected = <TValue>(input: {
  isEmptiable: boolean;
  outcomes: readonly Outcome<TValue>[];
}): Outcome<readonly TValue[]> => {
  if (input.outcomes.some((outcome) => outcome.kind === OutcomeKind.Unresolved)) {
    return unresolved;
  }

  const values = input.outcomes.flatMap((outcome) =>
    outcome.kind === OutcomeKind.Resolved
      ? [
          outcome.value,
        ]
      : [],
  );

  return values.length === 0 && input.isEmptiable ? emptied : resolved(values);
};

// A pair goes where its value goes; when every pair goes, so does the map.
const pairsOf = <TValue>(
  outcomes: readonly (readonly [
    Resolved<string> | Unresolved,
    Outcome<TValue>,
  ])[],
): Outcome<
  readonly (readonly [
    string,
    TValue,
  ])[]
> =>
  collected({
    isEmptiable: outcomes.length > 0,
    outcomes: outcomes.map(
      ([key, held]): Outcome<
        readonly [
          string,
          TValue,
        ]
      > => {
        if (key.kind === OutcomeKind.Unresolved) {
          return key;
        }

        return held.kind === OutcomeKind.Resolved
          ? resolved([
              key.value,
              held.value,
            ] as const)
          : held;
      },
    ),
  });

const isMembersItem = (listed: Setting): listed is string =>
  typeof listed === 'string' && listed.includes(membersText);

// A list whose members' items all go goes too.
const itemsOf = (list: readonly Setting[], facts: FileFacts): Outcome<Setting> =>
  collected({
    isEmptiable: list.some(isMembersItem),
    outcomes: list.flatMap((listed) =>
      isMembersItem(listed)
        ? facts.memberPaths.map((memberPath) =>
            textOf(listed.replaceAll(membersText, memberPath), facts),
          )
        : [
            settingOf(listed, facts),
          ],
    ),
  });

const settingOf = (setting: Setting, facts: FileFacts): Outcome<Setting> => {
  if (Setting.isList(setting)) {
    return itemsOf(setting, facts);
  }

  if (Setting.isMap(setting)) {
    const pairs = pairsOf(
      Object.entries(setting).map(
        ([key, held]) =>
          [
            textOf(key, facts),
            settingOf(held, facts),
          ] as const,
      ),
    );

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

  const pairs = pairsOf(
    given.pairs.map(
      (pair) =>
        [
          textOf(pair.key, facts),
          presetOf(pair.value, facts),
        ] as const,
    ),
  );

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

interface ResolveFactsInput {
  readonly candidates: readonly Candidate[];
  readonly files: ProjectFiles;
  readonly model: BlockModel;
  readonly repositoryFolderPath: AbsolutePath;
  readonly units: readonly ProjectUnit[];
}

// The lacks among the facts the texts name that the file's unit gives no value.
const lacksIn = (texts: readonly (string | undefined)[], facts: FileFacts): readonly LackedFact[] =>
  texts
    .filter((text) => text !== undefined)
    .flatMap((text) => Fact.referencesIn(text))
    .filter(({ fact }) => facts.valueOf(fact) === undefined)
    .flatMap(({ fact }) => lackOf(fact) ?? []);

// A guard's facts are read for every entry, as the guard reads them: its text's only where its own
// fact has a value. A value's are read only where its guard holds.
const guardLacksOf = (guard: Guard | undefined, facts: FileFacts): readonly LackedFact[] => {
  if (guard === undefined) {
    return [];
  }

  return lacksIn(
    [
      facts.valueOf(guard.fact) === undefined ? Fact.textOf(guard.fact) : guard.equals,
    ],
    facts,
  );
};

// Generic, so the entries kept keep the type of their candidate's kind.
const resolveCandidate = <TCandidate extends Candidate>(
  input: ResolveFactsInput & {
    candidate: TCandidate;
  },
): {
  readonly findings: readonly PresetsFinding[];
  readonly resolved: readonly ResolvedCandidate[];
} => {
  const { candidate } = input;
  const constitutionPath = constitutionPathFor(input);
  const read = candidate.entries.map((entry) => ({
    entry,
    facts: readFacts({
      ...input,
      constitutionPath,
      entry,
    }),
  }));
  const held = read.filter(({ entry, facts }) => guardHolds(entry.guard, facts));
  const kept: TCandidate = {
    ...candidate,
    entries: held.map(({ entry }) => entry),
  };
  const contributions = held.flatMap(({ entry, facts }) => {
    const outcome = presetOf(entry.value, facts);

    return outcome.kind === OutcomeKind.Resolved
      ? [
          PresetEntry.contributionOf(entry, outcome.value),
        ]
      : [];
  });
  const lacked = new Set([
    ...read.flatMap(({ entry, facts }) => guardLacksOf(entry.guard, facts)),
    ...held.flatMap(({ entry, facts }) =>
      lacksIn(
        PresetEntry.textsOf(entry).map(({ text }) => text),
        facts,
      ),
    ),
  ]);

  return {
    findings: [
      ...lacked,
    ].map((code) =>
      lackedFindingOf({
        candidate,
        code,
      }),
    ),
    resolved:
      // Stryker disable next-line ConditionalExpression: a candidate of no entry merges no contribution, which the merge leaves unwritten
      kept.entries.length === 0
        ? []
        : [
            {
              ...kept,
              contributions,
            },
          ],
  };
};

/**
 * An entry that names a fact its target cannot be given writes nothing, and the fact a unit lacks
 * is a finding.
 */
const resolveFacts = (input: ResolveFactsInput): CandidatesResolved => {
  const outcomes = input.candidates.map((candidate) =>
    resolveCandidate({
      ...input,
      candidate,
    }),
  );

  return {
    candidates: outcomes.flatMap((outcome) => outcome.resolved),
    findings: outcomes.flatMap((outcome) => outcome.findings),
  };
};

export type { CandidatesResolved, ResolvedCandidate, ResolveFactsInput };
export { resolveFacts };
