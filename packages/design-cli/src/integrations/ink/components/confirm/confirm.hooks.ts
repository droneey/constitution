import { useInput } from 'ink';

interface ConfirmInput {
  readonly defaultAnswer: boolean;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: boolean) => void;
}

const INTERRUPT_KEY = 'c';
const YES_KEYS: readonly string[] = [
  'y',
  'Y',
] as const;
const NO_KEYS: readonly string[] = [
  'n',
  'N',
] as const;

const useConfirm = ({ defaultAnswer, onInterrupt, onSubmit }: ConfirmInput): void => {
  useInput((input, key) => {
    if (key.ctrl && input === INTERRUPT_KEY) {
      onInterrupt();
    } else if (YES_KEYS.includes(input)) {
      onSubmit(true);
    } else if (NO_KEYS.includes(input)) {
      onSubmit(false);
    } else if (key.return) {
      onSubmit(defaultAnswer);
    }
  });
};

export { useConfirm };
