import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import { Space, Tone } from '#/libs/ui';

import { useTheme } from '../../hooks';
import { useConfirm } from './confirm.hooks';
import type { ConfirmProps } from './confirm.types';

function Confirm({ defaultAnswer, message, onInterrupt, onSubmit }: ConfirmProps): ReactElement {
  const theme = useTheme();

  useConfirm({
    defaultAnswer,
    onInterrupt,
    onSubmit,
  });

  return (
    <Box
      aria-label={`${message}, yes or no`}
      gap={theme.space[Space.Xs]}
    >
      <Text>{theme.strong(message)}</Text>
      <Text>{theme.paint(Tone.Muted, defaultAnswer ? '(Y/n)' : '(y/N)')}</Text>
    </Box>
  );
}

export { Confirm };
