import { useState } from 'react';

import { useInput } from 'ink';

import { useInterrupt } from '../../hooks';
import type { SelectProps } from './select.types';

interface SelectInput<T> {
  readonly choices: SelectProps<T>['choices'];
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: T) => void;
}

const useSelect = <T>({ choices, onInterrupt, onSubmit }: SelectInput<T>): number => {
  const [movedIndex, setMovedIndex] = useState(0);

  const clampedIndexOf = (index: number): number => Math.min(index, choices.length - 1);

  const pointedIndex = clampedIndexOf(movedIndex);

  useInterrupt(onInterrupt);
  useInput((_input, key) => {
    if (key.upArrow) {
      setMovedIndex((index) => (clampedIndexOf(index) - 1 + choices.length) % choices.length);
    } else if (key.downArrow) {
      setMovedIndex((index) => (clampedIndexOf(index) + 1) % choices.length);
    } else if (key.return) {
      // Why: a reduce over a non-empty list always gives an answer, where an index lookup could
      // miss.
      onSubmit(
        choices.reduce((pointed, choice, index) => (index === pointedIndex ? choice : pointed))
          .value,
      );
    }
  });

  return pointedIndex;
};

export { useSelect };
