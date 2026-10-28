import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import type { NoteContent } from '#/libs/ui';
import { Space, TONE_GLYPHS } from '#/libs/ui';

import { useTheme } from '../../theme';

interface NoteProps {
  readonly note: NoteContent;
  /** what a screen reader says for the note's tone, in the run's language */
  readonly toneLabel: string;
}

function Note({ note, toneLabel }: NoteProps): ReactElement {
  const theme = useTheme();

  return (
    <Box
      borderStyle='round'
      flexDirection='column'
      paddingX={theme.space[Space.Xs]}
    >
      <Box gap={theme.space[Space.Xs]}>
        <Text aria-label={toneLabel}>
          {theme.paint(note.tone, theme.glyphs[TONE_GLYPHS[note.tone]])}
        </Text>
        <Text>{theme.strong(note.title)}</Text>
      </Box>
      {note.lines.map((line, index) => (
        <Text
          // biome-ignore lint/suspicious/noArrayIndexKey: the lines never move, so each one's place names it
          key={index}
        >
          {line}
        </Text>
      ))}
    </Box>
  );
}

export type { NoteProps };
export { Note };
