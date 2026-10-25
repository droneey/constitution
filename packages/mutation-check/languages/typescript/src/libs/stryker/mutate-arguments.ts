interface MutateTarget {
  // the lines to mutate, one-based and inclusive; the whole file when left out
  readonly lines?: {
    readonly end: number;
    readonly start: number;
  };
  readonly path: string;
}

// Stryker matches a target as a minimatch glob after turning each backslash into a slash, and refuses
// a wildcard beside a line range, so a glob character is escaped by a class of that one character,
// which minimatch takes for a literal. `!` negates only at the start, where `./` moves it, or before
// `(`, which is escaped.
const GLOB_CHARACTER = /[*?[\]{}()]/g;
const LEADING_NEGATION = /^!/;

const patternOf = (target: MutateTarget): string => {
  const path = target.path
    .replaceAll(GLOB_CHARACTER, (character) => `[${character}]`)
    .replace(LEADING_NEGATION, './!');

  return target.lines === undefined ? path : `${path}:${target.lines.start}-${target.lines.end}`;
};

// Stryker's command line splits the list at each comma, so no target can name a path that holds one:
// the `?` that could stand for it is a wildcard Stryker refuses beside a line range.
const mutateArgumentsOf = (targets: readonly MutateTarget[]): readonly string[] => [
  '--mutate',
  targets.map(patternOf).join(','),
];

export { mutateArgumentsOf };
