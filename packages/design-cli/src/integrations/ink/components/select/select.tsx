import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Glyph, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../hooks';
import { useSelect } from './select.hooks';
import type { SelectProps } from './select.types';

function Select<T>({ choices, message, onInterrupt, onSubmit }: SelectProps<T>): ReactElement {
  const theme = useTheme();
  const pointed = useSelect({
    choices,
    onInterrupt,
    onSubmit,
  });

  return (
    <Box
      aria-role='listbox'
      flexDirection='column'
    >
      <Text>{theme.strong(message)}</Text>
      {choices.map((choice, index) => (
        <Box
          aria-role='option'
          aria-state={{
            selected: index === pointed,
          }}
          gap={theme.space[Space.Xs]}
          key={choice.label}
        >
          <Text aria-hidden>
            {index === pointed ? theme.paint(Tone.Accent, theme.glyphs[Glyph.Pointer]) : ' '}
          </Text>
          <Text>{index === pointed ? theme.paint(Tone.Accent, choice.label) : choice.label}</Text>
        </Box>
      ))}
    </Box>
  );
}

export { Select };
