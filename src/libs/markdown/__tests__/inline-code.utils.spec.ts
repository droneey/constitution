import { describe, expect, it } from 'bun:test';

import { inlineCodeSpans, withoutInlineCode } from '../inline-code.utils';

describe('inlineCodeSpans', () => {
  it('should return the trimmed contents of every span when the text holds single and double backtick spans', () => {
    // Arrange
    const text = 'Use `four-data-states` and `` a ` b `` here.';

    // Act
    const spans = inlineCodeSpans(text);

    // Assert
    expect(spans).toStrictEqual([
      'four-data-states',
      'a ` b',
    ]);
  });
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
