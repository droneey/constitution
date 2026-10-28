import type { ConfirmWordsInput } from '../types';

// Stryker disable next-line StringLiteral: no caller branches on the code yet, so no behaviour tells a changed one apart
const UNUSABLE_CONFIRM_WORDS = 'unusable-confirm-words';

/** A confirm's words give no two keys: one is empty, or both begin with one letter. */
class UnusableConfirmWordsError extends Error {
  public readonly code = UNUSABLE_CONFIRM_WORDS;
  public readonly words: ConfirmWordsInput;

  public constructor(words: ConfirmWordsInput) {
    super(`${UNUSABLE_CONFIRM_WORDS}: ${words.yes}, ${words.no}`);
    this.words = words;
  }
}

export { UnusableConfirmWordsError };
