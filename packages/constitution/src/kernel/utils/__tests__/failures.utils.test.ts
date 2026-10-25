import { describe, expect, it } from 'bun:test';

import {
  attempted,
  isRangeError,
  isSyntaxError,
  recognisedFailure,
  syntaxErrorOf,
} from '../failures.utils';

const syntaxError = new SyntaxError('Unexpected token');
const defect = new TypeError('undefined is not a function');

describe('recognisedFailure', () => {
  it('should give back the failure when the catch recognises it', () => {
    // Arrange
    const error = syntaxError;

    // Act
    const failure = recognisedFailure({
      error,
      isRecognised: isSyntaxError,
    });

    // Assert
    expect(failure).toBe(syntaxError);
  });

  it('should rethrow the failure when the catch does not recognise it', async () => {
    // Arrange
    const error = defect;

    // Act
    const outcome = Promise.try(() =>
      recognisedFailure({
        error,
        isRecognised: isSyntaxError,
      }),
    );

    // Assert
    await expect(outcome).rejects.toBe(defect);
  });
});

describe('attempted', () => {
  it.each([
    {
      condition: 'the effect succeeds',
      effect: (): string => 'read',
      outcome: 'read',
    },
    {
      condition: 'the effect fails as the caller expects',
      effect: (): string => {
        throw syntaxError;
      },
      outcome: undefined,
    },
  ])('should give $outcome when $condition', ({ effect, outcome }) => {
    // Arrange
    const isRecognised = isSyntaxError;

    // Act
    const given = attempted({
      effect,
      isRecognised,
    });

    // Assert
    expect(given).toBe(outcome);
  });

  it('should rethrow the failure when the effect fails as the caller does not expect', async () => {
    // Arrange
    const effect = (): string => {
      throw defect;
    };

    // Act
    const outcome = Promise.try(() =>
      attempted({
        effect,
        isRecognised: isSyntaxError,
      }),
    );

    // Assert
    await expect(outcome).rejects.toBe(defect);
  });
});

describe('isSyntaxError', () => {
  it.each([
    {
      condition: 'the error is a syntax error',
      error: syntaxError,
      isSyntax: true,
    },
    {
      condition: 'the error is another',
      error: defect,
      isSyntax: false,
    },
  ])('should say $isSyntax when $condition', ({ error, isSyntax }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isSyntaxError(thrown);

    // Assert
    expect(answer).toBe(isSyntax);
  });
});

describe('isRangeError', () => {
  it.each([
    {
      condition: 'the error is a range error',
      error: new RangeError('invalid date'),
      isRange: true,
    },
    {
      condition: 'the error is another',
      error: defect,
      isRange: false,
    },
  ])('should say $isRange when $condition', ({ error, isRange }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isRangeError(thrown);

    // Assert
    expect(answer).toBe(isRange);
  });
});

describe('syntaxErrorOf', () => {
  it('should give back a syntax error when a parse failed with one', () => {
    // Arrange
    const thrown: unknown = syntaxError;

    // Act
    const failure = syntaxErrorOf(thrown);

    // Assert
    expect(failure).toBe(syntaxError);
  });

  it('should rethrow any other failure when a parse failed with it', async () => {
    // Arrange
    const thrown: unknown = defect;

    // Act
    const outcome = Promise.try(() => syntaxErrorOf(thrown));

    // Assert
    await expect(outcome).rejects.toBe(defect);
  });
});
