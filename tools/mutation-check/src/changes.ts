import { matchesGlob } from 'node:path';

interface Range {
  end: number;
  start: number;
}

interface Changes {
  diff: string;
  exists: (path: string) => boolean;
  importsOf: (path: string) => readonly string[];
  mutate: readonly string[];
  untracked: readonly string[];
}

const SECTION = /^diff --git /m;
const FILE = /\+\+\+ b\/(.+)/;
const HUNKS = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
const SPEC = /\/__tests__\/([^/]+?)(?:\.integration)?\.(?:test|spec)\.(tsx?)$/;
const TESTS = '/__tests__/';

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

const loadedInBoundary = (input: {
  importsOf: (path: string) => readonly string[];
  spec: string;
}): readonly string[] => {
  const boundary = `${input.spec.slice(0, input.spec.indexOf(TESTS))}/`;
  const seen = new Set<string>();
  const pending = [
    input.spec,
  ];

  for (let path = pending.pop(); path !== undefined; path = pending.pop()) {
    for (const target of input.importsOf(path)) {
      if (!seen.has(target)) {
        seen.add(target);
        pending.push(target);
      }
    }
  }

  return [
    input.spec.replace(SPEC, '/$1.$2'),
    ...[
      ...seen,
    ].filter((path) => path.startsWith(boundary)),
  ];
};

const provenFiles = (input: {
  importsOf: (path: string) => readonly string[];
  paths: readonly string[];
}): readonly string[] =>
  input.paths
    .filter((path) => SPEC.test(path))
    .flatMap((spec) =>
      loadedInBoundary({
        importsOf: input.importsOf,
        spec,
      }),
    );

const isMutated = (input: { mutate: readonly string[]; path: string }): boolean =>
  input.mutate.some((pattern) => !pattern.startsWith('!') && matchesGlob(input.path, pattern)) &&
  !input.mutate.some(
    (pattern) => pattern.startsWith('!') && matchesGlob(input.path, pattern.slice(1)),
  );

const mutateTargets = (changes: Changes): readonly string[] => {
  const ranges = changedLines(changes.diff);
  const whole = new Set([
    ...changes.untracked,
    ...provenFiles({
      importsOf: changes.importsOf,
      paths: [
        ...ranges.keys(),
        ...changes.untracked,
      ],
    }),
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
      .flatMap(([path, lines]) => lines.map(({ end, start }) => `${path}:${start}-${end}`)),
  ];
};

export { mutateTargets };
