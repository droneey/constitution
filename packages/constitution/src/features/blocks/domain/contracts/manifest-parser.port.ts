import type { HooksManifest, ManifestRead, MarketplaceManifest, PluginManifest } from '../entities';

interface ManifestParser {
  readonly hooks: (json: string) => ManifestRead<HooksManifest>;
  readonly marketplace: (json: string) => ManifestRead<MarketplaceManifest>;
  readonly plugin: (json: string) => ManifestRead<PluginManifest>;
}

export type { ManifestParser };
