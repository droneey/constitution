import type { ReactElement } from 'react';

import { Box, Text } from 'ink';

import type { ConfirmWords } from '#/libs/ui';
import { Space, Tone } from '#/libs/ui';

import { useTheme } from '../../theme';
import { useConfirm } from './confirm.hooks';

interface ConfirmProps {
  readonly isYesDefault: boolean;
  readonly message: string;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: boolean) => void;
  readonly words: ConfirmWords;
}

function Confirm({
  isYesDefault,
  message,
  onInterrupt,
  onSubmit,
  words,
}: ConfirmProps): ReactElement {
  const theme = useTheme();
  const { keys } = words;

  useConfirm({
    isYesDefault,
    keys,
    onInterrupt,
    onSubmit,
  });

  // An answer is read out as its word, and the default, which Enter gives, as checked.
  const answerOf = (word: string, key: string, isDefault: boolean): ReactElement => (
    <Box
      aria-label={word}
      aria-role='radio'
      aria-state={{
        checked: isDefault,
      }}
    >
      <Text>{theme.paint(Tone.Muted, isDefault ? key.toUpperCase() : key)}</Text>
    </Box>
  );

  return (
    <Box
      aria-role='radiogroup'
      gap={theme.space[Space.Xs]}
    >
      <Text>{theme.strong(message)}</Text>
      <Box>
        <Text aria-hidden>{theme.paint(Tone.Muted, '(')}</Text>
        {answerOf(words.yes, keys.yes, isYesDefault)}
        <Text aria-hidden>{theme.paint(Tone.Muted, '/')}</Text>
        {answerOf(words.no, keys.no, !isYesDefault)}
        <Text aria-hidden>{theme.paint(Tone.Muted, ')')}</Text>
      </Box>
    </Box>
  );
}

export type { ConfirmProps };
export { Confirm };
