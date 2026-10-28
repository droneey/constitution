import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import type { StepContent } from '#/libs/ui';
import { DETAIL_SEPARATOR, Space, STEP_LOOKS, StepStatus, Tone } from '#/libs/ui';

import { useSpinnerFrame } from '../../hooks';
import { useTheme } from '../../theme';

interface StepProps {
  /** what a screen reader says for the step's status, in the run's language */
  readonly statusLabel: string;
  readonly step: StepContent;
}

function Step({ statusLabel, step }: StepProps): ReactElement {
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
      <Text aria-label={statusLabel}>{theme.paint(tone, symbol)}</Text>
      <Text>{step.label}</Text>
      {step.detail !== undefined && (
        <>
          <Text>{theme.paint(Tone.Muted, DETAIL_SEPARATOR.trim())}</Text>
          <Text>{theme.paint(Tone.Muted, step.detail)}</Text>
        </>
      )}
    </Box>
  );
}

export type { StepProps };
export { Step };
