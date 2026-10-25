import { describe, expect, it } from 'bun:test';

import { isProgramError } from '#/kernel/errors';

import { GrammarFailure, GrammarRefusal, isGrammarRefusal } from '../grammar-refusal.error';

describe('GrammarRefusal', () => {
  it('should name its failure when a line leaves the grammar', () => {
    // Arrange
    const make = (): GrammarRefusal => new GrammarRefusal();

    // Act
    const error = make();

    // Assert
    expect({
      code: error.code,
      details: error.details,
      isProgramError: isProgramError(error),
      name: error.name,
    }).toStrictEqual({
      code: GrammarFailure.LineLeavesGrammar,
      details: {},
      isProgramError: true,
      name: 'GrammarRefusal',
    });
  });

  it.each([
    {
      condition: 'it is a GrammarRefusal',
      error: new GrammarRefusal(),
      isRefusal: true,
    },
    {
      condition: 'it is another error',
      error: new SyntaxError('line-leaves-grammar'),
      isRefusal: false,
    },
  ])('should say $isRefusal when $condition', ({ error, isRefusal }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isGrammarRefusal(thrown);

    // Assert
    expect(answer).toBe(isRefusal);
  });
});
