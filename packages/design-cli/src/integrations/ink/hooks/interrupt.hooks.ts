import { useInput } from 'ink';

const INTERRUPT_KEY = 'c';

/** Calls `onInterrupt` on Ctrl-C, which reaches the tree as a key since a view keeps Ink from exiting on it. */
const useInterrupt = (onInterrupt: () => void): void => {
  useInput((input, key) => {
    if (key.ctrl && input === INTERRUPT_KEY) {
      onInterrupt();
    }
  });
};

export { useInterrupt };
