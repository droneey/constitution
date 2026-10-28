import { describe, expect, it } from 'bun:test';

import { variablesNamed } from '../variables-named.utils.ts';

describe('variablesNamed', () => {
  it('should keep only the variables of the names when the environment lacks one', () => {
    // Act
    const named = variablesNamed({
      environment: {
        path: '/usr/bin',
      },
      names: [
        'home',
        'path',
      ],
    });

    // Assert
    expect(named).toStrictEqual({
      path: '/usr/bin',
    });
  });
});
