import type { InstalledPlugin } from '../../domain/entities';

interface PluginRegistry {
  readonly installed: () => InstalledPlugin | undefined;
}

export type { PluginRegistry };
