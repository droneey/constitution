import { describe, expect, it } from 'bun:test';

import { syntaxErrorOf } from '../syntax-error.utils';

describe('syntaxErrorOf', () => {
  it('should give back the syntax error when a parse failed with one', () => {
    // Arrange
    const syntaxError = new SyntaxError('Unexpected token');

    // Act
    const failure = syntaxErrorOf(syntaxError);

    // Assert
    expect(failure).toBe(syntaxError);
  });

  it('should rethrow the failure when a parse failed with anything but the syntax', async () => {
    // Arrange
    const defect = new TypeError('undefined is not a function');

    // Act
    const outcome = Promise.try(() => syntaxErrorOf(defect));

    // Assert
    await expect(outcome).rejects.toBe(defect);
  });
});
