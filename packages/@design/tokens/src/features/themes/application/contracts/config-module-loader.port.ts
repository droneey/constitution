import type { ConfigOfMode } from './config-of-mode.port';

interface ConfigModuleLoader {
  /**
   * @throws {ConfigModuleError} when nothing lies at the path, or the module lies outside the
   * working folder or exports no function; the function it gives throws it when it returns no
   * object for a mode
   */
  readonly load: (configPath: string) => Promise<ConfigOfMode>;
}

export type { ConfigModuleLoader };
