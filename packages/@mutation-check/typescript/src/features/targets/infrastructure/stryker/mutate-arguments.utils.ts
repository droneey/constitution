import type { MutationTarget } from '../../domain/mutation-target/entities';

// Why: Stryker matches a target as a minimatch glob after turning each backslash into a slash, and
// refuses a wildcard beside a line range, so a glob character is escaped by a class of that one
// character, which minimatch takes for a literal. `!` negates only at the start, where `./` moves
// it, or before `(`, which is escaped.
const GLOB_CHARACTER = /[*?[\]{}()]/g;
const LEADING_NEGATION = /^!/;

const patternOf = (target: MutationTarget): string => {
  const literalPath = target.filePath
    .replaceAll(GLOB_CHARACTER, (character) => `[${character}]`)
    .replace(LEADING_NEGATION, './!');

  return target.lineRange === undefined
    ? literalPath
    : `${literalPath}:${target.lineRange.startLine}-${target.lineRange.endLine}`;
};

// Why: Stryker's command line splits the list at each comma, so no target can name a path that
// holds one: the `?` that could stand for it is a wildcard Stryker refuses beside a line range.
const mutateArgumentsOf = (targets: readonly MutationTarget[]): readonly string[] => [
  '--mutate',
  targets.map(patternOf).join(','),
];

export { mutateArgumentsOf };
