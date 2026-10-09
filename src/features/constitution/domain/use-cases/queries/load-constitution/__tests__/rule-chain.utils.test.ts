import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '#/kernel/constants';

import type { StatedRule } from '../../../../entities';
import { resolveRules } from '../rule-chain.utils';

const stated = (fields: Partial<StatedRule>): StatedRule => ({
  axis: Axis.Foundation,
  block: 'core',
  file: 'blocks/core/principles.md',
  ownTags: [],
  parent: undefined,
  slug: 'a',
  statedLevel: undefined,
  statement: 'A.',
  why: 'it keeps the code honest.',
  with: undefined,
  ...fields,
});

const effectiveOf = (
  rules: readonly StatedRule[],
): readonly (readonly [
  string,
  Level,
  string,
])[] =>
  resolveRules(rules).map((rule) => [
    rule.slug,
    rule.level,
    rule.tags.join(' '),
  ]);

describe('resolveRules', () => {
  it('should keep the stated values and add the effective level and tags when a rule has no parent', () => {
    // Arrange
    const rule = stated({
      ownTags: [
        'ux',
      ],
      statedLevel: Level.Should,
    });

    // Act
    const resolved = resolveRules([
      rule,
    ]);

    // Assert
    expect(resolved).toStrictEqual([
      {
        ...rule,
        level: Level.Should,
        tags: [
          'ux',
        ],
      },
    ]);
  });

  it('should take the level and unite the tags along the chain when two rules below a root state no level', () => {
    // Arrange
    const rules = [
      stated({
        ownTags: [
          'ux',
        ],
        parent: 'b',
        slug: 'c',
      }),
      stated({
        ownTags: [
          'data',
          'ux',
        ],
        parent: 'a',
        slug: 'b',
      }),
      stated({
        ownTags: [
          'security',
        ],
        statedLevel: Level.Should,
      }),
    ];

    // Act
    const effective = effectiveOf(rules);

    // Assert
    expect(effective).toStrictEqual([
      [
        'c',
        Level.Should,
        'ux data security',
      ],
      [
        'b',
        Level.Should,
        'data ux security',
      ],
      [
        'a',
        Level.Should,
        'security',
      ],
    ]);
  });

  it('should keep a stated level and pass it down when a rule in the chain states a stricter one', () => {
    // Arrange
    const rules = [
      stated({
        statedLevel: Level.May,
      }),
      stated({
        parent: 'a',
        slug: 'b',
        statedLevel: Level.Must,
      }),
      stated({
        parent: 'b',
        slug: 'c',
      }),
    ];

    // Act
    const effective = effectiveOf(rules);

    // Assert
    expect(effective).toStrictEqual([
      [
        'a',
        Level.May,
        '',
      ],
      [
        'b',
        Level.Must,
        '',
      ],
      [
        'c',
        Level.Must,
        '',
      ],
    ]);
  });

  it('should bind a rule as MUST and stop at the break when its parent is no rule or its chain comes back to it', () => {
    // Arrange
    const rules = [
      stated({
        ownTags: [
          'ux',
        ],
        parent: 'b',
      }),
      stated({
        ownTags: [
          'data',
        ],
        parent: 'a',
        slug: 'b',
      }),
      stated({
        parent: 'c',
        slug: 'c',
      }),
      stated({
        ownTags: [
          'errors',
        ],
        parent: 'gone',
        slug: 'd',
      }),
    ];

    // Act
    const effective = effectiveOf(rules);

    // Assert
    expect(effective).toStrictEqual([
      [
        'a',
        Level.Must,
        'ux data',
      ],
      [
        'b',
        Level.Must,
        'data ux',
      ],
      [
        'c',
        Level.Must,
        '',
      ],
      [
        'd',
        Level.Must,
        'errors',
      ],
    ]);
  });

  it('should read the first rule of a slug when two rules share it', () => {
    // Arrange
    const rules = [
      stated({
        parent: 'b',
      }),
      stated({
        slug: 'b',
        statedLevel: Level.Should,
      }),
      stated({
        slug: 'b',
        statedLevel: Level.May,
      }),
    ];

    // Act
    const effective = effectiveOf(rules);

    // Assert
    expect(effective[0]).toStrictEqual([
      'a',
      Level.Should,
      '',
    ]);
  });
});
