interface TextInputProps {
  readonly message: string;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: string) => void;
  readonly placeholder: string;
}

export type { TextInputProps };
