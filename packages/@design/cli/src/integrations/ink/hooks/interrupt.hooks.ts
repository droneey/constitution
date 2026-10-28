import { useInput } from 'ink';

const INTERRUPT_KEY = 'c';

// Why: a view keeps Ink from exiting on Ctrl-C, so it reaches the tree as a key.
const useInterrupt = (onInterrupt: () => void): void => {
  useInput((input, key) => {
    if (key.ctrl && input === INTERRUPT_KEY) {
      onInterrupt();
    }
  });
};

export { useInterrupt };
