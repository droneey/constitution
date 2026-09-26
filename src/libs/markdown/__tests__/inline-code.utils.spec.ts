import { describe, expect, it } from 'bun:test';

import {
  blankInlineCode,
  inlineCodeSpans,
  withoutInlineCode,
} from '../inline-code.utils';

describe('blankInlineCode', () => {
  it('should blank every span to spaces of its length and keep its line breaks when a span wraps a line', () => {
    // Arrange
    const text = 'Use `a` and ``b`c``, `d\ne` too.';

    // Act
    const blanked = blankInlineCode(text);

    // Assert
    expect(blanked).toBe(
      `Use ${' '.repeat(3)} and ${' '.repeat(7)}, ${' '.repeat(2)}\n${' '.repeat(2)} too.`,
    );
  });
});

describe('inlineCodeSpans', () => {
  it.each([
    {
      expected: [
        'four-data-states',
        'a ` b',
      ],
      name: 'single and double backtick spans',
      text: 'Use `four-data-states` and `` a ` b `` here.',
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
        'check',
      ],
      name: 'an escaped backtick before a real span in the same paragraph',
      text: 'Write a literal backtick as \\`. Then run `check` now.',
    },
    {
      expected: [
        '; read text then',
      ],
      name: 'a partial opener run shorter than its own closer',
      text: '``a`; read text then `b`.',
    },
    {
      expected: [],
      name: 'an opening backtick whose only same-length closer is across a blank line',
      text: 'Call `a\n\nb` then more.',
    },
    {
      expected: [
        'a\nb',
      ],
      name: 'a span that wraps one line break',
      text: 'Call `a\nb` then more.',
    },
  ])(
    'should return the trimmed contents of every span when the text holds $name',
    ({ expected, text }) => {
      // Arrange
      const input = text;

      // Act
      const spans = inlineCodeSpans(input);

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
