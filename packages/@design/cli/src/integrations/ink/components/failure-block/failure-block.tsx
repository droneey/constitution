import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import type { FailureContent } from '#/libs/ui';
import { Glyph, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../theme';

interface FailureBlockProps {
  /** what a screen reader says for the failure's mark, in the run's language */
  readonly errorLabel: string;
  readonly failure: FailureContent;
}

function FailureBlock({ errorLabel, failure }: FailureBlockProps): ReactElement {
  const theme = useTheme();

  return (
    <Box flexDirection='column'>
      <Box gap={theme.space[Space.Xs]}>
        <Text aria-label={errorLabel}>{theme.paint(Tone.Error, theme.glyphs[Glyph.Failure])}</Text>
        <Text>{theme.strong(failure.title)}</Text>
      </Box>
      <Box
        flexDirection='column'
        paddingLeft={theme.space[Space.Sm]}
      >
        {failure.details.map((detail, index) => (
          <Text
            // biome-ignore lint/suspicious/noArrayIndexKey: the details never move, so each one's place names it
            key={index}
          >
            {detail}
          </Text>
        ))}
        {failure.hint !== undefined && (
          <Box gap={theme.space[Space.Xs]}>
            <Text aria-hidden>{theme.paint(Tone.Muted, theme.glyphs[Glyph.Hint])}</Text>
            <Text>{theme.paint(Tone.Muted, failure.hint)}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export type { FailureBlockProps };
export { FailureBlock };
