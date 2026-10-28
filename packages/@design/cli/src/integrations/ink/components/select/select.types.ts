interface Choice<T> {
  readonly label: string;
  readonly value: T;
}

interface SelectProps<T> {
  /** each label unique: it names its choice */
  readonly choices: readonly [
    Choice<T>,
    ...Choice<T>[],
  ];
  readonly message: string;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: T) => void;
}

export type { Choice, SelectProps };
