import type { ConfirmWords } from '#/libs/ui';

interface ConfirmProps {
  /** the answer Enter gives */
  readonly defaultAnswer: boolean;
  readonly message: string;
  readonly onInterrupt: () => void;
  readonly onSubmit: (answer: boolean) => void;
  readonly words: ConfirmWords;
}

export type { ConfirmProps };
