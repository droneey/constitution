import { Layer } from '#/kernel/constants';
import type { BlockModel, RoleTerm } from '#/kernel/entities';
import { Term, TermKind } from '#/kernel/entities';

interface NamedRole {
  readonly id: string;
  readonly name: string;
  readonly term: string;
}

interface RoleNames {
  readonly folderByName: ReadonlyMap<string, NamedRole>;
  /** a folder's name: after a path's start, a separator, or a group's opening or alternative */
  readonly folders: RegExp | undefined;
  readonly suffixByName: ReadonlyMap<string, NamedRole>;
  /** a suffix's name: after a name's dot, escaped or not, and before the next dot or the end */
  readonly suffixes: RegExp | undefined;
}

const ANY_SUFFIX_GLOB = '**';
// A fact stands for what it names, which is never typed by hand.
const FACT = /\$\{[^}]*\}/g;
const FACT_PLACE = '\u0000';

// Every folder and suffix term with an id is named by it, save a language's file suffix and a name
// a block governs, which a tool reads by its spelling.
const namedOf = (input: {
  governed: ReadonlySet<string>;
  layers: ReadonlyMap<string, Layer>;
  term: RoleTerm;
}): readonly NamedRole[] => {
  const { id, term } = input.term;
  const isLanguageSuffix =
    input.term.kind === TermKind.Suffix && input.layers.get(input.term.block) === Layer.Language;
  const isGoverned = input.governed.has(term) || input.governed.has(`${term}${ANY_SUFFIX_GLOB}`);

  return id === undefined || isLanguageSuffix || isGoverned
    ? []
    : [
        {
          id,
          name: Term.roleNameOf(input.term),
          term,
        },
      ];
};

const byName = (roles: readonly NamedRole[]): ReadonlyMap<string, NamedRole> =>
  new Map(
    roles.map((role) => [
      role.name,
      role,
    ]),
  );

// The longest names first, so a suffix `module.ts` wins over a suffix `ts`.
const alternation = (names: ReadonlyMap<string, NamedRole>): string =>
  [
    ...names.keys(),
  ]
    .toSorted((left, right) => right.length - left.length)
    .map((name) => RegExp.escape(name))
    .join('|');

const patternOf = (input: {
  after: string;
  before: string;
  names: ReadonlyMap<string, NamedRole>;
}): RegExp | undefined =>
  // Stryker disable next-line ConditionalExpression: an empty alternation matches only empty names, which name no role
  input.names.size === 0
    ? undefined
    : new RegExp(`${input.before}(${alternation(input.names)})${input.after}`, 'g');

const roleNamesOf = (model: BlockModel): RoleNames => {
  const layers = new Map<string, Layer>(
    model.blocks.map((block) => [
      block.id,
      block.layer,
    ]),
  );
  const governed = new Set<string>(model.blocks.flatMap((block) => block.governs));

  const namedBy = (kind: TermKind): readonly NamedRole[] =>
    model.roles
      .filter((term) => term.kind === kind)
      .flatMap((term) =>
        namedOf({
          governed,
          layers,
          term,
        }),
      );

  const folderByName = byName(namedBy(TermKind.Folder));
  const suffixByName = byName(namedBy(TermKind.Suffix));

  return {
    folderByName,
    folders: patternOf({
      after: '(?=/|(?:\\|[^()]*)?\\)/|(?:,[^{}]*)?\\}/)',
      before: `(?<=^|[/^!(|{,'"\\s*:])`,
      names: folderByName,
    }),
    suffixByName,
    suffixes: patternOf({
      after: `(?=\\\\?\\.|[{)|*$'"]|$)`,
      before: '(?<=[A-Za-z0-9_*\\]})-]\\\\?\\.)',
      names: suffixByName,
    }),
  };
};

const matchesOf = (input: {
  names: ReadonlyMap<string, NamedRole>;
  pattern: RegExp | undefined;
  text: string;
}): readonly NamedRole[] => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: a text matched by no pattern gives only empty matches, which name no role
  if (input.pattern === undefined) {
    return [];
  }

  // Stryker disable ArrayDeclaration: each match is one of the map's own names
  return [
    ...input.text.matchAll(input.pattern),
  ].flatMap((match) => input.names.get(String(match[1])) ?? []);
  // Stryker restore ArrayDeclaration
};

/** What stays once the text's facts are taken out. */
const handTypedIn = (roles: RoleNames, text: string): readonly NamedRole[] => {
  const bare = text.replace(FACT, FACT_PLACE);

  return [
    ...matchesOf({
      names: roles.folderByName,
      pattern: roles.folders,
      text: bare,
    }),
    ...matchesOf({
      names: roles.suffixByName,
      pattern: roles.suffixes,
      text: bare,
    }),
  ];
};

export type { RoleNames };
export { handTypedIn, roleNamesOf };
