import { pathToFileURL } from 'node:url';

import { confinedPathOf, isMissingPathError } from '#/libs/paths';

import type { ConfigModuleLoader, ConfigOfMode } from '../../domain/contracts';
import type { ThemeMode } from '../../domain/entities';
import { ConfigModuleError, ConfigModuleFailure } from '../../domain/errors';
import type { AbsolutePath } from '../../domain/value-objects';

interface ConfigModuleLoaderInput {
  /** the folder the generation runs in, which a module must lie in */
  readonly workingFolderPath: AbsolutePath;
}

type ExportedConfigOfMode = (mode: ThemeMode) => unknown;

/** Any function can be given a mode; what it returns is checked once it has. */
const isExportedConfigOfMode = (candidate: unknown): candidate is ExportedConfigOfMode =>
  typeof candidate === 'function';

/** Style Dictionary parses the configuration's fields itself. */
const isConfigObject = (candidate: unknown): candidate is object =>
  typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);

/** @throws {@link ConfigModuleError} from the function it gives, when the export returns no object for a mode */
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

/**
 * The real path of the module, or undefined when it lies outside the working folder.
 *
 * @throws {@link ConfigModuleError} when nothing lies at a path inside the working folder
 */
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

/** A module's code runs as it is imported, so only a module inside the working folder is. */
const createConfigModuleLoader = ({
  workingFolderPath,
}: ConfigModuleLoaderInput): ConfigModuleLoader => ({
  load: async (configPath): Promise<ConfigOfMode> => {
    const configRealPath = confinedConfigPathOf(workingFolderPath, configPath);

    if (configRealPath === undefined) {
      throw new ConfigModuleError({
        code: ConfigModuleFailure.OutsideWorkingFolder,
        configPath,
      });
    }

    // A dynamic import gives the module's namespace, an object whatever the module exports.
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
