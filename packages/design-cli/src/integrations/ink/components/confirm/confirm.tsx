import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { ConfirmWords, Space, Tone } from '#/libs/ui';

import { useTheme } from '../../hooks';
import { useConfirm } from './confirm.hooks';
import type { ConfirmProps } from './confirm.types';

function Confirm({
  defaultAnswer,
  message,
  onInterrupt,
  onSubmit,
  words,
}: ConfirmProps): ReactElement {
  const theme = useTheme();
  const keys = ConfirmWords.keysOf(words);
  const answers = new Intl.ListFormat(words.locale, {
    type: 'disjunction',
  }).format([
    words.yes,
    words.no,
  ]);

  useConfirm({
    defaultAnswer,
    keys,
    onInterrupt,
    onSubmit,
  });

  return (
    <Box
      aria-label={`${message}, ${answers}`}
      gap={theme.space[Space.Xs]}
    >
      <Text>{theme.strong(message)}</Text>
      <Text>
        {theme.paint(
          Tone.Muted,
          defaultAnswer
            ? `(${keys.yes.toUpperCase()}/${keys.no})`
            : `(${keys.yes}/${keys.no.toUpperCase()})`,
        )}
      </Text>
    </Box>
  );
}

export { Confirm };
