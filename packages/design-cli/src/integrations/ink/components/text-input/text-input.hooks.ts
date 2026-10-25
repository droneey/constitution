import { useState } from 'react';

import { useInput } from 'ink';

interface TextInputInput {
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: string) => void;
}

const INTERRUPT_KEY = 'c';

const useTextInput = ({ onInterrupt, onSubmit }: TextInputInput): string => {
  const [typed, setTyped] = useState('');

  useInput((input, key) => {
    if (key.ctrl && input === INTERRUPT_KEY) {
      onInterrupt();
    } else if (key.return) {
      onSubmit(typed);
    } else if (key.backspace || key.delete) {
      setTyped((current) => current.slice(0, -1));
    } else if (!(key.ctrl || key.meta)) {
      setTyped((current) => `${current}${input}`);
    }
  });

  return typed;
};

export { useTextInput };
