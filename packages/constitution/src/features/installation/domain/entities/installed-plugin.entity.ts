import type { Version } from '#/kernel/value-objects';

interface InstalledPlugin {
  /** absent when the plugin's files cannot be read */
  readonly fingerprint?: string;
  readonly version: Version;
}

export type { InstalledPlugin };
