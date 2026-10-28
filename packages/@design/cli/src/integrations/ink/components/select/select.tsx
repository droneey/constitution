import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Glyph, Space, Tone, widthOf } from '#/libs/ui';

import { useTheme } from '../../theme';
import { useSelect } from './select.hooks';
import type { SelectProps } from './select.types';

function Select<T>({ choices, message, onInterrupt, onSubmit }: SelectProps<T>): ReactElement {
  const theme = useTheme();
  const pointedIndex = useSelect({
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
            selected: index === pointedIndex,
          }}
          gap={theme.space[Space.Xs]}
          key={choice.label}
        >
          <Box width={widthOf(theme.glyphs[Glyph.Pointer])}>
            {index === pointedIndex && (
              <Text aria-hidden>{theme.paint(Tone.Accent, theme.glyphs[Glyph.Pointer])}</Text>
            )}
          </Box>
          <Text>
            {index === pointedIndex ? theme.paint(Tone.Accent, choice.label) : choice.label}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

export { Select };
