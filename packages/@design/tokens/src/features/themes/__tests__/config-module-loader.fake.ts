import type { ConfigModuleLoader, ConfigOfMode } from '../domain/contracts';
import type { ThemeMode } from '../domain/entities';
import { ConfigModuleError, ConfigModuleFailure } from '../domain/errors';

const PARENT_PREFIX = '../';

/**
 * a loader that holds one module, at `configPath`, whose default export is `exportedConfigOf`: a
 * path that leads out of the working folder is outside it, and any other it does not hold has
 * nothing at it
 */
const createFakeConfigModuleLoader = (
  configPath: string,
  exportedConfigOf: (mode: ThemeMode) => unknown,
): ConfigModuleLoader => ({
  load: (path): Promise<ConfigOfMode> => {
    if (path === configPath) {
      return Promise.resolve((mode) => {
        const config = exportedConfigOf(mode);

        if (typeof config !== 'object' || config === null || Array.isArray(config)) {
          throw new ConfigModuleError({
            code: ConfigModuleFailure.ReturnsNoObject,
            modeName: mode.name,
          });
        }

        return config;
      });
    }

    return Promise.reject(
      new ConfigModuleError({
        code: path.startsWith(PARENT_PREFIX)
          ? ConfigModuleFailure.OutsideWorkingFolder
          : ConfigModuleFailure.NotFound,
        configPath: path,
      }),
    );
  },
});

export { createFakeConfigModuleLoader };
