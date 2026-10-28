import type { EntryNamed, EntryText, PresetsProblem } from '../../../../entities';
import { PresetEntry, PresetsCode, TextPlace } from '../../../../entities';
import type { FactReference } from '../../../../value-objects';
import {
  EntryTarget,
  Fact,
  FactKind,
  FactName,
  RoleNames,
  TargetKind,
} from '../../../../value-objects';

interface NamingInput {
  readonly entry: PresetEntry;
  readonly names: RoleNames;
  readonly roleIds: ReadonlySet<string>;
}

const roleProblems = (
  input: NamingInput & {
    named: EntryNamed;
    role: string;
  },
): readonly PresetsProblem[] =>
  input.roleIds.has(input.role)
    ? []
    : [
        {
          code: PresetsCode.UnknownRole,
          details: {
            ...input.named,
            role: input.role,
          },
        },
      ];

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
  const { guard } = input.entry;

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

interface PathCheck {
  readonly problems: readonly PresetsProblem[];
  readonly texts: readonly EntryText[];
}

const pathCheckOf = (input: { entry: PresetEntry; named: EntryNamed }): PathCheck => {
  const { entry } = input;

  switch (entry.kind) {
    case TargetKind.File:
      return {
        problems: EntryTarget.staysInItsUnit(entry)
          ? []
          : [
              {
                code: PresetsCode.FileOutsideItsUnit,
                details: {
                  ...input.named,
                  file: entry.writtenPath,
                },
              },
            ],
        texts: [
          {
            place: TextPlace.Path,
            text: entry.writtenPath,
          },
        ],
      };
    case TargetKind.Run:
      return {
        problems: [],
        texts: [],
      };
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return entry satisfies never;
  }
};

const namingProblems = (input: NamingInput): readonly PresetsProblem[] => {
  const { entry } = input;
  const named = PresetEntry.namedOf(entry);
  const path = pathCheckOf({
    entry,
    named,
  });
  const texts = [
    ...path.texts,
    ...PresetEntry.textsOf(entry),
  ];

  return [
    ...path.problems,
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
        : RoleNames.handTypedIn(input.names, text.text).map(
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
