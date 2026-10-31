import type { ConfigModuleLoader, ConfigOfMode } from '../application/contracts';
import { ConfigModuleError, ConfigModuleFailure } from '../domain/config-module/errors';
import type { ThemeMode } from '../domain/theme-mode/entities';

const PARENT_PREFIX = '../';

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
