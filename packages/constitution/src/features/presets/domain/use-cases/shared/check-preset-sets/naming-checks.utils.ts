import { Axis } from '#/kernel/constants';
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

  if (term === undefined) {
    return [
      {
        code: PresetsCode.UnknownRole,
        details: {
          ...input.named,
          role: input.role,
        },
      },
    ];
  }

  // foundation's terms are every axis's
  return term.axis === Axis.Foundation || term.axis === input.entry.set.path.axis
    ? []
    : [
        {
          code: PresetsCode.RoleOffItsAxis,
          details: {
            ...input.named,
            role: input.role,
            termAxis: term.axis,
          },
        },
      ];
};

// A fact the program computes stands where its kind may: a list of members only as a list item, a
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

const guardProblems = (input: {
  entry: PresetEntry;
  named: EntryNamed;
}): readonly PresetsProblem[] => {
  const { guard } = input.entry.file;

  return guard === undefined || Fact.isBoolean(guard.fact)
    ? []
    : [
        {
          code: PresetsCode.UnknownFact,
          details: {
            ...input.named,
            fact: Fact.textOf(guard.fact),
          },
        },
      ];
};

const namingProblems = (input: NamingInput): readonly PresetsProblem[] => {
  const { entry } = input;
  const named = {
    block: entry.block,
    rule: entry.rule,
  };
  const texts = [
    {
      place: TextPlace.Path,
      text: entry.file.path,
    },
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
      entry,
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
