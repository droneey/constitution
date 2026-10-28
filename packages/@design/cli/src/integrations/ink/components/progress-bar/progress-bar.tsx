import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import type { ProgressContent } from '#/libs/ui';
import { BAR_CELLS, BAR_FILLED, BAR_LEFT, Space, shareOf, Tone } from '#/libs/ui';

import { useTheme } from '../../theme';

interface ProgressBarProps {
  readonly progress: ProgressContent;
}

function ProgressBar({ progress }: ProgressBarProps): ReactElement {
  const theme = useTheme();
  const { filledCells, percent } = shareOf(progress);

  return (
    <Box
      aria-role='progressbar'
      gap={theme.space[Space.Xs]}
    >
      <Text>{progress.label}</Text>
      <Text aria-hidden>
        {theme.paint(Tone.Accent, BAR_FILLED.repeat(filledCells))}
        {theme.paint(Tone.Muted, BAR_LEFT.repeat(BAR_CELLS - filledCells))}
      </Text>
      <Text>{`${progress.done}/${progress.total}`}</Text>
      <Text>{theme.paint(Tone.Muted, `(${percent}%)`)}</Text>
    </Box>
  );
}

export type { ProgressBarProps };
export { ProgressBar };
