import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Space, TONE_GLYPHS } from '#/libs/ui';

import { useTheme } from '../../hooks';
import type { NoteProps } from './note.types';

function Note({ note }: NoteProps): ReactElement {
  const theme = useTheme();

  return (
    <Box
      borderDimColor
      borderStyle='round'
      flexDirection='column'
      paddingX={theme.space[Space.Xs]}
    >
      <Box gap={theme.space[Space.Xs]}>
        <Text aria-label={note.tone}>
          {theme.paint(note.tone, theme.glyphs[TONE_GLYPHS[note.tone]])}
        </Text>
        <Text>{theme.strong(note.title)}</Text>
      </Box>
      {
        // A line is named by its text, and a note never repeats one.
        note.lines.map((line) => (
          <Text key={line}>{line}</Text>
        ))
      }
    </Box>
  );
}

export { Note };
