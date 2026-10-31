import { describe, expect, it } from 'bun:test';

import { failureOf } from '#/__tests__/failure.fixtures';

import { themeModeReaderSuite } from '../../../__tests__/theme-mode-reader.suite';
import { UnknownDefaultModeError } from '../../../domain/theme-mode/errors';
import { AbsolutePath } from '../../../domain/theme-mode/value-objects';
import { createResolverThemeModeReader } from '../resolver-theme-mode-reader.adapter';
import { designResolver, designResolverUrl, resolverWithDefault } from './resolver.fixtures';

themeModeReaderSuite({
  implementationName: 'createResolverThemeModeReader',
  readerOfScenario: () =>
    createResolverThemeModeReader({
      resolver: designResolver,
      resolverUrl: designResolverUrl,
    }),
});

describe('createResolverThemeModeReader', () => {
  it("should give each mode of the theme the files of every set and of its own context, resolved from the resolver's URL", () => {
    // Arrange
    const reader = createResolverThemeModeReader({
      resolver: designResolver,
      resolverUrl: designResolverUrl,
    });
    const sharedPaths = [
      AbsolutePath.create('/design/tokens/color.tokens.json'),
      AbsolutePath.create('/design/tokens/size.tokens.json'),
      AbsolutePath.create('/design/tokens/motion/motion.tokens.json'),
    ];

    // Act
    const modes = reader.read();

    // Assert
    expect(
      modes.map((mode) => ({
        name: mode.name,
        sharedPaths: mode.sharedPaths,
        ownPaths: mode.ownPaths,
      })),
    ).toStrictEqual([
      {
        name: 'light',
        sharedPaths,
        ownPaths: [
          AbsolutePath.create('/design/tokens/theme/light.tokens.json'),
        ],
      },
      {
        name: 'dark',
        sharedPaths,
        ownPaths: [
          AbsolutePath.create('/design/tokens/theme/dark.tokens.json'),
          AbsolutePath.create('/design/shared/dark.tokens.json'),
        ],
      },
    ]);
  });

  it.each([
    'dim',
    'toString',
  ])('should refuse the tokens when their default, %s, names no context', (modeName) => {
    // Arrange
    const reader = createResolverThemeModeReader({
      resolver: resolverWithDefault(modeName),
      resolverUrl: designResolverUrl,
    });

    // Act
    const failure = failureOf(() => reader.read());

    // Assert
    expect(failure).toStrictEqual(new UnknownDefaultModeError(modeName));
  });
});
