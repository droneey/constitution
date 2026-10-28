import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { Glob } from '../glob.value-object';

describe('Glob', () => {
  it.each([
    {
      condition: 'its braces pair',
      given: 'src/**/*.{ts,tsx}',
      isGlob: true,
    },
    {
      condition: 'it holds a blank',
      given: 'src/**/my file.ts',
      isGlob: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isGlob: false,
    },
    {
      condition: 'a brace is left open',
      given: 'src/*.{ts,tsx',
      isGlob: false,
    },
    {
      condition: 'a brace closes none',
      given: 'src/*.ts}',
      isGlob: false,
    },
    {
      condition: 'it is no text',
      given: [
        '**',
      ],
      isGlob: false,
    },
  ])('should say $isGlob when $condition', ({ given, isGlob }) => {
    // Act
    const answer = Glob.is(given);

    // Assert
    expect(answer).toBe(isGlob);
  });

  it('should make the glob a text gives when its braces pair', () => {
    // Arrange
    const text = '**/*.{md,mdx}';

    // Act
    const glob = Glob.create(text);

    // Assert
    expect<string>(glob).toBe(text);
  });

  it('should refuse a text whose braces do not pair', () => {
    // Arrange
    const text = '**/*.{md';

    // Act
    const create = (): Glob => Glob.create(text);

    // Assert
    expect(create).toThrow(
      new InvalidValueError({
        code: ValueFailure.Glob,
        details: {
          text,
        },
      }),
    );
  });

  it.each([
    {
      condition: 'the first glob matches the path',
      isMatch: true,
      path: 'a.md',
    },
    {
      condition: 'a later glob matches the path',
      isMatch: true,
      path: 'a.ts',
    },
    {
      condition: 'no glob matches the path',
      isMatch: false,
      path: 'a.css',
    },
  ])('should say $isMatch when $condition', ({ isMatch, path }) => {
    // Arrange
    const globs = [
      Glob.create('*.md'),
      Glob.create('*.ts'),
    ];

    // Act
    const matches = Glob.matchesAny({
      globs,
      path,
    });

    // Assert
    expect(matches).toBe(isMatch);
  });
});
