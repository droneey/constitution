import { describe, expect, it } from 'bun:test';

import { Tone } from '#/libs/ui';

import { renderWithTheme } from '../../../__tests__/ink.fixtures';
import { Note } from '../note';

describe('Note', () => {
  it('should draw a box with the tone, the title and the lines', () => {
    // Arrange
    const note = {
      lines: [
        'one',
      ],
      title: 'Heads up',
      tone: Tone.Warning,
    };

    // Act
    const { lastFrame } = renderWithTheme(<Note note={note} />);

    // Assert
    expect(lastFrame()?.split('\n')).toStrictEqual([
      `╭${'─'.repeat(98)}╮`,
      `│ ⚠ Heads up${' '.repeat(87)}│`,
      `│ one${' '.repeat(94)}│`,
      `╰${'─'.repeat(98)}╯`,
    ]);
  });
});
