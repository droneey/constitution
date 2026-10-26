import { useState } from 'react';

import { useInput } from 'ink';

import { useInterrupt } from '../../hooks';
import type { Choice } from './select.types';

interface SelectInput<T> {
  readonly choices: readonly Choice<T>[];
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: T) => void;
}

const useSelect = <T>({ choices, onInterrupt, onSubmit }: SelectInput<T>): number => {
  const [pointed, setPointed] = useState(0);

  useInterrupt(onInterrupt);
  useInput((_input, key) => {
    if (key.upArrow) {
      setPointed((current) => (current - 1 + choices.length) % choices.length);
    } else if (key.downArrow) {
      setPointed((current) => (current + 1) % choices.length);
    } else if (key.return) {
      const choice = choices[pointed];

      if (choice !== undefined) {
        onSubmit(choice.value);
      }
    }
  });

  return pointed;
};

export { useSelect };
