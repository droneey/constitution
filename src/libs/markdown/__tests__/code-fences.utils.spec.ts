import { describe, expect, it } from 'bun:test';

import { isFence, withoutCodeFences } from '../code-fences.utils';

describe('withoutCodeFences', () => {
  it('should blank every line of a fenced block and keep the line count', () => {
    // Arrange
    const text = 'Use React.\n```ts\nimport React from "react";\n```\nDone.';

    // Act
    const result = withoutCodeFences(text);

    // Assert
    expect(result).toBe('Use React.\n\n\n\nDone.');
  });

  it('should blank a tilde fence too', () => {
    // Act
    const result = withoutCodeFences('a\n~~~\nb\n~~~\nc');

    // Assert
    expect(result).toBe('a\n\n\n\nc');
  });
});

describe('isFence', () => {
  it('should tell a fence line from a text line', () => {
    // Act
    const answers = [
      isFence('```ts'),
      isFence('   ~~~'),
      isFence('    ```'),
      isFence('text'),
    ];

    // Assert
    expect(answers).toStrictEqual([
      true,
      true,
      false,
      false,
    ]);
  });
});
