import type { InstalledPlugin } from '../../domain/installed-plugin/entities';

interface PluginRegistry {
  readonly installed: () => InstalledPlugin | undefined;
}

export type { PluginRegistry };
