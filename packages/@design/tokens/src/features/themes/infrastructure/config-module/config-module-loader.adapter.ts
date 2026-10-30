import { pathToFileURL } from 'node:url';

import { confinedPathOf, isMissingPathError } from '#/libs/paths';

import type { ConfigModuleLoader, ConfigOfMode } from '../../application/contracts';
import { ConfigModuleError, ConfigModuleFailure } from '../../domain/config-module/errors';
import type { ThemeMode } from '../../domain/theme-mode/entities';
import type { AbsolutePath } from '../../domain/theme-mode/value-objects';

interface ConfigModuleLoaderInput {
  readonly workingFolderPath: AbsolutePath;
}

type ExportedConfigOfMode = (mode: ThemeMode) => unknown;

// Why: any function can take a mode, and what it returns is checked later.
const isExportedConfigOfMode = (candidate: unknown): candidate is ExportedConfigOfMode =>
  typeof candidate === 'function';

// Why: Style Dictionary parses the fields itself.
const isConfigObject = (candidate: unknown): candidate is object =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

/**
 * @throws {ConfigModuleError} from the function it gives, when the export returns no object
 * for a mode
 */
const checkedConfigOf =
  (exportedConfigOf: ExportedConfigOfMode): ConfigOfMode =>
  (mode): object => {
    const config = exportedConfigOf(mode);

    if (!isConfigObject(config)) {
      throw new ConfigModuleError({
        code: ConfigModuleFailure.ReturnsNoObject,
        modeName: mode.name,
      });
    }

    return config;
  };

/** @throws {ConfigModuleError} when nothing lies at a path inside the working folder */
const confinedConfigPathOf = (
  workingFolderPath: AbsolutePath,
  configPath: string,
): string | undefined => {
  try {
    return confinedPathOf({
      rootPath: workingFolderPath,
      givenPath: configPath,
    });
  } catch (error) {
    if (isMissingPathError(error)) {
      throw new ConfigModuleError(
        {
          code: ConfigModuleFailure.NotFound,
          configPath,
        },
        {
          cause: error,
        },
      );
    }

    throw error;
  }
};

// Why: a module's code runs as it is imported, so only one inside the working folder is.
const createConfigModuleLoader = ({
  workingFolderPath,
}: ConfigModuleLoaderInput): ConfigModuleLoader => ({
  /**
   * @throws {ConfigModuleError} when nothing lies at the path, or the module lies outside the
   * working folder or exports no function
   */
  load: async (configPath): Promise<ConfigOfMode> => {
    const configRealPath = confinedConfigPathOf(workingFolderPath, configPath);

    if (configRealPath === undefined) {
      throw new ConfigModuleError({
        code: ConfigModuleFailure.OutsideWorkingFolder,
        configPath,
      });
    }

    const {
      default: defaultExport,
    }: {
      readonly default?: unknown;
    } = await import(pathToFileURL(configRealPath).href);

    if (!isExportedConfigOfMode(defaultExport)) {
      throw new ConfigModuleError({
        code: ConfigModuleFailure.ExportsNoFunction,
        configPath,
      });
    }

    return checkedConfigOf(defaultExport);
  },
});

export { createConfigModuleLoader };
