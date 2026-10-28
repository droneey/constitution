import type { ConfigModuleError } from '../errors';
import type { ConfigOfMode } from './config-of-mode.port';

interface ConfigModuleLoader {
  /**
   * The function the module's default export is, which throws {@link ConfigModuleError} when it
   * returns no object for a mode.
   *
   * @throws {@link ConfigModuleError} when nothing lies at the path, or the module lies outside the
   * working folder or exports no function
   */
  readonly load: (configPath: string) => Promise<ConfigOfMode>;
}

export type { ConfigModuleLoader };
