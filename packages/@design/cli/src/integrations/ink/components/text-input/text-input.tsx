import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Glyph, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../theme';
import { useTextInput } from './text-input.hooks';

interface TextInputProps {
  readonly message: string;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: string) => void;
  readonly placeholder: string;
}

function TextInput({ message, onInterrupt, onSubmit, placeholder }: TextInputProps): ReactElement {
  const theme = useTheme();
  const typedText = useTextInput({
    onInterrupt,
    onSubmit,
  });

  const shownText = typedText === '' ? theme.paint(Tone.Muted, placeholder) : typedText;

  return (
    <Box
      aria-role='textbox'
      gap={theme.space[Space.Xs]}
    >
      <Text>{theme.strong(message)}</Text>
      <Text aria-hidden>{theme.paint(Tone.Accent, theme.glyphs[Glyph.Pointer])}</Text>
      <Text>{shownText}</Text>
    </Box>
  );
}

export type { TextInputProps };
export { TextInput };
