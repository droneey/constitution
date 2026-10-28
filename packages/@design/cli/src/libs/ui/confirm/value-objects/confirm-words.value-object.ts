import type { Brand } from '../../types';
import { UnusableConfirmWordsError } from '../errors';
import type { ConfirmKeys, ConfirmWordsInput } from '../types';

/** the two answers of a confirm in one language, each answering to its own first letter, its key */
type ConfirmWords = Brand<
  ConfirmWordsInput & {
    readonly keys: ConfirmKeys;
  },
  'ConfirmWords'
>;

// Why: the first code point, so a letter beyond the basic plane stays whole.
const keyOf = (word: string): string | undefined => Array.from(word)[0]?.toLowerCase();

const usableKeysOf = (words: ConfirmWordsInput): ConfirmKeys | undefined => {
  const yes = keyOf(words.yes);
  const no = keyOf(words.no);

  return yes === undefined || no === undefined || yes === no
    ? undefined
    : {
        no,
        yes,
      };
};

const hasKeys = (
  words: ConfirmWordsInput & {
    readonly keys: ConfirmKeys | undefined;
  },
): words is ConfirmWords => words.keys !== undefined;

/** @throws {UnusableConfirmWordsError} when a word is empty or both begin with one letter */
const create = (input: ConfirmWordsInput): ConfirmWords => {
  const words = {
    ...input,
    keys: usableKeysOf(input),
  };

  if (!hasKeys(words)) {
    throw new UnusableConfirmWordsError(input);
  }

  return words;
};

const ConfirmWords = {
  create,
} as const;

export { ConfirmWords };
