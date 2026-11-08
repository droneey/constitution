import { describe, expect, it } from 'bun:test';

import { Level } from '#/kernel/constants';
import { AbsolutePath, RuleSlug } from '#/kernel/value-objects';

import { RuleHash } from '../../value-objects';
import type { GatedDefinition } from '../gated-definition.entity';
import type { GatedRule } from '../gated-rule.entity';
import { OwedReading } from '../owed-reading.entity';

const file = AbsolutePath.create('/work/names.md');

const ruleOf = (slug: string, hash: string): GatedRule => ({
  file,
  hash: RuleHash.create(hash),
  level: Level.Must,
  slug: RuleSlug.create(slug),
  statement: 'A name reveals intent.',
  why: 'Readers.',
});

const definitionOf = (hash: string): GatedDefinition => ({
  file,
  hash: RuleHash.create(hash),
  text: `The definition ${hash}.`,
});

const names = ruleOf('name-reveals-intent', '0000000000000001');
const functions = ruleOf('function-does-one-thing', '0000000000000002');
const name = definitionOf('00000000000000a1');
const screen = definitionOf('00000000000000a2');

describe('OwedReading.unreadOf', () => {
  it('should keep only the rules and the definitions not read at their hash', () => {
    // Act
    const unread = OwedReading.unreadOf(
      {
        definitions: [
          name,
          screen,
        ],
        rules: [
          names,
          functions,
        ],
      },
      {
        definitions: new Set([
          name.hash,
        ]),
        rules: new Map([
          [
            names.slug,
            new Set([
              names.hash,
            ]),
          ],
        ]),
      },
    );

    // Assert
    expect(unread).toStrictEqual({
      definitions: [
        screen,
      ],
      rules: [
        functions,
      ],
    });
  });
});

describe('OwedReading.countOf', () => {
  it('should count the rules and the definitions apart', () => {
    // Act
    const count = OwedReading.countOf({
      definitions: [
        name,
      ],
      rules: [
        names,
        functions,
      ],
    });

    // Assert
    expect(count).toStrictEqual({
      definitions: 1,
      rules: 2,
    });
  });
});

describe('OwedReading.isEmpty', () => {
  it.each([
    {
      condition: 'it owes neither',
      definitions: [],
      isEmpty: true,
      rules: [],
    },
    {
      condition: 'it owes a definition only',
      definitions: [
        name,
      ],
      isEmpty: false,
      rules: [],
    },
    {
      condition: 'it owes a rule only',
      definitions: [],
      isEmpty: false,
      rules: [
        names,
      ],
    },
  ])('should say $isEmpty when $condition', ({ definitions, isEmpty, rules }) => {
    // Act
    const answer = OwedReading.isEmpty({
      definitions,
      rules,
    });

    // Assert
    expect(answer).toBe(isEmpty);
  });
});

describe('OwedReading.joinedOf', () => {
  it('should join the readings in order, each rule and definition once', () => {
    // Act
    const joined = OwedReading.joinedOf([
      {
        definitions: [
          name,
        ],
        rules: [
          names,
        ],
      },
      {
        definitions: [
          name,
          screen,
        ],
        rules: [
          functions,
          names,
        ],
      },
    ]);

    // Assert
    expect(joined).toStrictEqual({
      definitions: [
        name,
        screen,
      ],
      rules: [
        names,
        functions,
      ],
    });
  });
});

describe('OwedReading.hashedTextOf', () => {
  it('should give one sorted line per rule, of its slug and hash, and per definition, of its hash', () => {
    // Act
    const text = OwedReading.hashedTextOf({
      definitions: [
        screen,
        name,
      ],
      rules: [
        names,
        functions,
      ],
    });

    // Assert
    expect(text.split('\n')).toStrictEqual([
      '00000000000000a1',
      '00000000000000a2',
      'function-does-one-thing 0000000000000002',
      'name-reveals-intent 0000000000000001',
    ]);
  });
});
