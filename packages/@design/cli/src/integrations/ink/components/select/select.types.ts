interface Choice<T> {
  readonly label: string;
  readonly value: T;
}

interface SelectProps<T> {
  /** the answers, at least one, each named by its own label */
  readonly choices: readonly [
    Choice<T>,
    ...Choice<T>[],
  ];
  readonly message: string;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: T) => void;
}

export type { Choice, SelectProps };
