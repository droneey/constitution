import { describe, expect, it } from 'bun:test';

import { Tone } from '#/libs/ui';

import { renderWithTheme, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
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

  it('should read out its tone and its title', () => {
    // Arrange
    const note = {
      lines: [],
      title: 'Heads up',
      tone: Tone.Warning,
    };

    // Act
    const spoken = screenReaderOutputOf(<Note note={note} />);

    // Assert
    // biome-ignore lint/plugin/case-pins-meaning-never-wording: the one golden of what the note says to a screen reader
    expect(spoken).toBe('warning Heads up');
  });
});
