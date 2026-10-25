import { useInput } from 'ink';

import { useInterrupt } from '../../hooks';

interface ConfirmInput {
  readonly defaultAnswer: boolean;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: boolean) => void;
}

const YES_KEYS: readonly string[] = [
  'y',
  'Y',
] as const;
const NO_KEYS: readonly string[] = [
  'n',
  'N',
] as const;

const useConfirm = ({ defaultAnswer, onInterrupt, onSubmit }: ConfirmInput): void => {
  useInterrupt(onInterrupt);
  useInput((input, key) => {
    if (YES_KEYS.includes(input)) {
      onSubmit(true);
    } else if (NO_KEYS.includes(input)) {
      onSubmit(false);
    } else if (key.return) {
      onSubmit(defaultAnswer);
    }
  });
};

export { useConfirm };
