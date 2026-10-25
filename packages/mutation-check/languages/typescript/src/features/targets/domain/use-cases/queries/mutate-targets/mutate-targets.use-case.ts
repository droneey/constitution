import { matchesGlob } from 'node:path';

interface LineRange {
  readonly end: number;
  readonly start: number;
}

// A file to mutate: the lines a change touches, or the whole of a file git does not track yet.
interface MutationTarget {
  readonly lines?: LineRange;
  readonly path: string;
}

interface Changes {
  // the paths among those given whose code changed, not only its formatting
  readonly codeChanged: (paths: readonly string[]) => ReadonlySet<string>;
  readonly diff: string;
  readonly mutate: readonly string[];
  readonly untracked: readonly string[];
}

const SECTION = /^diff --git /m;
const FILE = /\+\+\+ b\/(.+)/;
const HUNKS = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;

const linesOf = (section: string): readonly LineRange[] =>
  [
    ...section.matchAll(HUNKS),
  ].flatMap(([, first, length]) => {
    const start = Number(first);
    const count = Number(length ?? '1');

    return count > 0
      ? [
          {
            end: start + count - 1,
            start,
          },
        ]
      : [];
  });

const changedLines = (diff: string): ReadonlyMap<string, readonly LineRange[]> =>
  new Map(
    diff.split(SECTION).flatMap((section) => {
      const path = section.match(FILE)?.[1];

      return path === undefined
        ? []
        : [
            [
              path,
              linesOf(section),
            ] as const,
          ];
    }),
  );

const isMutated = (input: { mutate: readonly string[]; path: string }): boolean =>
  input.mutate.some((pattern) => !pattern.startsWith('!') && matchesGlob(input.path, pattern)) &&
  !input.mutate.some(
    (pattern) => pattern.startsWith('!') && matchesGlob(input.path, pattern.slice(1)),
  );

const mutateTargets = (changes: Changes): readonly MutationTarget[] => {
  const mutated = (path: string): boolean =>
    isMutated({
      mutate: changes.mutate,
      path,
    });

  const changed = [
    ...changedLines(changes.diff),
  ].filter(([path]) => mutated(path));
  const codeChanged = changes.codeChanged(changed.map(([path]) => path));

  return [
    ...changes.untracked.filter(mutated).map((path) => ({
      path,
    })),
    ...changed
      .filter(([path]) => codeChanged.has(path))
      .flatMap(([path, lines]) =>
        lines.map((range) => ({
          lines: range,
          path,
        })),
      ),
  ];
};

export { mutateTargets };
