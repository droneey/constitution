import { describe, expect, it } from 'bun:test';

import {
  collapseWhitespace,
  containsId,
  ownedWordMatcher,
} from '../tokens.utils';

describe('collapseWhitespace', () => {
  it('should turn every run of spaces, tabs and line breaks into one space when the text holds several', () => {
    // Arrange
    const text = 'React\n  DOM\tapp';

    // Act
    const collapsed = collapseWhitespace(text);

    // Assert
    expect(collapsed).toBe('React DOM app');
  });
});

describe('containsId', () => {
  it.each([
    [
      'see react-dom here',
      true,
    ],
    [
      'see react-dom-extra here',
      false,
    ],
    [
      'see x-react-dom here',
      false,
    ],
    [
      'see react-dom. Then',
      true,
    ],
  ])(
    'should find react-dom only as a whole kebab id when the text is %p',
    (text, expected) => {
      // Arrange
      const input = {
        id: 'react-dom',
        text,
      };

      // Act
      const contains = containsId(input);

      // Assert
      expect(contains).toBe(expected);
    },
  );
});

describe('ownedWordMatcher', () => {
  it.each([
    [
      'React',
      'Use React.',
      true,
    ],
    [
      'React',
      'React-based screens',
      true,
    ],
    [
      'React',
      'a non-React fallback',
      true,
    ],
    [
      'React',
      'the Reactive stream',
      false,
    ],
    [
      'React',
      'call foo.React',
      false,
    ],
    [
      'React DOM',
      'React  DOM-specific',
      false,
    ],
    [
      'React DOM',
      'React DOM-specific',
      true,
    ],
    [
      '.ts',
      'every index.ts file',
      true,
    ],
    [
      '.ts',
      'every .tsx file',
      false,
    ],
    [
      'TypeScript',
      'in `TypeScript`',
      true,
    ],
  ])(
    'should tell whether %p is named when the text is %p',
    (word, text, expected) => {
      // Arrange
      const matches = ownedWordMatcher(word);

      // Act
      const isNamed = matches(text);

      // Assert
      expect(isNamed).toBe(expected);
    },
  );
});
