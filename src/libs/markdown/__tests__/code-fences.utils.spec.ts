import { describe, expect, it } from 'bun:test';

import { withoutCodeFences } from '../code-fences.utils';

describe('withoutCodeFences', () => {
  it.each([
    {
      expected: 'a\n\n\n\nb',
      name: 'a backtick fence',
      text: 'a\n```ts\nconst x = 1;\n```\nb',
    },
    {
      expected: 'a\n\n\n\nb',
      name: 'a tilde fence',
      text: 'a\n~~~\n## x · MUST\n~~~\nb',
    },
    {
      expected: '\n\n\n\n\nb',
      name: 'a four-backtick fence holding a three-backtick one',
      text: '````markdown\n```tsx\nconst C = React.FC;\n```\n````\nb',
    },
    {
      expected: '\n\n\n\nb',
      name: 'a backtick fence holding a tilde line',
      text: '```text\n~~~\nsample\n```\nb',
    },
    {
      expected: 'a\n\n\n',
      name: 'a fence that never closes',
      text: 'a\n```\nb\nc',
    },
    {
      expected: '- item\n\n\n\nb',
      name: 'a fence indented inside a list item',
      text: '- item\n    ```ts\n    const x = React;\n    ```\nb',
    },
    {
      expected: 'a ```b` c\nd',
      name: 'a backtick run followed by a backtick, which opens no fence',
      text: 'a ```b` c\nd',
    },
  ])(
    'should blank every line of the fence and keep the line count when the text holds $name',
    ({ expected, text }) => {
      // Arrange
      const input = text;

      // Act
      const stripped = withoutCodeFences(input);

      // Assert
      expect(stripped).toBe(expected);
    },
  );

  it('should keep a fence open when a shorter fence of the same character appears inside it', () => {
    // Arrange
    const text = '````\n```\n## inside\n````\n## outside';

    // Act
    const stripped = withoutCodeFences(text);

    // Assert
    expect(stripped).toBe('\n\n\n\n## outside');
  });
});
