import { useInput } from 'ink';

import type { ConfirmKeys } from '#/libs/ui';

import { useInterrupt } from '../../hooks';

interface ConfirmInput {
  readonly defaultAnswer: boolean;
  readonly keys: ConfirmKeys;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: boolean) => void;
}

const useConfirm = ({ defaultAnswer, keys, onInterrupt, onSubmit }: ConfirmInput): void => {
  useInterrupt(onInterrupt);
  useInput((input, key) => {
    const pressed = input.toLowerCase();

    if (pressed === keys.yes) {
      onSubmit(true);
    } else if (pressed === keys.no) {
      onSubmit(false);
    } else if (key.return) {
      onSubmit(defaultAnswer);
    }
  });
};

export { useConfirm };
