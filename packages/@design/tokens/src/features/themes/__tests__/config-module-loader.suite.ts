import { describe, expect, it } from 'bun:test';

import type { ConfigModuleLoader } from '../domain/contracts';
import { ConfigModuleError, ConfigModuleFailure } from '../domain/errors';

/** where every scenario's working folder holds its module */
const SCENARIO_CONFIG_PATH = 'style-dictionary.config.ts';

/** where every scenario's module outside the working folder lies, from inside it */
const OUTSIDE_CONFIG_PATH = '../outside.config.ts';

/** where nothing lies inside every scenario's working folder */
const MISSING_CONFIG_PATH = 'missing.config.ts';

/** where nothing lies either, since the path leads through the scenario's module as if it were a folder */
const THROUGH_FILE_CONFIG_PATH = 'style-dictionary.config.ts/inner.config.ts';

/** where nothing lies beside every scenario's working folder, from inside it */
const MISSING_OUTSIDE_CONFIG_PATH = '../missing.config.ts';

/** the mode every scenario's module gives a text in place of its configuration */
const UNCONFIGURED_MODE_NAME = 'unconfigured';

/** the details of a refusal, which every implementation gives alike whatever the cause it keeps */
const detailsOf = (error: unknown): unknown =>
  error instanceof ConfigModuleError ? error.details : error;

/** the details of what a call throws, or undefined when it throws nothing */
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
  /**
   * a loader whose working folder holds, at `SCENARIO_CONFIG_PATH`, a module whose default export
   * gives a mode `{ name }` of the mode's name, save `UNCONFIGURED_MODE_NAME`, which it gives a
   * text, and beside which lies `OUTSIDE_CONFIG_PATH`
   */
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
