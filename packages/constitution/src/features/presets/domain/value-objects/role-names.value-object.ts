import { Layer } from '#/kernel/constants';
import type { BlockModel, RoleTerm } from '#/kernel/entities';
import { Term, TermKind } from '#/kernel/entities';

interface NamedRole {
  readonly id: string;
  readonly name: string;
  readonly term: string;
}

/** The roles of one kind by their names, and how to find one typed by hand in a text. */
interface KindNames {
  readonly byName: ReadonlyMap<string, NamedRole>;
  readonly pattern: RegExp;
}

/** The names of the folder and suffix terms a preset may name only by their facts. */
interface RoleNames {
  readonly folders: KindNames;
  readonly suffixes: KindNames;
}

/** Where a role's name stands in a text: the lookbehind and lookahead around it. */
interface NamePlace {
  readonly after: string;
  readonly before: string;
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

const keyedByName = (roles: readonly NamedRole[]): ReadonlyMap<string, NamedRole> =>
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

/** A folder's name: after a path's start, a separator, or a group's opening or alternative. */
const folderPlace: NamePlace = {
  after: '(?=/|(?:\\|[^()]*)?\\)/|(?:,[^{}]*)?\\}/)',
  before: `(?<=^|[/^!(|{,'"\\s*:])`,
};

/** A suffix's name: after a name's dot, escaped or not, and before a dot, a `]` or the end. */
const suffixPlace: NamePlace = {
  after: `(?=\\\\?\\.|[{)|*$'"\\]]|$)`,
  before: '(?<=[A-Za-z0-9_*\\]})-]\\\\?\\.)',
};

const kindNamesOf = (byName: ReadonlyMap<string, NamedRole>, place: NamePlace): KindNames => ({
  byName,
  pattern: new RegExp(`${place.before}(${alternation(byName)})${place.after}`, 'g'),
});

const of = (model: BlockModel): RoleNames => {
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

  return {
    folders: kindNamesOf(keyedByName(namedBy(TermKind.Folder)), folderPlace),
    suffixes: kindNamesOf(keyedByName(namedBy(TermKind.Suffix)), suffixPlace),
  };
};

// With no names, the pattern finds only empty ones, which name no role.
const matchesOf = (names: KindNames, text: string): readonly NamedRole[] =>
  Array.from(text.matchAll(names.pattern)).flatMap(
    (match) => names.byName.get(String(match[1])) ?? [],
  );

/** What stays once the text's facts are taken out. */
const handTypedIn = (roles: RoleNames, text: string): readonly NamedRole[] => {
  const bare = text.replace(FACT, FACT_PLACE);

  return [
    ...matchesOf(roles.folders, bare),
    ...matchesOf(roles.suffixes, bare),
  ];
};

// The names of no role: what a project's own pack writes, which may spell its folders.
const none: RoleNames = {
  folders: kindNamesOf(new Map(), folderPlace),
  suffixes: kindNamesOf(new Map(), suffixPlace),
};

const RoleNames = {
  handTypedIn,
  none,
  of,
} as const;

export { RoleNames };
