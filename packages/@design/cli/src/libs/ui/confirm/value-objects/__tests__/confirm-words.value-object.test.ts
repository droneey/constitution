import { describe, expect, it } from 'bun:test';

import { UnusableConfirmWordsError } from '../../errors';
import { ConfirmWords } from '../confirm-words.value-object';

describe('ConfirmWords.create', () => {
  it.each([
    {
      condition: 'the words begin with letters that differ',
      words: {
        no: 'ні',
        yes: 'Так',
      },
      created: {
        keys: {
          no: 'н',
          yes: 'т',
        },
        no: 'ні',
        yes: 'Так',
      },
    },
    {
      condition: 'a word begins with a letter beyond the basic plane',
      words: {
        no: '\u{1D4C3}o',
        yes: '\u{1D4CE}es',
      },
      created: {
        keys: {
          no: '\u{1D4C3}',
          yes: '\u{1D4CE}',
        },
        no: '\u{1D4C3}o',
        yes: '\u{1D4CE}es',
      },
    },
  ])(
    'should take the words, each keyed by its first letter, when $condition',
    ({ created, words }) => {
      // Act
      const confirmWords = ConfirmWords.create(words);

      // Assert
      expect<object>(confirmWords).toStrictEqual(created);
    },
  );

  it.each([
    {
      condition: 'both words begin with one letter in two cases',
      words: {
        no: 'Yonder',
        yes: 'yes',
      },
    },
    {
      condition: 'the answer yes is empty',
      words: {
        no: 'no',
        yes: '',
      },
    },
    {
      condition: 'the answer no is empty',
      words: {
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
