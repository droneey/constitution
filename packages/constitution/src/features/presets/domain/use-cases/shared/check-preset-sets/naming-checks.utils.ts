import type { RoleTerm } from '#/kernel/entities';

import type { EntryNamed, PresetEntry, PresetsProblem } from '../../../entities';
import { PresetsCode } from '../../../entities';
import type { FactReference } from '../../../value-objects';
import { Fact, FactKind, FactName, TargetFile } from '../../../value-objects';
import type { EntryText } from './entry-texts.utils';
import { TextPlace, textsOf } from './entry-texts.utils';
import type { RoleNames } from './role-names.utils';
import { handTypedIn } from './role-names.utils';

interface NamingInput {
  readonly entry: PresetEntry;
  readonly names: RoleNames;
  readonly roles: ReadonlyMap<string, RoleTerm>;
}

const roleProblems = (
  input: NamingInput & {
    named: EntryNamed;
    role: string;
  },
): readonly PresetsProblem[] => {
  const term = input.roles.get(input.role);

  return term === undefined
    ? [
        {
          code: PresetsCode.UnknownRole,
          details: {
            ...input.named,
            role: input.role,
          },
        },
      ]
    : [];
};

// A fact constitution computes stands where its kind may: a list of members only as a list item, a
// truth only alone in a value or an item, and none in the path of a file, which names only roles.
const namedProblems = (input: {
  named: EntryNamed;
  name: FactName;
  reference: FactReference;
  text: EntryText;
}): readonly PresetsProblem[] => {
  const { name, named, reference, text } = input;
  const isAlone =
    reference.written === text.text &&
    (text.place === TextPlace.Value || text.place === TextPlace.Item);

  if (name === FactName.WorkspaceMembers) {
    return text.place === TextPlace.Item
      ? []
      : [
          {
            code: PresetsCode.MembersOutsideList,
            details: named,
          },
        ];
  }

  return text.place === TextPlace.Path || (Fact.isBoolean(reference.fact) && !isAlone)
    ? [
        {
          code: PresetsCode.UnknownFact,
          details: {
            ...named,
            fact: reference.written,
          },
        },
      ]
    : [];
};

const referenceProblems = (
  input: NamingInput & {
    named: EntryNamed;
    reference: FactReference;
    text: EntryText;
  },
): readonly PresetsProblem[] => {
  const { fact } = input.reference;

  switch (fact.kind) {
    case FactKind.Named:
      return namedProblems({
        ...input,
        name: fact.name,
      });
    case FactKind.Role:
      return roleProblems({
        ...input,
        role: fact.role,
      });
    case FactKind.Unknown:
      return [
        {
          code: PresetsCode.UnknownFact,
          details: {
            ...input.named,
            fact: input.reference.written,
          },
        },
      ];
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return fact satisfies never;
  }
};

const guardTextProblems = (
  input: NamingInput & {
    equals: string;
    named: EntryNamed;
  },
): readonly PresetsProblem[] =>
  Fact.referencesIn(input.equals).flatMap((reference) =>
    referenceProblems({
      ...input,
      reference,
      text: {
        place: TextPlace.Value,
        text: input.equals,
      },
    }),
  );

// A guard's facts are checked as a value's are.
const guardProblems = (
  input: NamingInput & {
    named: EntryNamed;
  },
): readonly PresetsProblem[] => {
  const { guard } = input.entry.file;

  if (guard === undefined) {
    return [];
  }

  const isText =
    guard.fact.kind !== FactKind.Unknown &&
    !Fact.isBoolean(guard.fact) &&
    !Fact.isNamed(guard.fact, FactName.WorkspaceMembers);
  const fits = guard.equals === undefined ? Fact.isBoolean(guard.fact) : isText;

  return [
    ...(fits
      ? []
      : [
          {
            code: PresetsCode.UnknownFact,
            details: {
              ...input.named,
              fact: Fact.textOf(guard.fact),
            },
          } satisfies PresetsProblem,
        ]),
    ...(guard.equals === undefined
      ? []
      : guardTextProblems({
          ...input,
          equals: guard.equals,
        })),
  ];
};

const namingProblems = (input: NamingInput): readonly PresetsProblem[] => {
  const { entry } = input;
  const named = {
    block: entry.block,
    rule: entry.rule,
  };
  const texts = [
    ...(TargetFile.isRun(entry.file)
      ? []
      : [
          {
            place: TextPlace.Path,
            text: entry.file.path,
          },
        ]),
    ...textsOf(entry.value),
  ];

  return [
    ...(TargetFile.staysInItsUnit(entry.file)
      ? []
      : [
          {
            code: PresetsCode.FileOutsideItsUnit,
            details: {
              ...named,
              file: entry.file.path,
            },
          } satisfies PresetsProblem,
        ]),
    ...guardProblems({
      ...input,
      named,
    }),
    ...texts.flatMap((text) => [
      ...Fact.referencesIn(text.text).flatMap((reference) =>
        referenceProblems({
          ...input,
          named,
          reference,
          text,
        }),
      ),
      ...(text.place === TextPlace.File
        ? []
        : handTypedIn(input.names, text.text).map(
            (role) =>
              ({
                code: PresetsCode.HandTypedRole,
                details: {
                  ...named,
                  role: role.id,
                  term: role.term,
                },
              }) satisfies PresetsProblem,
          )),
    ]),
  ];
};

export { namingProblems };
