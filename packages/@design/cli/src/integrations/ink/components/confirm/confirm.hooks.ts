import { useInput } from 'ink';

import type { ConfirmKeys } from '#/libs/ui';

import { useInterrupt } from '../../hooks';

interface ConfirmInput {
  readonly isYesDefault: boolean;
  readonly keys: ConfirmKeys;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: boolean) => void;
}

const useConfirm = ({ isYesDefault, keys, onInterrupt, onSubmit }: ConfirmInput): void => {
  useInterrupt(onInterrupt);
  useInput((input, key) => {
    const pressedKey = input.toLowerCase();

    if (pressedKey === keys.yes) {
      onSubmit(true);
    } else if (pressedKey === keys.no) {
      onSubmit(false);
    } else if (key.return) {
      onSubmit(isYesDefault);
    }
  });
};

export { useConfirm };
