import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '../../constants';
import { BlockId, coreBlockId, RuleSlug } from '../../value-objects';
import { Rule } from '../rule.entity';

const FILE = 'blocks/core/foundation/principles.md';

const ruleOf = (fields: Partial<Rule>): Rule =>
  Rule.create({
    axis: Axis.Foundation,
    block: coreBlockId,
    file: FILE,
    isLevelStated: true,
    level: Level.Must,
    slug: RuleSlug.create('a'),
    statement: 'A.',
    why: 'it keeps the code honest.',
    ...fields,
  });

const slugA = RuleSlug.create('a');
const slugB = RuleSlug.create('b');
const slugC = RuleSlug.create('c');
const ruleB = ruleOf({
  slug: slugB,
});

describe('Rule', () => {
  it('should keep where a rule is and what it says, leaving out what it does not give', () => {
    // Arrange
    const fields = {
      axis: Axis.Architecture,
      block: BlockId.create('ui'),
      chapterTitle: 'Screens',
      file: FILE,
      isLevelStated: false,
      level: Level.Should,
      seam: BlockId.create('web'),
      section: 'Forms',
      slug: RuleSlug.create('a'),
      statement: 'A.',
      tightens: RuleSlug.create('b'),
      why: 'it keeps the code honest.',
    };

    // Act
    const rule = Rule.create(fields);

    // Assert
    expect(rule).toStrictEqual(fields);
  });

  it('should hold none of the optional fields when a rule leaves them out', () => {
    // Arrange
    const fields = {
      axis: Axis.Foundation,
      block: coreBlockId,
      file: FILE,
      isLevelStated: true,
      level: Level.Must,
      slug: RuleSlug.create('a'),
      statement: 'A.',
      why: 'it keeps the code honest.',
    };

    // Act
    const rule = Rule.create(fields);

    // Assert
    expect(rule).toStrictEqual(fields);
  });

  it('should name each slug by the rule read first when two rules share it', () => {
    // Arrange
    const first = ruleOf({
      statement: 'First.',
    });
    const rules = [
      first,
      ruleOf({
        statement: 'Second.',
      }),
    ];

    // Act
    const bySlug = Rule.bySlug(rules);

    // Assert
    expect([
      ...bySlug,
    ]).toStrictEqual([
      [
        RuleSlug.create('a'),
        first,
      ],
    ]);
  });

  it.each([
    {
      condition: 'their slugs are one',
      isSame: true,
      other: 'a',
    },
    {
      condition: 'their slugs differ',
      isSame: false,
      other: 'b',
    },
  ])('should say $isSame when $condition', ({ isSame, other }) => {
    // Arrange
    const rule = ruleOf({
      statement: 'First.',
    });
    const otherRule = ruleOf({
      slug: RuleSlug.create(other),
      statement: 'Second.',
    });

    // Act
    const isSameRule = Rule.sameAs(rule, otherRule);

    // Assert
    expect(isSameRule).toBe(isSame);
  });

  it.each([
    {
      condition: 'its slug names a rule',
      rule: ruleOf({
        tightens: slugB,
      }),
      tightened: slugB,
    },
    {
      condition: 'its slug names no rule',
      rule: ruleOf({
        tightens: RuleSlug.create('c'),
      }),
      tightened: undefined,
    },
    {
      condition: 'it tightens none',
      rule: ruleOf({}),
      tightened: undefined,
    },
  ])('should give the rule it tightens as $tightened when $condition', ({ rule, tightened }) => {
    // Arrange
    const rules = Rule.bySlug([
      rule,
      ruleB,
    ]);

    // Act
    const found = Rule.tightenedIn(rule, rules);

    // Assert
    expect(found?.slug).toBe(tightened);
  });

  it.each([
    {
      chain: [
        slugA,
        slugB,
        slugA,
      ],
      condition: 'the chain comes back to the rule',
      rules: [
        ruleOf({
          tightens: slugB,
        }),
        ruleOf({
          slug: slugB,
          tightens: slugA,
        }),
      ],
    },
    {
      chain: undefined,
      condition: 'the chain comes back to another rule of it',
      rules: [
        ruleOf({
          tightens: slugB,
        }),
        ruleOf({
          slug: slugB,
          tightens: slugC,
        }),
        ruleOf({
          slug: slugC,
          tightens: slugB,
        }),
      ],
    },
    {
      chain: undefined,
      condition: 'the chain ends at a rule that tightens none',
      rules: [
        ruleOf({
          tightens: slugB,
        }),
        ruleB,
      ],
    },
  ])('should give the cycle $chain when $condition', ({ chain, rules }) => {
    // Arrange
    const [rule = ruleB] = rules;

    // Act
    const cycle = Rule.tighteningCycleOf(rule, Rule.bySlug(rules));

    // Assert
    expect(cycle).toStrictEqual(chain);
  });

  it.each([
    {
      condition: 'it binds less than the other',
      isLooser: true,
      level: Level.Should,
      other: Level.Must,
    },
    {
      condition: 'it binds as much',
      isLooser: false,
      level: Level.Should,
      other: Level.Should,
    },
    {
      condition: 'it binds more',
      isLooser: false,
      level: Level.Must,
      other: Level.May,
    },
  ])('should say $isLooser when $condition', ({ isLooser, level, other }) => {
    // Arrange
    const rule = ruleOf({
      level,
    });
    const tightened = ruleOf({
      level: other,
      slug: RuleSlug.create('b'),
    });

    // Act
    const answer = Rule.isLooserThan(rule, tightened);

    // Assert
    expect(answer).toBe(isLooser);
  });
});
