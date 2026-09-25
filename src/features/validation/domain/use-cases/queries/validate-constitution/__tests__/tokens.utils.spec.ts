import { describe, expect, it } from 'bun:test';

import { containsToken } from '../tokens.utils';

describe('containsToken', () => {
  it('should match a whole word, also before punctuation', () => {
    // Act
    const found = [
      containsToken({
        text: 'Use React.',
        token: 'React',
      }),
      containsToken({
        text: 'Use Reactive streams',
        token: 'React',
      }),
      containsToken({
        text: 'see react-dom/client',
        token: 'react-dom',
      }),
      containsToken({
        text: 'see react-dom-extra',
        token: 'react-dom',
      }),
    ];

    // Assert
    expect(found).toStrictEqual([
      true,
      false,
      true,
      false,
    ]);
  });

  it('should match an extension at the end of a file name', () => {
    // Act
    const found = [
      containsToken({
        text: 'write chat.entity.ts here',
        token: '.ts',
      }),
      containsToken({
        text: 'write chat.entity.tsx here',
        token: '.ts',
      }),
    ];

    // Assert
    expect(found).toStrictEqual([
      true,
      false,
    ]);
  });
});
