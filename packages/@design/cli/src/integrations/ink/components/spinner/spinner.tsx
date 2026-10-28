import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { ELLIPSIS, Glyph, Space, Tone } from '#/libs/ui';

import { useSpinnerFrame } from '../../hooks';
import { useTheme } from '../../theme';

interface SpinnerProps {
  readonly label: string;
}

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
      <Text>{`${label}${ELLIPSIS}`}</Text>
    </Box>
  );
}

export type { SpinnerProps };
export { Spinner };
