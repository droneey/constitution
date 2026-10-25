import { describe, expect, it } from 'bun:test';

import { mutateTargets } from '../mutate-targets.use-case.ts';

const MUTATE = [
  'src/**/*.ts',
  '!src/**/__tests__/**',
  '!src/entrypoints/**',
] as const;

const diffOf = (files: Readonly<Record<string, readonly string[]>>): string =>
  Object.entries(files)
    .map(([path, hunks]) =>
      [
        `diff --git a/${path} b/${path}`,
        `--- a/${path}`,
        `+++ b/${path}`,
        ...hunks,
      ].join('\n'),
    )
    .join('\n');

const targetsOf = (input: {
  codeChanged?: (paths: readonly string[]) => ReadonlySet<string>;
  diff: string;
  mutate?: readonly string[];
  untracked?: readonly string[];
}): ReturnType<typeof mutateTargets> =>
  mutateTargets({
    codeChanged: input.codeChanged ?? ((paths) => new Set(paths)),
    diff: input.diff,
    mutate: input.mutate ?? MUTATE,
    untracked: input.untracked ?? [],
  });

describe('mutation targets', () => {
  it.each([
    {
      condition: 'a hunk changes lines of a mutated file',
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -3,2 +3,3 @@',
        ],
      }),
      targets: [
        {
          lines: {
            end: 5,
            start: 3,
          },
          path: 'src/order.utils.ts',
        },
      ],
    },
    {
      condition: 'a hunk changes one line without a count',
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -7 +7 @@',
        ],
      }),
      targets: [
        {
          lines: {
            end: 7,
            start: 7,
          },
          path: 'src/order.utils.ts',
        },
      ],
    },
    {
      condition: 'a hunk counts its lines in two digits',
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -12,10 +12,11 @@',
        ],
      }),
      targets: [
        {
          lines: {
            end: 22,
            start: 12,
          },
          path: 'src/order.utils.ts',
        },
      ],
    },
    {
      condition: 'a changed line quotes the headers of a diff',
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -1 +1 @@',
          "+const header = 'diff --git a/x b/x';",
          "+const hunk = '@@ -9 +9 @@';",
          '@@ -5 +5 @@',
          '+const total = 1;',
        ],
      }),
      targets: [
        {
          lines: {
            end: 1,
            start: 1,
          },
          path: 'src/order.utils.ts',
        },
        {
          lines: {
            end: 5,
            start: 5,
          },
          path: 'src/order.utils.ts',
        },
      ],
    },
    {
      condition: 'a hunk only removes lines',
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -4,2 +3,0 @@',
        ],
      }),
      targets: [],
    },
    {
      condition: 'the configuration leaves the changed files out',
      diff: diffOf({
        'README.md': [
          '@@ -1 +1 @@',
        ],
        'src/__tests__/order.utils.test.ts': [
          '@@ -1 +1 @@',
        ],
        'src/entrypoints/run/main.ts': [
          '@@ -1 +1 @@',
        ],
      }),
      targets: [],
    },
  ])('should mutate the lines a hunk adds when $condition', ({ diff, targets }) => {
    // Arrange
    const changes = {
      diff,
    };

    // Act
    const found = targetsOf(changes);

    // Assert
    expect(found).toStrictEqual(targets);
  });

  it('should mutate a new file whole when git does not track it yet', () => {
    // Arrange
    const changes = {
      diff: '',
      untracked: [
        'src/order.utils.ts',
        'src/__tests__/order.utils.test.ts',
      ],
    };

    // Act
    const found = targetsOf(changes);

    // Assert
    expect(found).toStrictEqual([
      {
        path: 'src/order.utils.ts',
      },
    ]);
  });

  it('should keep a file when a pattern without its first character would exclude it', () => {
    // Arrange
    const changes = {
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -1 +1 @@',
        ],
      }),
      mutate: [
        '**/*.ts',
      ],
    };

    // Act
    const found = targetsOf(changes);

    // Assert
    expect(found).toStrictEqual([
      {
        lines: {
          end: 1,
          start: 1,
        },
        path: 'src/order.utils.ts',
      },
    ]);
  });

  it('should mutate nothing when a change only reformats a mutated file', () => {
    // Arrange
    const changes = {
      codeChanged: () => new Set<string>(),
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -1,3 +1 @@',
        ],
      }),
    };

    // Act
    const found = targetsOf(changes);

    // Assert
    expect(found).toStrictEqual([]);
  });
});
