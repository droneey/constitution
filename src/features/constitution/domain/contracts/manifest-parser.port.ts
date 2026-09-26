import type {
  HooksManifest,
  ManifestRead,
  MarketplaceManifest,
  PluginManifest,
} from '../entities';

interface ManifestParser {
  hooks: (json: string) => ManifestRead<HooksManifest>;
  marketplace: (json: string) => ManifestRead<MarketplaceManifest>;
  plugin: (json: string) => ManifestRead<PluginManifest>;
}

export type { ManifestParser };
