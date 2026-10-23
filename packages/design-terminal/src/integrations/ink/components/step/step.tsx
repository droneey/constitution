import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { DETAIL_SEPARATOR, Space, STEP_LOOKS, StepStatus, Tone } from '#/libs/ui';

import { useSpinnerFrame, useTheme } from '../../hooks';
import type { StepProps } from './step.types';

function Step({ step }: StepProps): ReactElement {
  const theme = useTheme();
  const frame = useSpinnerFrame();
  const { glyph, tone } = STEP_LOOKS[step.status];
  const symbol =
    step.status === StepStatus.Running ? (frame ?? theme.glyphs[glyph]) : theme.glyphs[glyph];

  return (
    <Box
      aria-role='listitem'
      aria-state={{
        busy: step.status === StepStatus.Running,
      }}
      gap={theme.space[Space.Xs]}
    >
      <Text aria-label={step.status}>{theme.paint(tone, symbol)}</Text>
      <Text>{step.label}</Text>
      {step.detail !== undefined && (
        <Text>{theme.paint(Tone.Muted, `${DETAIL_SEPARATOR.trim()} ${step.detail}`)}</Text>
      )}
    </Box>
  );
}

export { Step };
