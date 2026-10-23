import { describe, expect, it } from 'bun:test';

import { attempted, isSyntaxError, isSystemError, recognisedFailure } from '../failures.utils';

const SYSTEM_ERROR = Object.assign(new Error('no such file'), {
  code: 'ENOENT',
});
const SYNTAX_ERROR = new SyntaxError('Unexpected token');
const DEFECT = new TypeError('undefined is not a function');

describe('recognisedFailure', () => {
  it('should give back the failure when the catch recognises it', () => {
    // Arrange
    const error = SYSTEM_ERROR;

    // Act
    const failure = recognisedFailure({
      error,
      isRecognised: isSystemError,
    });

    // Assert
    expect(failure).toBe(SYSTEM_ERROR);
  });

  it('should rethrow the failure when the catch does not recognise it', async () => {
    // Arrange
    const error = DEFECT;

    // Act
    const outcome = Promise.try(() =>
      recognisedFailure({
        error,
        isRecognised: isSyntaxError,
      }),
    );

    // Assert
    await expect(outcome).rejects.toBe(DEFECT);
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
        throw SYNTAX_ERROR;
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
      throw DEFECT;
    };

    // Act
    const outcome = Promise.try(() =>
      attempted({
        effect,
        isRecognised: isSyntaxError,
      }),
    );

    // Assert
    await expect(outcome).rejects.toBe(DEFECT);
  });
});

describe('isSystemError', () => {
  it.each([
    {
      condition: 'the error carries a code',
      error: SYSTEM_ERROR,
      isSystem: true,
    },
    {
      condition: 'the error carries none',
      error: DEFECT,
      isSystem: false,
    },
    {
      condition: 'the thrown value is no error',
      error: 'ENOENT',
      isSystem: false,
    },
  ])('should say $isSystem when $condition', ({ error, isSystem }) => {
    // Arrange
    const thrown: unknown = error;

    // Act
    const answer = isSystemError(thrown);

    // Assert
    expect(answer).toBe(isSystem);
  });
});

describe('isSyntaxError', () => {
  it.each([
    {
      condition: 'the error is a syntax error',
      error: SYNTAX_ERROR,
      isSyntax: true,
    },
    {
      condition: 'the error is another',
      error: DEFECT,
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
