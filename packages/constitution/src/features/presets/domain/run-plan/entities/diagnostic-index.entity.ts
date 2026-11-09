import type { Level } from '#/kernel/constants';
import type { RuleSlug } from '#/kernel/value-objects';

interface HeldRule {
  readonly level: Level;
  readonly slug: RuleSlug;
  readonly statement: string;
  readonly why: string;
}

type DiagnosticIndex = ReadonlyMap<string, readonly HeldRule[]>;

// Why: a tool prints a rule it holds as a camel-case name closing a category, as
// `lint/style/noMagicNumbers`, as a code of letters and three digits or more, as `PLR2004`, or as a
// plugin's message opening with its rule in brackets; the same words in another form are as likely
// a global, an option or a version.
const DIAGNOSTIC = /\/([a-z]+(?:[A-Z][a-z\d]*)+)\b|\b([A-Z]+)(\d{3,})\b|(\[[a-z\d-]+\])/g;

const empty: DiagnosticIndex = new Map();

// Why: a selector names every code it opens up to its digits, as `S` selects `S113`, so a code is
// looked up by each such opening and never by one cut inside its letters, as `SIM115`.
const selectorsOf = (letters: string, digits: string): readonly string[] =>
  Array.from(
    {
      length: digits.length + 1,
    },
    (_, count) => `${letters}${digits.slice(0, count)}`,
  );

const keysOf = ([, name, letters, digits, prefix]: RegExpExecArray): readonly string[] =>
  digits === undefined
    ? [
        String(name ?? prefix),
      ]
    : selectorsOf(String(letters), digits);

const brokenIn = (index: DiagnosticIndex, output: string): readonly HeldRule[] => {
  const named = [
    ...output.matchAll(DIAGNOSTIC),
  ].flatMap((match) => keysOf(match).flatMap((key) => index.get(key) ?? []));

  return [
    ...new Map(
      named.map((rule) => [
        rule.slug,
        rule,
      ]),
    ).values(),
  ];
};

const DiagnosticIndex = {
  brokenIn,
  empty,
} as const;

export type { HeldRule };
export { DiagnosticIndex };
