import { describe, expect, test } from 'bun:test';

import { mutateTargets } from '../changes.ts';

const MUTATE = [
  'src/**/*.ts',
  '!src/**/__tests__/**',
  '!src/entrypoints/**',
];

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

const IMPORTS: Readonly<Record<string, readonly string[]>> = {
  'src/__tests__/json.adapter.integration.test.ts': [
    'src/json.adapter.ts',
  ],
  'src/__tests__/missing.utils.test.ts': [
    'src/missing.utils.ts',
  ],
  'src/__tests__/order.utils.test.ts': [
    'src/order.utils.ts',
  ],
  'src/__tests__/order.utils.test.ts.snap': [
    'src/order.utils.ts',
  ],
  'src/__tests__/shop.fixtures.ts': [
    'src/orders/orders.use-case.ts',
  ],
  'src/orders/__tests__/order.fixtures.ts': [
    'src/orders/order.ts',
  ],
  'src/orders/__tests__/orders.use-case.test.ts': [
    'src/__tests__/shop.fixtures.ts',
  ],
  'src/orders/orders.use-case.ts': [
    'src/orders/steps/charge.ts',
  ],
  'src/orders/__tests__/order.test.ts': [
    'src/orders/order.ts',
    'src/orders/__tests__/order.fixtures.ts',
  ],
  'src/orders/order.ts': [
    'src/orders/price.utils.ts',
    'src/kernel/money.ts',
  ],
  'src/orders/price.utils.ts': [
    'src/orders/order.ts',
  ],
};

const targetsOf = (input: {
  diff: string;
  mutate?: readonly string[];
  untracked?: readonly string[];
}): readonly string[] =>
  mutateTargets({
    diff: input.diff,
    exists: (path) => !path.includes('missing'),
    importsOf: (path) => IMPORTS[path] ?? [],
    mutate: input.mutate ?? MUTATE,
    untracked: input.untracked ?? [],
  });

describe('mutation targets', () => {
  test.each([
    {
      condition: 'a hunk changes lines of a mutated file',
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -3,2 +3,3 @@',
        ],
      }),
      targets: [
        'src/order.utils.ts:3-5',
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
        'src/order.utils.ts:7-7',
      ],
    },
    {
      condition: 'two hunks change one file',
      diff: diffOf({
        'src/order.utils.ts': [
          '@@ -1,1 +1,1 @@',
          '@@ -9,0 +10,2 @@',
        ],
      }),
      targets: [
        'src/order.utils.ts:1-1',
        'src/order.utils.ts:10-11',
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
        'src/order.utils.ts:12-22',
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
        'src/order.utils.ts:1-1',
        'src/order.utils.ts:5-5',
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
      condition: 'a spec changes',
      diff: diffOf({
        'src/__tests__/order.utils.test.ts': [
          '@@ -5 +5 @@',
        ],
      }),
      targets: [
        'src/order.utils.ts',
      ],
    },
    {
      condition: 'an integration spec changes beside the file it proves',
      diff: diffOf({
        'src/__tests__/json.adapter.integration.test.ts': [
          '@@ -5 +5 @@',
        ],
        'src/json.adapter.ts': [
          '@@ -2 +2 @@',
        ],
      }),
      targets: [
        'src/json.adapter.ts',
      ],
    },
    {
      condition: 'the file a changed spec proves no longer exists',
      diff: diffOf({
        'src/__tests__/missing.utils.test.ts': [
          '@@ -5 +5 @@',
        ],
      }),
      targets: [],
    },
    {
      condition:
        'a changed spec loads helpers of its boundary, one through a cycle, and a file of another',
      diff: diffOf({
        'src/orders/__tests__/order.test.ts': [
          '@@ -5 +5 @@',
        ],
      }),
      targets: [
        'src/orders/order.ts',
        'src/orders/price.utils.ts',
      ],
    },
    {
      condition:
        'a changed spec reaches its boundary through a fixture outside it',
      diff: diffOf({
        'src/orders/__tests__/orders.use-case.test.ts': [
          '@@ -5 +5 @@',
        ],
      }),
      targets: [
        'src/orders/orders.use-case.ts',
        'src/orders/steps/charge.ts',
      ],
    },
    {
      condition: 'a changed spec loads nothing the resolver reports',
      diff: diffOf({
        'src/__tests__/total.utils.test.ts': [
          '@@ -5 +5 @@',
        ],
      }),
      targets: [
        'src/total.utils.ts',
      ],
    },
    {
      condition: 'a fixture a spec loads changes',
      diff: diffOf({
        'src/orders/__tests__/order.fixtures.ts': [
          '@@ -2 +2 @@',
        ],
      }),
      targets: [],
    },
    {
      condition: 'the configuration leaves the changed file out',
      diff: diffOf({
        'README.md': [
          '@@ -1 +1 @@',
        ],
        'src/entrypoints/run/main.ts': [
          '@@ -1 +1 @@',
        ],
      }),
      targets: [],
    },
  ])('should mutate $targets when $condition', ({ diff, targets }) => {
    // Arrange
    const changes = {
      diff,
    };

    // Act
    const found = targetsOf(changes);

    // Assert
    expect(found).toStrictEqual(targets);
  });

  test('should mutate a new file whole when git does not track it yet', () => {
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
      'src/order.utils.ts',
    ]);
  });

  test('should mutate nothing when a snapshot beside a spec changes', () => {
    // Arrange
    const changes = {
      diff: diffOf({
        'src/__tests__/order.utils.test.ts.snap': [
          '@@ -1 +1 @@',
        ],
      }),
      mutate: [
        'src/**',
        '!src/**/__tests__/**',
      ],
    };

    // Act
    const found = targetsOf(changes);

    // Assert
    expect(found).toStrictEqual([]);
  });

  test('should keep a file when a pattern without its first character would exclude it', () => {
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
      'src/order.utils.ts:1-1',
    ]);
  });
});
