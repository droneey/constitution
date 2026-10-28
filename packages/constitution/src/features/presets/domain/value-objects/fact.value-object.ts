enum FactName {
  ConstitutionPath = 'constitution.path',
  PackageName = 'package.name',
  FileIsTop = 'file.isTop',
  UnitParent = 'unit.parent',
  UnitDepth = 'unit.depth',
  WorkspaceIsRoot = 'workspace.isRoot',
  WorkspaceMembers = 'workspace.members',
}

enum FactKind {
  Named = 'named',
  Role = 'role',
  Unknown = 'unknown',
}

type Fact =
  | {
      readonly kind: FactKind.Named;
      readonly name: FactName;
    }
  | {
      readonly kind: FactKind.Role;
      readonly role: string;
    }
  | {
      readonly kind: FactKind.Unknown;
      readonly text: string;
    };

interface FactReference {
  readonly fact: Fact;
  readonly written: string;
}

const REFERENCE = /\$\{([a-z]+\.[A-Za-z0-9_-]+)\}/g;
const ROLE_PREFIX = 'role.';
const factNames: readonly FactName[] = Object.values(FactName);
const truthFacts: readonly FactName[] = [
  FactName.FileIsTop,
  FactName.WorkspaceIsRoot,
];

const of = (text: string): Fact => {
  const name = factNames.find((known) => known === text);

  if (name !== undefined) {
    return {
      kind: FactKind.Named,
      name,
    };
  }

  return text.startsWith(ROLE_PREFIX)
    ? {
        kind: FactKind.Role,
        role: text.slice(ROLE_PREFIX.length),
      }
    : {
        kind: FactKind.Unknown,
        text,
      };
};

const referencesIn = (text: string): readonly FactReference[] =>
  [
    ...text.matchAll(REFERENCE),
  ].map((match) => ({
    fact: of(String(match[1])),
    written: match[0],
  }));

const resolvedIn = (input: {
  text: string;
  valueOf: (fact: Fact) => string | undefined;
}): string | undefined => {
  let isResolved = true;
  const resolved = input.text.replaceAll(REFERENCE, (written, named: string) => {
    const given = input.valueOf(of(named));

    if (given === undefined) {
      isResolved = false;

      return written;
    }

    return given;
  });

  return isResolved ? resolved : undefined;
};

const wholeOf = (text: string): Fact | undefined => {
  const [reference] = referencesIn(text);

  return reference?.written === text ? reference.fact : undefined;
};

const textOf = (fact: Fact): string => {
  switch (fact.kind) {
    case FactKind.Named:
      return `\${${fact.name}}`;
    case FactKind.Role:
      return `\${${ROLE_PREFIX}${fact.role}}`;
    case FactKind.Unknown:
      return `\${${fact.text}}`;
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return fact satisfies never;
  }
};

const isNamed = (fact: Fact, name: FactName): boolean =>
  // Stryker disable next-line ConditionalExpression: the test of its kind only narrows the type
  fact.kind === FactKind.Named && fact.name === name;

const isBoolean = (fact: Fact): boolean =>
  // Stryker disable next-line ConditionalExpression: the test of its kind only narrows the type
  fact.kind === FactKind.Named && truthFacts.includes(fact.name);

const membersItemText = `\${${FactName.WorkspaceMembers}}`;

const Fact = {
  isBoolean,
  isNamed,
  of,
  referencesIn,
  resolvedIn,
  textOf,
  wholeOf,
} as const;

export type { FactReference };
export { Fact, FactKind, FactName, membersItemText };
