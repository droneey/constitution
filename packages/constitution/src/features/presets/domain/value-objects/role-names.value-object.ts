import { Layer } from '#/kernel/constants';
import type { BlockModel, RoleTerm } from '#/kernel/entities';
import { Term, TermKind } from '#/kernel/entities';

interface NamedRole {
  readonly id: string;
  readonly name: string;
  readonly term: string;
}

interface KindNames {
  readonly byName: ReadonlyMap<string, NamedRole>;
  readonly pattern: RegExp;
}

interface RoleNames {
  readonly folders: KindNames;
  readonly suffixes: KindNames;
}

interface NamePlace {
  readonly after: string;
  readonly before: string;
}

const ANY_SUFFIX_GLOB = '**';
const FACT = /\$\{[^}]*\}/g;
const FACT_MASK = '\u0000';

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

// Why: the longest names first, so a suffix `module.ts` wins over a suffix `ts`.
const longestFirstAlternation = (names: ReadonlyMap<string, NamedRole>): string =>
  [
    ...names.keys(),
  ]
    .toSorted((left, right) => right.length - left.length)
    .map((name) => RegExp.escape(name))
    .join('|');

const folderPlace: NamePlace = {
  after: '(?=/|(?:\\|[^()]*)?\\)/|(?:,[^{}]*)?\\}/)',
  before: `(?<=^|[/^!(|{,'"\\s*:])`,
};

const suffixPlace: NamePlace = {
  after: `(?=\\\\?\\.|[{)|*$'"\\]]|$)`,
  before: '(?<=[A-Za-z0-9_*\\]})-]\\\\?\\.)',
};

const kindNamesOf = (byName: ReadonlyMap<string, NamedRole>, place: NamePlace): KindNames => ({
  byName,
  pattern: new RegExp(`${place.before}(${longestFirstAlternation(byName)})${place.after}`, 'g'),
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

const matchesOf = (names: KindNames, text: string): readonly NamedRole[] =>
  Array.from(text.matchAll(names.pattern)).flatMap(
    (match) => names.byName.get(String(match[1])) ?? [],
  );

const handTypedIn = (roles: RoleNames, text: string): readonly NamedRole[] => {
  const bare = text.replace(FACT, FACT_MASK);

  return [
    ...matchesOf(roles.folders, bare),
    ...matchesOf(roles.suffixes, bare),
  ];
};

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
