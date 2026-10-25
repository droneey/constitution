import { matchesGlob } from 'node:path';

interface Range {
  readonly end: number;
  readonly start: number;
}

interface Changes {
  readonly codeChanged: (path: string) => boolean;
  readonly diff: string;
  readonly mutate: readonly string[];
  readonly untracked: readonly string[];
}

const SECTION = /^diff --git /m;
const FILE = /\+\+\+ b\/(.+)/;
const HUNKS = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;

const linesOf = (section: string): readonly Range[] =>
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

const changedLines = (diff: string): ReadonlyMap<string, readonly Range[]> =>
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

const mutateTargets = (changes: Changes): readonly string[] => {
  const mutated = (path: string): boolean =>
    isMutated({
      mutate: changes.mutate,
      path,
    });

  return [
    ...changes.untracked.filter(mutated),
    ...[
      ...changedLines(changes.diff),
    ]
      .filter(([path]) => mutated(path) && changes.codeChanged(path))
      .flatMap(([path, lines]) => lines.map(({ end, start }) => `${path}:${start}-${end}`)),
  ];
};

export { mutateTargets };
