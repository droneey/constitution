import type { Brand } from '../types';
import type { ConfirmKeys, ConfirmWordsInput } from './confirm.types';
import { UnusableConfirmWordsError } from './unusable-confirm-words.error';

/** the two answers of a confirm in one language, each answering to its own first letter */
type ConfirmWords = Brand<ConfirmWordsInput, 'ConfirmWords'>;

// The first code point, so a letter beyond the basic plane stays whole.
const keyOf = (word: string): string => (Array.from(word)[0] ?? '').toLowerCase();

const keysOf = (words: ConfirmWordsInput): ConfirmKeys => ({
  no: keyOf(words.no),
  yes: keyOf(words.yes),
});

/** Whether each word has a first letter and the two differ in either case. */
const is = (words: ConfirmWordsInput): words is ConfirmWords => {
  const keys = keysOf(words);

  return keys.yes !== '' && keys.no !== '' && keys.yes !== keys.no;
};

/** @throws {@link UnusableConfirmWordsError} when a word is empty or both begin with one letter */
const create = (input: ConfirmWordsInput): ConfirmWords => {
  if (!is(input)) {
    throw new UnusableConfirmWordsError(input);
  }

  return input;
};

const ConfirmWords = {
  create,
  is,
  keysOf,
} as const;

export { ConfirmWords };
