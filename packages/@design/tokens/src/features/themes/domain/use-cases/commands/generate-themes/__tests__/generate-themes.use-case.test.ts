import { describe, expect, it } from 'bun:test';

import { createFakeConfigModuleLoader } from '../../../../../__tests__/config-module-loader.fake';
import { createFakeThemeBuilder } from '../../../../../__tests__/theme-builder.fake';
import { createFakeThemeModeReader } from '../../../../../__tests__/theme-mode-reader.fake';
import type { ThemeMode, ThemeModeFiles } from '../../../../entities';
import { ConfigModuleError, ConfigModuleFailure } from '../../../../errors';
import { AbsolutePath } from '../../../../value-objects';
import { generateThemes } from '../generate-themes.use-case';

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

describe('generateThemes', () => {
  it("should build every mode the tokens define with the platform module's configuration", async () => {
    // Arrange
    const builder = createFakeThemeBuilder();

    // Act
    await generateThemes({
      builder,
      configPath: CONFIG_PATH,
      loader: createFakeConfigModuleLoader(CONFIG_PATH, configOf),
      modeReader: createFakeThemeModeReader(modes),
    });

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
    const refusal = await generateThemes({
      builder: createFakeThemeBuilder(),
      configPath: '../outside.config.ts',
      loader: createFakeConfigModuleLoader(CONFIG_PATH, configOf),
      modeReader: createFakeThemeModeReader(modes),
    }).catch((error: unknown) => error);

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
    const refusal = await generateThemes({
      builder: createFakeThemeBuilder(),
      configPath: CONFIG_PATH,
      loader: createFakeConfigModuleLoader(CONFIG_PATH, () => 'style-dictionary.config.json'),
      modeReader: createFakeThemeModeReader(modes),
    }).catch((error: unknown) => error);

    // Assert
    expect(refusal).toStrictEqual(
      new ConfigModuleError({
        code: ConfigModuleFailure.ReturnsNoObject,
        modeName: 'light',
      }),
    );
  });
});
