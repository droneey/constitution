import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { RuleSlug } from '#/kernel/value-objects';

import type { HeldRule } from '../diagnostic-index.entity';
import { DiagnosticIndex } from '../diagnostic-index.entity';

const heldOf = (slug: string): HeldRule => ({
  level: Level.Must,
  slug: RuleSlug.create(slug),
  statement: `The ${slug} statement.`,
  why: `the ${slug} reason.`,
});

const index: DiagnosticIndex = new Map([
  [
    'noMagicNumbers',
    [
      heldOf('literal-with-a-meaning-is-named'),
    ],
  ],
  [
    'noDebugger',
    [
      heldOf('diagnostics-written-through-a-logger'),
    ],
  ],
  [
    'PLR2004',
    [
      heldOf('literal-with-a-meaning-is-named'),
    ],
  ],
  [
    'S',
    [
      heldOf('outside-call-has-a-timeout'),
      heldOf('text-never-passed-to-eval-or-exec'),
    ],
  ],
  [
    'T10',
    [
      heldOf('diagnostics-written-through-a-logger'),
    ],
  ],
  [
    '[biome-refuses-empty-names]',
    [
      heldOf('biome-refuses-empty-names'),
    ],
  ],
  [
    '[file-within-500-lines]',
    [
      heldOf('file-within-500-lines'),
    ],
  ],
]);

const slugsIn = (output: string): readonly string[] =>
  DiagnosticIndex.brokenIn(index, output).map(({ slug }) => slug);

describe('DiagnosticIndex', () => {
  it.each([
    {
      condition: "a category closes with a rule's name",
      output: 'src/a.ts:3:7 lint/style/noMagicNumbers ━━━━━━━━━━',
      slugs: [
        'literal-with-a-meaning-is-named',
      ],
    },
    {
      condition: "a code is a rule's",
      output: 'src/a.py:3:7: PLR2004 Magic value used in comparison',
      slugs: [
        'literal-with-a-meaning-is-named',
      ],
    },
    {
      condition: 'a selector opens a code up to its digits',
      output:
        'src/a.py:1:1: S113 Probable use of `requests` call without timeout\nsrc/a.py:2:1: T100 Trace found',
      slugs: [
        'outside-call-has-a-timeout',
        'text-never-passed-to-eval-or-exec',
        'diagnostics-written-through-a-logger',
      ],
    },
    {
      condition: "a plugin's message opens with its rule in brackets",
      output:
        '  × [biome-refuses-empty-names] Name what it holds: an empty word says nothing\n  × [file-within-500-lines] Split the file',
      slugs: [
        'biome-refuses-empty-names',
        'file-within-500-lines',
      ],
    },
  ])('should name each rule the output shows broken when $condition', ({ output, slugs }) => {
    // Act
    const named = slugsIn(output);

    // Assert
    expect(named).toStrictEqual(slugs);
  });

  it('should name a rule once, in the order its diagnostics first appear', () => {
    // Act
    const named = slugsIn(
      [
        'a.ts lint/suspicious/noDebugger',
        'a.ts lint/style/noMagicNumbers',
        'b.ts lint/suspicious/noDebugger',
        'b.py: PLR2004 Magic value',
      ].join('\n'),
    );

    // Assert
    expect(named).toStrictEqual([
      'diagnostics-written-through-a-logger',
      'literal-with-a-meaning-is-named',
    ]);
  });

  it.each([
    {
      condition: 'a rule name is no last part of a category',
      output: 'noMagicNumbers is set, and so is lint/noDebuggers',
    },
    {
      condition: 'a code holds fewer than three digits',
      output: 'stored in S3 and T10 alike',
    },
    {
      condition: "a selector opens a code inside the code's letters",
      output: 'a.py:1:1: SIM115 Use a context manager',
    },
    {
      condition: 'a code sits inside a longer word',
      output: 'the key xS113 and S113x and PLR2004_',
    },
    {
      condition: 'brackets hold no rule the index knows',
      output: '[info] checked [biome-refuses-empty-verbs]',
    },
  ])('should name no rule when $condition', ({ output }) => {
    // Act
    const named = slugsIn(output);

    // Assert
    expect(named).toStrictEqual([]);
  });

  it('should hold no rule in the empty index', () => {
    // Act
    const named = DiagnosticIndex.brokenIn(DiagnosticIndex.empty, 'lint/style/noMagicNumbers');

    // Assert
    expect(named).toStrictEqual([]);
  });
});
