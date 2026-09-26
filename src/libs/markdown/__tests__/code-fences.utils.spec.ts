import { describe, expect, it } from 'bun:test';

import { withoutCodeFences } from '../code-fences.utils';

describe('withoutCodeFences', () => {
  it.each([
    {
      expected: 'a\n\n\n\nb',
      name: 'a tilde fence',
      text: 'a\n~~~\n## x · MUST\n~~~\nb',
    },
    {
      expected: '\n\n\n\nb',
      name: 'a backtick fence holding a tilde line',
      text: '```text\n~~~\nsample\n```\nb',
    },
    {
      expected: '\n\n\n\n\nb',
      name: 'a four-backtick fence holding a three-backtick one',
      text: '````markdown\n```tsx\nconst C = React.FC;\n```\n````\nb',
    },
    {
      expected: '\n\n\n\nb',
      name: 'a fence line with an info string inside an open fence',
      text: '```\n```ts\ncode\n```\nb',
    },
    {
      expected: '\n\n\nb',
      name: 'a closing fence followed by spaces',
      text: '```\ncode\n```  \nb',
    },
    {
      expected: '- item\n\n\n\nb',
      name: 'a fence indented inside a list item',
      text: '- item\n    ```ts\n    const x = React;\n    ```\nb',
    },
    {
      expected: '\n\n\nb',
      name: 'an indented fence closed by an unindented one',
      text: '  ```\ncode\n```\nb',
    },
    {
      expected: 'a\r\n\n\n\nb',
      name: 'a fence in text with Windows line endings',
      text: 'a\r\n```ts\r\ncode\r\n```\r\nb',
    },
    {
      expected: 'a\n\n\n',
      name: 'a fence that never closes',
      text: 'a\n```\nb\nc',
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

  it.each([
    {
      name: 'the info string after a backtick run holds a backtick',
      text: '``` aa ```\nfoo',
    },
    {
      name: 'a backtick run stands inside a line',
      text: 'Wrap a sample in ``` fences.\nfoo',
    },
    {
      name: 'a tilde run stands inside a line',
      text: 'Wrap a sample in ~~~ fences.\nfoo',
    },
  ])('should keep the text as written when $name', ({ text }) => {
    // Arrange
    const input = text;

    // Act
    const stripped = withoutCodeFences(input);

    // Assert
    expect(stripped).toBe(text);
  });
});
