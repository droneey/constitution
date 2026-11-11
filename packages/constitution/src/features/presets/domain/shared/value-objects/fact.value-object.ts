enum FactName {
  ConstitutionPath = 'constitution.path',
  PackageName = 'package.name',
  PackageImportName = 'package.importName',
  FileIsTop = 'file.isTop',
  UnitIsRepositoryRoot = 'unit.isRepositoryRoot',
  UnitParent = 'unit.parent',
  UnitDepth = 'unit.depth',
  WorkspaceIsRoot = 'workspace.isRoot',
  WorkspaceMembers = 'workspace.members',
}

enum FactKind {
  Named = 'named',
  Role = 'role',
  Term = 'term',
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
      readonly kind: FactKind.Term;
      readonly term: string;
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
const TERM_PREFIX = 'term.';
const listedTerm = new RegExp(
  `([\`'"]?)\\$\\{${RegExp.escape(TERM_PREFIX)}([A-Za-z0-9_-]+)\\}\\1`,
  'g',
);
const MEMBER_SEPARATOR = ', ';
const alternedTerm = new RegExp(
  String.raw`\(\?:\$\{${RegExp.escape(TERM_PREFIX)}([A-Za-z0-9_-]+)\}\)`,
  'g',
);
const ALTERNATIVE_SEPARATOR = '|';
const REGEX_SYNTAX = /[.*+?^${}()|[\]\\]/g;
const factNames: readonly FactName[] = Object.values(FactName);
const truthFacts: readonly FactName[] = [
  FactName.FileIsTop,
  FactName.UnitIsRepositoryRoot,
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

  if (text.startsWith(ROLE_PREFIX)) {
    return {
      kind: FactKind.Role,
      role: text.slice(ROLE_PREFIX.length),
    };
  }

  return text.startsWith(TERM_PREFIX)
    ? {
        kind: FactKind.Term,
        term: text.slice(TERM_PREFIX.length),
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

interface FillInput {
  readonly membersOf: (term: string) => readonly string[] | undefined;
  readonly text: string;
  readonly valueOf: (fact: Fact) => string | undefined;
}

// Why: a term's members stand where it is named, each in the quotes around the name, as the items
// of a list written on one line; a term no block lists stays, for its fact to find unresolved.
const listedIn = (input: FillInput): string =>
  input.text.replaceAll(
    listedTerm,
    (written, quote: string, term: string) =>
      input
        .membersOf(term)
        ?.map((member) => `${quote}${member}${quote}`)
        .join(MEMBER_SEPARATOR) ?? written,
  );

// Why: a term named inside a regular expression's group, `(?:${term.<id>})`, stands for its
// members as the group's alternatives, each matched as the text it is.
const alternedIn = (input: FillInput): string =>
  input.text.replaceAll(alternedTerm, (written, term: string) => {
    const members = input.membersOf(term);

    return members === undefined
      ? written
      : `(?:${members.map((member) => member.replaceAll(REGEX_SYNTAX, String.raw`\$&`)).join(ALTERNATIVE_SEPARATOR)})`;
  });

const filledIn = (input: FillInput): string | undefined =>
  resolvedIn({
    text: listedIn({
      ...input,
      text: alternedIn(input),
    }),
    valueOf: input.valueOf,
  });

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
    case FactKind.Term:
      return `\${${TERM_PREFIX}${fact.term}}`;
    case FactKind.Unknown:
      return `\${${fact.text}}`;
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
  filledIn,
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
