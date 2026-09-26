import { describe, expect, it } from 'bun:test';

import type { Rule } from '../../entities';
import type { RuleCheck } from '../rule-labels.utils';
import { checkOf, tagsOf } from '../rule-labels.utils';

interface CheckCase {
  check: string;
  expected: RuleCheck;
  name: string;
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
      name: '"test"',
    },
    {
      check: 'review',
      expected: {
        kind: 'review',
      },
      name: '"review"',
    },
    {
      check: 'tool — lint',
      expected: {
        kind: 'tool',
        role: 'lint',
      },
      name: '"tool — lint"',
    },
    {
      check: 'tool— lint',
      expected: {
        kind: 'unknown',
      },
      name: 'a tool without the space before its dash',
    },
    {
      check: 'unit test',
      expected: {
        kind: 'unknown',
      },
      name: 'a check with words before it',
    },
    {
      check: 'tool — lint types',
      expected: {
        kind: 'unknown',
      },
      name: 'a tool naming two roles',
    },
  ])(
    'should read $expected.kind when the check is $name',
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
});

describe('tagsOf', () => {
  it.each([
    {
      expected: [
        'ux',
        'a11y',
      ],
      labels: {
        tags: ' ux,  a11y , ',
      },
      name: 'lists them with commas and spaces',
    },
    {
      expected: [],
      labels: {
        why: 'w.',
      },
      name: 'has no tags label',
    },
  ])(
    'should return the trimmed tags when the rule $name',
    ({ expected, labels }) => {
      // Arrange
      const rule = ruleWith(labels);

      // Act
      const tags = tagsOf(rule);

      // Assert
      expect(tags).toStrictEqual(expected);
    },
  );
});
