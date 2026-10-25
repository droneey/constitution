import { describe, expect, it } from 'bun:test';

import { inlineCodeSpans, withoutInlineCode } from '../inline-code.utils';

describe('inlineCodeSpans', () => {
  it.each([
    {
      expected: [
        '; read text then',
      ],
      name: 'a partial opener run shorter than its own closer',
      text: '``a`; read text then `b`.',
    },
    {
      expected: [
        'code',
      ],
      name: 'escaped backticks, one at the very start of the text',
      text: '\\`not code\\` but `code`',
    },
    {
      expected: [
        'check',
      ],
      name: 'a lone backtick before a span in a later paragraph',
      text: 'Use a backtick `here.\n\nThen run `check` now.',
    },
    {
      expected: [
        'a ` b',
      ],
      name: 'a span of two backticks around a lone one',
      text: 'Use ``a ` b`` here.',
    },
    {
      expected: [],
      name: 'an opening backtick whose only closer is across a blank line of spaces',
      text: 'Call `a\n  \nb` then more.',
    },
  ])(
    'should return the trimmed contents of every span when the text holds $name',
    ({ expected, text }) => {
      // Act
      const spans = inlineCodeSpans(text);

      // Assert
      expect(spans).toStrictEqual(expected);
    },
  );
});

describe('withoutInlineCode', () => {
  it('should replace every span with a space when the text holds code that looks like a link', () => {
    // Arrange
    const text = 'Call `handlers[event.type](event)` and [read](a.md).';

    // Act
    const stripped = withoutInlineCode(text);

    // Assert
    expect(stripped).toBe('Call   and [read](a.md).');
  });
});
