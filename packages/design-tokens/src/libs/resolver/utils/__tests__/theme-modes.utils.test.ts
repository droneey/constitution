import { describe, expect, it } from 'bun:test';

import { themeModesOf } from '../theme-modes.utils';
import { designResolver, RESOLVER_URL } from './theme-modes.fixtures';

describe('themeModesOf', () => {
  it("should give each mode of the theme the files of every set and of its own context, resolved from the resolver's URL, and mark the default", () => {
    // Arrange
    const resolver = designResolver;
    const shared = [
      '/design/tokens/color.tokens.json',
      '/design/tokens/size.tokens.json',
      '/design/tokens/motion/motion.tokens.json',
    ];

    // Act
    const modes = themeModesOf(resolver, RESOLVER_URL);

    // Assert
    expect(modes).toStrictEqual([
      {
        name: 'light',
        isDefault: false,
        shared,
        own: [
          '/design/tokens/theme/light.tokens.json',
        ],
      },
      {
        name: 'dark',
        isDefault: true,
        shared,
        own: [
          '/design/tokens/theme/dark.tokens.json',
          '/design/shared/dark.tokens.json',
        ],
      },
    ]);
  });
});
