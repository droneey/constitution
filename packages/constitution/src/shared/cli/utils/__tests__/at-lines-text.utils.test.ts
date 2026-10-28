import { describe, expect, it } from 'bun:test';

import { atLineMessage, atLinesMessage } from '../at-lines.messages';
import { atLinesText } from '../at-lines-text.utils';

describe('atLinesText', () => {
  it.each([
    {
      condition: 'no line is named',
      lines: undefined,
      text: '',
    },
    {
      condition: 'the lines are none',
      lines: [],
      text: '',
    },
    {
      condition: 'one line is named',
      lines: [
        3,
      ],
      text: atLineMessage('3'),
    },
    {
      condition: 'several lines are named',
      lines: [
        3,
        7,
      ],
      text: atLinesMessage('3, 7'),
    },
  ])('should name the lines when $condition', ({ lines, text }) => {
    // Act
    const given = atLinesText(lines);

    // Assert
    expect(given).toBe(text);
  });
});
