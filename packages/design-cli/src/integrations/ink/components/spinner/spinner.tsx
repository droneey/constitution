import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Glyph, Space, Tone } from '#/libs/ui';

import { useSpinnerFrame, useTheme } from '../../hooks';
import type { SpinnerProps } from './spinner.types';

function Spinner({ label }: SpinnerProps): ReactElement {
  const theme = useTheme();
  const frame = useSpinnerFrame();

  return (
    <Box
      aria-role='timer'
      aria-state={{
        busy: true,
      }}
      gap={theme.space[Space.Xs]}
    >
      <Text aria-hidden>{theme.paint(Tone.Accent, frame ?? theme.glyphs[Glyph.Step])}</Text>
      <Text>{`${label}…`}</Text>
    </Box>
  );
}

export { Spinner };
