import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { RuleHash } from '../../value-objects';
import { GatedRule } from '../gated-rule.entity';

const base = {
  level: Level.Must,
  slug: RuleSlug.create('name-reveals-intent'),
  statement: 'A name reveals intent.',
  why: 'Readers.',
};
const hash = RuleHash.create('0123456789abcdef');

const ruleOf = (input: Partial<GatedRule> = {}): GatedRule => ({
  ...base,
  file: AbsolutePath.create('/work/names.md'),
  hash,
  ...input,
});

const file = AbsolutePath.create('/work/names.md');
const wordingBase = {
  examples: [],
  slug: base.slug,
  statement: base.statement,
  why: base.why,
};

const hashedWith =
  (texts: string[]): ((text: string) => string) =>
  (text: string) => {
    texts.push(text);

    return '0123456789abcdef';
  };

describe('GatedRule.create', () => {
  it.each([
    {
      condition: 'it has no field beside its wording and level',
      expected: {
        ...base,
        file,
        hash,
      },
      fields: [
        'name-reveals-intent',
        '',
        Level.Must,
        '',
        '',
        '',
        'A name reveals intent.',
      ],
      standing: {
        level: Level.Must,
      },
      wording: {
        examples: [],
        slug: base.slug,
        statedLevel: Level.Should,
        statement: base.statement,
        why: base.why,
      },
    },
    {
      condition: 'it tightens another rule and an override lowers it through an arrow',
      expected: {
        ...base,
        file,
        hash,
        lowered: {
          level: Level.May,
          reason: 'generated code',
          via: RuleSlug.create('name-from-the-glossary'),
        },
        tightens: RuleSlug.create('name-from-the-glossary'),
      },
      fields: [
        'name-reveals-intent',
        'name-from-the-glossary',
        Level.Must,
        Level.May,
        'name-from-the-glossary',
        'generated code',
        'A name reveals intent.',
      ],
      standing: {
        level: Level.Must,
        lowered: {
          level: Level.May,
          reason: 'generated code',
          via: RuleSlug.create('name-from-the-glossary'),
        },
      },
      wording: {
        examples: [],
        slug: base.slug,
        statement: base.statement,
        tightens: RuleSlug.create('name-from-the-glossary'),
        why: base.why,
      },
    },
    {
      condition: 'a tool holds it',
      expected: {
        ...base,
        file,
        hash,
        isHeld: true,
      },
      fields: [
        true,
        'name-reveals-intent',
        '',
        Level.Must,
        '',
        '',
        '',
        'A name reveals intent.',
      ],
      standing: {
        isHeld: true,
        level: Level.Must,
      },
      wording: {
        examples: [],
        slug: base.slug,
        statement: base.statement,
        why: base.why,
      },
    },
  ] as const)(
    'should give the rule, hashed from every field in its place but its Why, when $condition',
    ({ expected, fields, standing, wording }) => {
      // Arrange
      const texts: string[] = [];

      // Act
      const rule = GatedRule.create({
        file,
        hashOf: hashedWith(texts),
        standing,
        wording,
      });

      // Assert
      expect({
        fields: texts.map((text) => JSON.parse(text)),
        rule,
      }).toStrictEqual({
        fields: [
          fields,
        ],
        rule: expected,
      });
    },
  );
});

describe('GatedRule.levelOf', () => {
  it.each([
    {
      condition: 'the project declares a level',
      declared: Level.May,
      level: Level.May,
      wording: {
        ...wordingBase,
        statedLevel: Level.Should,
      },
    },
    {
      condition: 'the project declares none and the rule states one',
      declared: undefined,
      level: Level.Should,
      wording: {
        ...wordingBase,
        statedLevel: Level.Should,
      },
    },
    {
      condition: 'neither the project nor the rule gives one',
      declared: undefined,
      level: Level.Must,
      wording: wordingBase,
    },
  ])('should give $level when $condition', ({ declared, level, wording }) => {
    // Act
    const given = GatedRule.levelOf({
      declared,
      wording,
    });

    // Assert
    expect(given).toBe(level);
  });
});

describe('GatedRule.appliedLevelOf', () => {
  it.each([
    {
      condition: 'no override lowers it',
      level: Level.Must,
      rule: ruleOf(),
    },
    {
      condition: 'an override lowers it',
      level: Level.May,
      rule: ruleOf({
        lowered: {
          level: Level.May,
          reason: 'generated code',
        },
      }),
    },
  ])('should give $level when $condition', ({ level, rule }) => {
    // Act
    const applied = GatedRule.appliedLevelOf(rule);

    // Assert
    expect(applied).toBe(level);
  });
});

describe('GatedRule.isRead', () => {
  it.each([
    {
      condition: 'the agent read it at its hash among others',
      isRead: true,
      read: new Map([
        [
          base.slug,
          new Set([
            RuleHash.create('fedcba9876543210'),
            hash,
          ]),
        ],
      ]),
    },
    {
      condition: 'the agent read it at another hash only',
      isRead: false,
      read: new Map([
        [
          base.slug,
          new Set([
            RuleHash.create('fedcba9876543210'),
          ]),
        ],
      ]),
    },
    {
      condition: 'the agent never read it',
      isRead: false,
      read: new Map(),
    },
  ])('should say $isRead when $condition', ({ isRead, read }) => {
    // Act
    const answer = GatedRule.isRead(ruleOf(), {
      definitions: new Set([
        hash,
      ]),
      rules: read,
    });

    // Assert
    expect(answer).toBe(isRead);
  });
});
