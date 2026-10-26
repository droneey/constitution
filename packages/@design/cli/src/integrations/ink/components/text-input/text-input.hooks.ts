import { useState } from 'react';

import { useInput } from 'ink';

import { useInterrupt } from '../../hooks';

interface TextInputInput {
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: string) => void;
}

const useTextInput = ({ onInterrupt, onSubmit }: TextInputInput): string => {
  const [typed, setTyped] = useState('');

  useInterrupt(onInterrupt);
  useInput((input, key) => {
    if (key.return) {
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
