import type { Version } from '#/kernel/value-objects';

interface InstalledPlugin {
  readonly fingerprint?: string;
  readonly version: Version;
}

export type { InstalledPlugin };
