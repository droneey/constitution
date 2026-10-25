import type { InstalledPlugin } from '../entities';

interface PluginRegistry {
  readonly installed: () => InstalledPlugin | undefined;
}

export type { PluginRegistry };
