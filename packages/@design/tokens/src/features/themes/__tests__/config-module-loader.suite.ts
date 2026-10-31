import { describe, expect, it } from 'bun:test';

import type { ConfigModuleLoader } from '../application/contracts';
import { ConfigModuleError, ConfigModuleFailure } from '../domain/config-module/errors';

const SCENARIO_CONFIG_PATH = 'style-dictionary.config.ts';

const OUTSIDE_CONFIG_PATH = '../outside.config.ts';

const MISSING_CONFIG_PATH = 'missing.config.ts';

const THROUGH_FILE_CONFIG_PATH = 'style-dictionary.config.ts/inner.config.ts';

const MISSING_OUTSIDE_CONFIG_PATH = '../missing.config.ts';

const UNCONFIGURED_MODE_NAME = 'unconfigured';

const detailsOf = (error: unknown): unknown =>
  error instanceof ConfigModuleError ? error.details : error;

const refusalOf = (call: () => unknown): unknown => {
  try {
    call();
  } catch (error) {
    return detailsOf(error);
  }

  return undefined;
};

interface ConfigModuleLoaderSuiteInput {
  readonly implementationName: string;
  readonly loaderOfScenario: () => ConfigModuleLoader;
}

const configModuleLoaderSuite = (input: ConfigModuleLoaderSuiteInput): void => {
  describe(`the ConfigModuleLoader contract, kept by ${input.implementationName}`, () => {
    it("should give the function the module's default export is", async () => {
      // Arrange
      const loader = input.loaderOfScenario();

      // Act
      const configOf = await loader.load(SCENARIO_CONFIG_PATH);

      // Assert
      expect(
        configOf({
          name: 'dark',
          isDefault: true,
        }),
      ).toStrictEqual({
        name: 'dark',
      });
    });

    it('should give a function that refuses a mode whose configuration is no object', async () => {
      // Arrange
      const configOf = await input.loaderOfScenario().load(SCENARIO_CONFIG_PATH);

      // Act
      const refusal = refusalOf(() =>
        configOf({
          name: UNCONFIGURED_MODE_NAME,
          isDefault: false,
        }),
      );

      // Assert
      expect(refusal).toStrictEqual({
        code: ConfigModuleFailure.ReturnsNoObject,
        modeName: UNCONFIGURED_MODE_NAME,
      });
    });

    it('should refuse a module outside the working folder', async () => {
      // Arrange
      const loader = input.loaderOfScenario();

      // Act
      const refusal = await loader.load(OUTSIDE_CONFIG_PATH).catch(detailsOf);

      // Assert
      expect(refusal).toStrictEqual({
        code: ConfigModuleFailure.OutsideWorkingFolder,
        configPath: OUTSIDE_CONFIG_PATH,
      });
    });

    it('should refuse a path outside the working folder without telling whether anything lies there', async () => {
      // Arrange
      const loader = input.loaderOfScenario();

      // Act
      const refusal = await loader.load(MISSING_OUTSIDE_CONFIG_PATH).catch(detailsOf);

      // Assert
      expect(refusal).toStrictEqual({
        code: ConfigModuleFailure.OutsideWorkingFolder,
        configPath: MISSING_OUTSIDE_CONFIG_PATH,
      });
    });

    it.each([
      MISSING_CONFIG_PATH,
      THROUGH_FILE_CONFIG_PATH,
    ])('should refuse %s, at which nothing lies', async (configPath) => {
      // Arrange
      const loader = input.loaderOfScenario();

      // Act
      const refusal = await loader.load(configPath).catch(detailsOf);

      // Assert
      expect(refusal).toStrictEqual({
        code: ConfigModuleFailure.NotFound,
        configPath,
      });
    });
  });
};

export {
  configModuleLoaderSuite,
  MISSING_CONFIG_PATH,
  OUTSIDE_CONFIG_PATH,
  refusalOf,
  SCENARIO_CONFIG_PATH,
  UNCONFIGURED_MODE_NAME,
};
