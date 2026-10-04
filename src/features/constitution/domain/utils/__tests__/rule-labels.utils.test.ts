import { describe, expect, it } from 'bun:test';

import { Axis, Level } from '#/kernel';

import type { Rule } from '../../entities';
import type { RuleCheck } from '../rule-labels.utils';
import { checkOf } from '../rule-labels.utils';

interface CheckCase {
  check: string;
  expected: RuleCheck;
  name: string;
}

const ruleWith = (check: string): Rule => ({
  axis: Axis.Foundation,
  block: 'core',
  check,
  file: 'blocks/core/foundation/principles.md',
  level: Level.Must,
  ownTags: [],
  parent: undefined,
  slug: 'a',
  statedLevel: Level.Must,
  statement: 'A.',
  tags: [],
  why: 'w.',
  with: undefined,
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
      check: 'tool/lint',
      expected: {
        kind: 'tool',
        role: 'lint',
      },
      name: '"tool/lint"',
    },
    {
      check: 'unit test',
      expected: {
        kind: 'unknown',
      },
      name: 'a check with words before it',
    },
    {
      check: 'tool/lint types',
      expected: {
        kind: 'unknown',
      },
      name: 'a tool naming two roles',
    },
  ])('should read $expected.kind when the check is $name', ({ check, expected }) => {
    // Arrange
    const rule = ruleWith(check);

    // Act
    const read = checkOf(rule);

    // Assert
    expect(read).toStrictEqual(expected);
  });
});
