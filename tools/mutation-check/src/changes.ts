import { matchesGlob } from 'node:path';

interface Range {
  end: number;
  start: number;
}

interface Changes {
  diff: string;
  exists: (path: string) => boolean;
  mutate: readonly string[];
  untracked: readonly string[];
}

const SECTION = /^diff --git /m;
const FILE = /\+\+\+ b\/(.+)/;
const HUNKS = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
const SPEC = /\/__tests__\/([^/]+?)(?:\.integration)?\.(?:test|spec)\.(tsx?)$/;

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

const provenFiles = (paths: readonly string[]): readonly string[] =>
  paths
    .filter((path) => SPEC.test(path))
    .map((path) => path.replace(SPEC, '/$1.$2'));

const isMutated = (input: {
  mutate: readonly string[];
  path: string;
}): boolean =>
  input.mutate.some(
    (pattern) => !pattern.startsWith('!') && matchesGlob(input.path, pattern),
  ) &&
  !input.mutate.some(
    (pattern) =>
      pattern.startsWith('!') && matchesGlob(input.path, pattern.slice(1)),
  );

const mutateTargets = (changes: Changes): readonly string[] => {
  const ranges = changedLines(changes.diff);
  const whole = new Set([
    ...changes.untracked,
    ...provenFiles([
      ...ranges.keys(),
      ...changes.untracked,
    ]),
  ]);
  const mutated = (path: string): boolean =>
    changes.exists(path) &&
    isMutated({
      mutate: changes.mutate,
      path,
    });

  return [
    ...[
      ...whole,
    ].filter(mutated),
    ...[
      ...ranges,
    ]
      .filter(([path]) => !whole.has(path) && mutated(path))
      .flatMap(([path, lines]) =>
        lines.map(({ end, start }) => `${path}:${start}-${end}`),
      ),
  ];
};

export { mutateTargets };
