import { useState } from 'react';

import { useInput } from 'ink';

import { useInterrupt } from '../../hooks';

interface TextInputInput {
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: string) => void;
}

const useTextInput = ({ onInterrupt, onSubmit }: TextInputInput): string => {
  const [typedText, setTypedText] = useState('');

  useInterrupt(onInterrupt);
  useInput((input, key) => {
    if (key.return) {
      onSubmit(typedText);
    } else if (key.backspace || key.delete) {
      setTypedText((current) => Array.from(current).slice(0, -1).join(''));
    } else if (!(key.ctrl || key.meta)) {
      setTypedText((current) => `${current}${input}`);
    }
  });

  return typedText;
};

export { useTextInput };
