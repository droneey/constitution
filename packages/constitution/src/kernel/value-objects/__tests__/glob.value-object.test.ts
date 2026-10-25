import { describe, expect, it } from 'bun:test';

import { InvalidValueError, ValueFailure } from '../../errors';
import { Glob } from '../glob.value-object';

describe('Glob', () => {
  it.each([
    {
      condition: 'it is one token',
      given: 'src/**/*.ts',
      isGlob: true,
    },
    {
      condition: 'it is empty',
      given: '',
      isGlob: false,
    },
    {
      condition: 'it holds a blank',
      given: 'src/**/my file.ts',
      isGlob: false,
    },
    {
      condition: 'it holds a tab',
      given: 'src/\t*.ts',
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
    // Arrange
    const candidate: unknown = given;

    // Act
    const answer = Glob.is(candidate);

    // Assert
    expect(answer).toBe(isGlob);
  });

  it('should make the glob a token gives', () => {
    // Arrange
    const text = '**/*.md';

    // Act
    const glob = Glob.create(text);

    // Assert
    expect<string>(glob).toBe(text);
  });

  it('should refuse a text that holds whitespace', () => {
    // Arrange
    const text = 'my file.ts';

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
      condition: 'both are one glob',
      isEqual: true,
      right: '**/*.md',
    },
    {
      condition: 'they differ',
      isEqual: false,
      right: '**/*.ts',
    },
  ])('should say $isEqual when $condition', ({ isEqual, right }) => {
    // Arrange
    const globs = [
      Glob.create('**/*.md'),
      Glob.create(right),
    ] as const;

    // Act
    const isSame = Glob.equals(...globs);

    // Assert
    expect(isSame).toBe(isEqual);
  });
});
