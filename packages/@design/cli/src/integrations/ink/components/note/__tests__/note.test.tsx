import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { Tone } from '#/libs/ui';

import { frameOf, screenReaderOutputOf } from '../../../__tests__/ink.fixtures';
import { Note } from '../note';

describe('Note', () => {
  it('should draw a box with the tone, the title and the lines, and read out the label of its tone and its title, as the golden file shows them', async () => {
    // Act
    const golden = goldenOf({
      'a warning': frameOf(
        <Note
          note={{
            lines: [
              'one',
            ],
            title: 'Heads up',
            tone: Tone.Warning,
          }}
          toneLabel='warning'
        />,
      ),
      'read out': screenReaderOutputOf(
        <Note
          note={{
            lines: [],
            title: 'Heads up',
            tone: Tone.Warning,
          }}
          toneLabel='careful'
        />,
      ),
    });

    // Assert
    expect(golden).toBe(await goldenFileText(new URL('note.golden.txt', import.meta.url)));
  });
});
