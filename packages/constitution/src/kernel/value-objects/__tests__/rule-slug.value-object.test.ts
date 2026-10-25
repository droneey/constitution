import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { RuleSlug } from '../rule-slug.value-object';

describe('RuleSlug', () => {
  it.each([
    {
      condition: 'its words are joined by hyphens',
      isSlug: true,
      text: 'inputs-are-labelled',
    },
    {
      condition: 'it holds digits',
      isSlug: true,
      text: 'text-encoded-as-utf-8',
    },
    {
      condition: 'it is empty',
      isSlug: false,
      text: '',
    },
    {
      condition: 'it holds a capital',
      isSlug: false,
      text: 'Inputs-are-labelled',
    },
    {
      condition: 'it opens with the abstract mark of a block',
      isSlug: false,
      text: '_inputs',
    },
    {
      condition: 'it holds an underscore',
      isSlug: false,
      text: 'inputs_are_labelled',
    },
    {
      condition: 'it opens with a hyphen',
      isSlug: false,
      text: '-inputs',
    },
  ])('should tell a slug when $condition', ({ isSlug, text }) => {
    // Arrange
    const candidate = text;

    // Act
    const isRuleSlug = RuleSlug.is(candidate);

    // Assert
    expect(isRuleSlug).toBe(isSlug);
  });

  it.each([
    {
      condition: 'it is absent',
      given: undefined,
    },
    {
      condition: 'it is a number whose text would be one',
      given: 42,
    },
  ])('should tell no slug when $condition', ({ given }) => {
    // Arrange
    const candidate: unknown = given;

    // Act
    const isValue = RuleSlug.is(candidate);

    // Assert
    expect(isValue).toBe(false);
  });

  it('should make the slug a kebab-case text names', () => {
    // Arrange
    const text = 'focus-is-shown';

    // Act
    const slug = RuleSlug.create(text);

    // Assert
    expect<string>(slug).toBe(text);
  });

  it('should refuse a text that is no kebab-case slug', () => {
    // Arrange
    const text = 'focus_is_shown';

    // Act
    const create = (): RuleSlug => RuleSlug.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.RuleSlug,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'they are one slug',
      isEqual: true,
      left: 'focus-is-shown',
      right: 'focus-is-shown',
    },
    {
      condition: 'one extends the other by a word',
      isEqual: false,
      left: 'focus-is-shown',
      right: 'focus-is-shown-always',
    },
  ])('should say $isEqual when $condition', ({ isEqual, left, right }) => {
    // Arrange
    const slugs = [
      RuleSlug.create(left),
      RuleSlug.create(right),
    ] as const;

    // Act
    const isSame = RuleSlug.equals(...slugs);

    // Assert
    expect(isSame).toBe(isEqual);
  });
});
