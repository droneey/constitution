import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Glyph, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../hooks';
import type { FailureBlockProps } from './failure-block.types';

function FailureBlock({ failure }: FailureBlockProps): ReactElement {
  const theme = useTheme();

  return (
    <Box flexDirection='column'>
      <Box gap={theme.space[Space.Xs]}>
        <Text aria-label='error'>{theme.paint(Tone.Error, theme.glyphs[Glyph.Failure])}</Text>
        <Text>{theme.strong(failure.title)}</Text>
      </Box>
      <Box
        flexDirection='column'
        paddingLeft={theme.space[Space.Sm]}
      >
        {
          // A detail is named by its text, and a failure never repeats one.
          failure.details.map((detail) => (
            <Text key={detail}>{detail}</Text>
          ))
        }
        {failure.hint !== undefined && (
          <Text>{theme.paint(Tone.Muted, `${theme.glyphs[Glyph.Hint]} ${failure.hint}`)}</Text>
        )}
      </Box>
    </Box>
  );
}

export { FailureBlock };
