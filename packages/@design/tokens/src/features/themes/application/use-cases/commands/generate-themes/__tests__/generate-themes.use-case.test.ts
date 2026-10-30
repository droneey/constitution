import { describe, expect, it } from 'bun:test';

import { createFakeConfigModuleLoader } from '../../../../../__tests__/config-module-loader.fake';
import { createFakeThemeBuilder } from '../../../../../__tests__/theme-builder.fake';
import { createFakeThemeModeReader } from '../../../../../__tests__/theme-mode-reader.fake';
import type { ThemeMode, ThemeModeFiles } from '../../../../../domain/entities';
import { ConfigModuleError, ConfigModuleFailure } from '../../../../../domain/errors';
import { AbsolutePath } from '../../../../../domain/value-objects';
import { createGenerateThemes } from '../generate-themes.use-case';

const CONFIG_PATH = 'style-dictionary.config.ts';

const configOf = ({ name }: ThemeMode): Pick<ThemeMode, 'name'> => ({
  name,
});

const modes: readonly ThemeModeFiles[] = [
  {
    name: 'light',
    isDefault: true,
    sharedPaths: [
      AbsolutePath.create('/tokens/color.tokens.json'),
    ],
    ownPaths: [
      AbsolutePath.create('/tokens/theme/light.tokens.json'),
    ],
  },
];

describe('createGenerateThemes', () => {
  it("should build every mode the tokens define with the platform module's configuration", async () => {
    // Arrange
    const builder = createFakeThemeBuilder();

    // Act
    await createGenerateThemes({
      builder,
      loader: createFakeConfigModuleLoader(CONFIG_PATH, configOf),
      modeReader: createFakeThemeModeReader(modes),
    })(CONFIG_PATH);

    // Assert
    expect(builder.builds).toStrictEqual([
      {
        configs: [
          {
            name: 'light',
          },
        ],
        modes,
      },
    ]);
  });

  it('should pass the refusal on when the platform module is refused', async () => {
    // Act
    const refusal = await createGenerateThemes({
      builder: createFakeThemeBuilder(),
      loader: createFakeConfigModuleLoader(CONFIG_PATH, configOf),
      modeReader: createFakeThemeModeReader(modes),
    })('../outside.config.ts').catch((error: unknown) => error);

    // Assert
    expect(refusal).toStrictEqual(
      new ConfigModuleError({
        code: ConfigModuleFailure.OutsideWorkingFolder,
        configPath: '../outside.config.ts',
      }),
    );
  });

  it('should pass the refusal on when the platform module gives a mode no configuration', async () => {
    // Act
    const refusal = await createGenerateThemes({
      builder: createFakeThemeBuilder(),
      loader: createFakeConfigModuleLoader(CONFIG_PATH, () => 'style-dictionary.config.json'),
      modeReader: createFakeThemeModeReader(modes),
    })(CONFIG_PATH).catch((error: unknown) => error);

    // Assert
    expect(refusal).toStrictEqual(
      new ConfigModuleError({
        code: ConfigModuleFailure.ReturnsNoObject,
        modeName: 'light',
      }),
    );
  });
});
