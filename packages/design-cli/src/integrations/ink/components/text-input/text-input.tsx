import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Glyph, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../hooks';
import { useTextInput } from './text-input.hooks';
import type { TextInputProps } from './text-input.types';

function TextInput({ message, onInterrupt, onSubmit, placeholder }: TextInputProps): ReactElement {
  const theme = useTheme();
  const typed = useTextInput({
    onInterrupt,
    onSubmit,
  });

  const shown = typed === '' ? theme.paint(Tone.Muted, placeholder) : typed;

  return (
    <Box
      aria-role='textbox'
      gap={theme.space[Space.Xs]}
    >
      <Text>{theme.strong(message)}</Text>
      <Text aria-hidden>{theme.paint(Tone.Accent, theme.glyphs[Glyph.Pointer])}</Text>
      <Text>{shown}</Text>
    </Box>
  );
}

export { TextInput };
