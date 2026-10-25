import { describe, expect, it } from 'bun:test';

import { ConfirmWords } from '../confirm-words.value-object';
import { UnusableConfirmWordsError } from '../unusable-confirm-words.error';

describe('ConfirmWords.create', () => {
  it.each([
    {
      condition: 'the words begin with letters that differ',
      words: {
        locale: 'uk',
        no: 'ні',
        yes: 'Так',
      },
    },
    {
      condition: 'a word begins with a letter beyond the basic plane',
      words: {
        locale: 'en',
        no: '\u{1D4C3}o',
        yes: '\u{1D4CE}es',
      },
    },
  ])('should take the words when $condition', ({ words }) => {
    // Act
    const created = ConfirmWords.create(words);

    // Assert
    expect<object>(created).toStrictEqual(words);
  });

  it.each([
    {
      condition: 'both words begin with one letter in two cases',
      words: {
        locale: 'en',
        no: 'Yonder',
        yes: 'yes',
      },
    },
    {
      condition: 'the answer yes is empty',
      words: {
        locale: 'en',
        no: 'no',
        yes: '',
      },
    },
    {
      condition: 'the answer no is empty',
      words: {
        locale: 'en',
        no: '',
        yes: 'yes',
      },
    },
  ])('should refuse the words when $condition', ({ words }) => {
    // Act
    const creating = (): unknown => ConfirmWords.create(words);

    // Assert
    expect(creating).toThrow(new UnusableConfirmWordsError(words));
  });
});
