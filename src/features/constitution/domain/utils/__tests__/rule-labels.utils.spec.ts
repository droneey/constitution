import { describe, expect, it } from 'bun:test';

import type { Rule } from '../../entities';
import type { RuleCheck } from '../rule-labels.utils';
import { checkOf, tagsOf } from '../rule-labels.utils';

interface CheckCase {
  check: string;
  expected: RuleCheck;
}

const ruleWith = (labels: Rule['labels']): Rule => ({
  block: 'core',
  file: 'blocks/core/core.md',
  labels,
  level: 'MUST',
  slug: 'a',
  statement: 'A.',
  with: null,
});

describe('checkOf', () => {
  it.each<CheckCase>([
    {
      check: 'test',
      expected: {
        kind: 'test',
      },
    },
    {
      check: 'review',
      expected: {
        kind: 'review',
      },
    },
    {
      check: 'tool — lint',
      expected: {
        kind: 'tool',
        role: 'lint',
      },
    },
    {
      check: 'tool',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: 'test — lint',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: 'tool— lint',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: 'tool  — lint',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: 'tool — lint types',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: 'by eye',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: '',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: 'unit test',
      expected: {
        kind: 'unknown',
      },
    },
    {
      check: 'a tool — lint',
      expected: {
        kind: 'unknown',
      },
    },
  ])(
    'should read $expected.kind when the check is "$check"',
    ({ check, expected }) => {
      // Arrange
      const rule = ruleWith({
        check,
      });

      // Act
      const read = checkOf(rule);

      // Assert
      expect(read).toStrictEqual(expected);
    },
  );

  it('should read unknown when the rule has no check label', () => {
    // Arrange
    const rule = ruleWith({
      why: 'w.',
    });

    // Act
    const read = checkOf(rule);

    // Assert
    expect(read).toStrictEqual({
      kind: 'unknown',
    });
  });
});

describe('tagsOf', () => {
  it('should split and trim the tags when they are listed with commas', () => {
    // Arrange
    const rule = ruleWith({
      tags: ' ux,  a11y , ',
    });

    // Act
    const tags = tagsOf(rule);

    // Assert
    expect(tags).toStrictEqual([
      'ux',
      'a11y',
    ]);
  });
});
